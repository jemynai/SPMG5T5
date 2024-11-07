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
employees_cache = None
employees_cache_time = None
arrangements_cache = None
arrangements_cache_time = None
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

def fetch_current_arrangements():
    """Fetch current arrangements from database"""
    current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    arrangements = set()  # Using set for faster lookups
    
    arrangements_ref = db.collection('arrangements')\
        .where('date', '==', current_date)
    
    docs = arrangements_ref.stream()
    for doc in docs:
        arrangement_data = doc.to_dict()
        employee_id = arrangement_data.get('employee_id')
        if employee_id:
            arrangements.add(employee_id)
    
    return arrangements

def fetch_all_employees():
    """Fetch all employees from database and format them"""
    global arrangements_cache, arrangements_cache_time
    
    # Fetch or use cached arrangements
    current_time = datetime.now().timestamp()
    if not arrangements_cache or not arrangements_cache_time or \
       (current_time - arrangements_cache_time) > CACHE_DURATION:
        arrangements_cache = fetch_current_arrangements()
        arrangements_cache_time = current_time
    
    employees = []
    users_ref = db.collection('users').limit(1000)
    docs = users_ref.stream()
    
    for doc in docs:
        raw_data = doc.to_dict()
        first_name = raw_data.get('first_name', '')
        last_name = raw_data.get('last_name', '')
        full_name = ' '.join(filter(None, [first_name, last_name])) or 'Unknown'
        
        # Determine status based on arrangements
        status = 'remote' if doc.id in arrangements_cache else 'office'
        
        employee_data = {
            'id': doc.id,
            'name': full_name,
            'department': raw_data.get('dept', 'Unassigned'),
            'team': raw_data.get('position', 'Unassigned'),
            'status': status,
            'email': raw_data.get('email', ''),
            'country': raw_data.get('country', 'Unassigned'),
            'role': raw_data.get('role', 'Unassigned'),
            'position': raw_data.get('position', 'Unassigned')
        }
        employees.append(employee_data)
    
    return employees

def apply_filters(employees, department=None, status=None, search=None):
    """Apply filters to the employees list"""
    filtered = employees.copy()
    
    if department and department != 'All':
        filtered = [e for e in filtered if e['department'] == department]
    
    if status and status.lower() != 'all':
        filtered = [e for e in filtered if e['status'] == status.lower()]
    
    if search:
        search_term = search.lower()
        filtered = [e for e in filtered if any(
            search_term in str(value).lower() 
            for value in [e['id'], e['name'], e['department'], 
                         e['email'], e['country'], e['position']]
        )]
    
    return filtered

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

        # If employees are cached, extract departments from there
        if employees_cache and employees_cache_time and \
           (current_time - employees_cache_time) < CACHE_DURATION:
            departments = sorted(list(set(e['department'] for e in employees_cache)))
        else:
            # Fallback to database query
            departments = set()
            users_ref = db.collection('users').limit(1000)
            docs = users_ref.stream()
            
            for doc in docs:
                employee_data = doc.to_dict()
                dept = employee_data.get('dept')
                if dept:
                    departments.add(dept)
            departments = sorted(list(departments))
        
        # Update cache
        departments_cache = departments
        departments_cache_time = current_time
        
        return jsonify({"departments": departments}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch departments: {str(e)}"}), 500

@hr_view_bp.route('/employees', methods=['GET'])
@rate_limit()
def get_employees():
    global employees_cache, employees_cache_time
    
    try:
        current_time = datetime.now().timestamp()
        
        # Fetch all employees if cache is empty or expired
        if not employees_cache or not employees_cache_time or \
           (current_time - employees_cache_time) > CACHE_DURATION:
            employees_cache = fetch_all_employees()
            employees_cache_time = current_time
        
        # Get filter parameters
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)
        
        # Apply filters
        filtered_employees = apply_filters(employees_cache, department, status, search)
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_employees = filtered_employees[start_idx:end_idx]
        
        return jsonify({
            "employees": paginated_employees,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "has_more": len(filtered_employees) > end_idx
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch employees: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/status', methods=['PUT'])
@rate_limit()
def update_status(employee_id):
    global employees_cache, employees_cache_time, arrangements_cache, arrangements_cache_time
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
        current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # Update arrangements based on status
        if new_status == 'remote':
            # Add to arrangements if remote
            arrangement_ref = db.collection('arrangements').document()
            arrangement_ref.set({
                'employee_id': employee_id,
                'date': current_date,
                'shift': 'am',  # default shift
                'supervisors': '130002'  # default supervisor
            })
        else:
            # Remove from arrangements if office
            arrangements_ref = db.collection('arrangements')\
                .where('date', '==', current_date)\
                .where('employee_id', '==', employee_id)
            
            docs = arrangements_ref.stream()
            for doc in docs:
                doc.reference.delete()

        # Invalidate caches
        arrangements_cache = None
        arrangements_cache_time = None
        employees_cache = None
        employees_cache_time = None
        
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

        # Build query for arrangements
        query = db.collection('arrangements').where('employee_id', '==', employee_id)
        
        if start_date:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.where('date', '>=', start_datetime)
        if end_date:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.where('date', '<=', end_datetime)

        # Limit results and order
        query = query.order_by('date', direction='DESCENDING').limit(100)
        arrangement_docs = query.stream()
        
        schedules = []
        for doc in arrangement_docs:
            arrangement_data = doc.to_dict()
            schedules.append({
                'date': arrangement_data.get('date').strftime('%Y-%m-%d'),
                'hours': '9:00-17:00',  # Default hours
                'status': 'remote',
                'department': employee_doc.get().to_dict().get('dept', 'Unassigned')
            })

        return jsonify({"schedules": schedules}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch schedule: {str(e)}"}), 500