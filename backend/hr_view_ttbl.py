from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services.firebase import Firebase
from datetime import datetime, timedelta
from functools import wraps

hr_view_bp = Blueprint('hr_view_ttbl', __name__)
CORS(hr_view_bp)

db = Firebase().get_db()

# Cache setup
departments_cache = None
departments_cache_time = None
CACHE_DURATION = 3600  # 1 hour in seconds

def rate_limit(max_requests=100, window=60):  # 100 requests per minute
    def decorator(f):
        requests = {}
        @wraps(f)
        def wrapped(*args, **kwargs):
            now = datetime.now()
            cleanup_time = now - timedelta(seconds=window)
            
            # Cleanup old requests
            requests_copy = dict(requests)
            for timestamp in requests_copy:
                if timestamp < cleanup_time:
                    del requests[timestamp]
            
            # Check rate limit
            if len(requests) >= max_requests:
                return jsonify({"error": "Rate limit exceeded"}), 429
            
            requests[now] = True
            return f(*args, **kwargs)
        return wrapped
    return decorator

@hr_view_bp.route('/departments', methods=['GET'])
@rate_limit()
def get_departments():
    global departments_cache, departments_cache_time
    
    try:
        # Return cached departments if available
        current_time = datetime.now().timestamp()
        if departments_cache and departments_cache_time and \
           (current_time - departments_cache_time) < CACHE_DURATION:
            return jsonify({"departments": departments_cache}), 200

        departments = set()
        users_ref = db.collection('users').limit(1000)
        docs = users_ref.stream()
        
        for doc in docs:
            employee_data = doc.to_dict()
            dept = employee_data.get('dept')
            if dept:
                departments.add(dept)
        
        departments_list = sorted(list(departments))
        
        # Update cache
        departments_cache = departments_list
        departments_cache_time = current_time
        
        return jsonify({"departments": departments_list}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch departments: {str(e)}"}), 500

@hr_view_bp.route('/employees', methods=['GET'])
@rate_limit()
def get_employees():
    try:
        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)  # Limit max items per page
        
        # Build query
        query = db.collection('users')
        
        # Apply filters
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')

        # Add indexed filters
        if department and department != 'All':
            query = query.where('dept', '==', department)
        if status and status.lower() != 'all':
            query = query.where('status', '==', status.lower())

        # Add ordering for consistent pagination
        query = query.order_by('last_name')
        
        # Apply pagination
        start = (page - 1) * per_page
        query = query.limit(per_page).offset(start)
        
        # Execute query
        docs = query.stream()
        
        employees = []
        for doc in docs:
            raw_data = doc.to_dict()
            
            # Construct employee data
            first_name = raw_data.get('first_name', '')
            last_name = raw_data.get('last_name', '')
            full_name = ' '.join(filter(None, [first_name, last_name])) or 'Unknown'
            
            employee_data = {
                'id': doc.id,
                'name': full_name,
                'department': raw_data.get('dept', 'Unassigned'),
                'team': raw_data.get('position', 'Unassigned'),
                'status': raw_data.get('status', 'office').lower(),
                'email': raw_data.get('email', ''),
                'country': raw_data.get('country', 'Unassigned'),
                'role': raw_data.get('role', 'Unassigned'),
                'position': raw_data.get('position', 'Unassigned')
            }
            
            # Apply search filter if exists
            if search:
                search_term = search.lower()
                search_fields = [
                    str(employee_data['id']),
                    employee_data['name'].lower(),
                    employee_data['department'].lower(),
                    employee_data['email'].lower(),
                    employee_data['country'].lower(),
                    employee_data['position'].lower()
                ]
                if not any(search_term in field for field in search_fields):
                    continue
            
            employees.append(employee_data)

        return jsonify({
            "employees": employees,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "has_more": len(employees) == per_page
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch employees: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/status', methods=['PUT'])
@rate_limit()
def update_status(employee_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({"error": "Status is required"}), 400
        
        if new_status not in ['office', 'remote']:
            return jsonify({"error": "Invalid status value"}), 400

        # Get employee document
        employee_ref = db.collection('users').document(employee_id)
        employee_doc = employee_ref.get()
        
        if not employee_doc.exists:
            return jsonify({"error": "Employee not found"}), 404

        employee_data = employee_doc.to_dict()

        # Update status in transaction
        @db.transaction
        def update_employee_status(transaction):
            # Update employee status
            transaction.update(employee_ref, {
                'status': new_status.lower(),
                'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
            # Add schedule history
            schedule_ref = db.collection('schedules').document()
            transaction.set(schedule_ref, {
                'employee_id': employee_id,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'status': new_status.lower(),
                'hours': '9:00-17:00',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'first_name': employee_data.get('first_name', ''),
                'last_name': employee_data.get('last_name', ''),
                'department': employee_data.get('dept', 'Unassigned')
            })

        update_employee_status()
        return jsonify({"message": f"Status updated to {new_status}"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to update status: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/schedule', methods=['GET'])
@rate_limit()
def get_schedule(employee_id):
    try:
        # Verify employee exists
        employee_ref = db.collection('users').document(employee_id)
        employee_doc = employee_ref.get()
        
        if not employee_doc.exists:
            return jsonify({"error": "Employee not found"}), 404

        # Get date parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Build query
        query = db.collection('schedules').where('employee_id', '==', employee_id)
        
        if start_date:
            query = query.where('date', '>=', start_date)
        if end_date:
            query = query.where('date', '<=', end_date)

        # Limit results and order
        query = query.order_by('date', direction='DESCENDING').limit(100)
        schedule_docs = query.stream()
        
        schedules = []
        for doc in schedule_docs:
            schedule_data = doc.to_dict()
            schedules.append({
                'date': schedule_data.get('date'),
                'hours': schedule_data.get('hours', '9:00-17:00'),
                'status': schedule_data.get('status', 'office').lower(),
                'department': schedule_data.get('department', 'Unassigned')
            })

        return jsonify({"schedules": schedules}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch schedule: {str(e)}"}), 500