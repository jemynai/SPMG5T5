from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services.firebase import Firebase
from datetime import datetime

hr_view_bp = Blueprint('hr_view_ttbl', __name__)
CORS(hr_view_bp)

db = Firebase().get_db()

@hr_view_bp.route('/departments', methods=['GET'])
def get_departments():
    try:
        departments = set()
        users_ref = db.collection('users')
        docs = users_ref.stream()
        
        for doc in docs:
            employee_data = doc.to_dict()
            dept = employee_data.get('dept')
            if dept:
                departments.add(dept)
        
        departments_list = sorted(list(departments))
        return jsonify({"departments": departments_list}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch departments: {str(e)}"}), 500

@hr_view_bp.route('/employees', methods=['GET'])
def get_employees():
    try:
        query = db.collection('users')
        
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')

        if department and department != 'All':
            query = query.where('dept', '==', department)
        if status and status != 'All':
            query = query.where('status', '==', status.lower())

        docs = query.stream()
        
        employees = []
        for doc in docs:
            raw_data = doc.to_dict()
            
            # Use document ID as the userID if not explicitly set
            user_id = doc.id
            
            # Construct full name
            first_name = raw_data.get('first_name', '')
            last_name = raw_data.get('last_name', '')
            full_name = ' '.join(filter(None, [first_name, last_name]))
            if not full_name:
                full_name = 'Unknown'

            # Transform data with your specific fields
            employee_data = {
                'id': user_id,
                'name': full_name,
                'department': raw_data.get('dept', 'Unassigned'),
                'team': raw_data.get('position', 'Unassigned'),
                'status': raw_data.get('status', 'office'),
                'manager': raw_data.get('rpt_manager', 'Unassigned'),
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
                    employee_data['name'],
                    employee_data['department'],
                    employee_data['position'],
                    employee_data['email'],
                    employee_data['country']
                ]
                if not any(search_term in str(field).lower() for field in search_fields if field):
                    continue
            
            employees.append(employee_data)

        return jsonify({"employees": employees}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch employees: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/status', methods=['PUT'])
def update_status(employee_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({"error": "Status is required"}), 400
        
        if new_status not in ['office', 'remote']:
            return jsonify({"error": "Invalid status value"}), 400

        # Update directly using the employee_id as document ID
        employee_ref = db.collection('users').document(employee_id)
        employee_doc = employee_ref.get()
        
        if not employee_doc.exists:
            return jsonify({"error": "Employee not found"}), 404

        employee_data = employee_doc.to_dict()

        # Update status
        employee_ref.update({
            'status': new_status,
            'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
        # Add to schedule history
        schedule_ref = db.collection('schedules').document()
        schedule_ref.set({
            'employee_id': employee_id,  # Use document ID consistently
            'date': datetime.now().strftime('%Y-%m-%d'),
            'status': new_status,
            'hours': '9:00-17:00',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'first_name': employee_data.get('first_name', ''),
            'last_name': employee_data.get('last_name', ''),
            'department': employee_data.get('dept', 'Unassigned')
        })
        
        return jsonify({"message": f"Status updated to {new_status}"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to update status: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/schedule', methods=['GET'])
def get_schedule(employee_id):
    try:
        # Get the employee document directly using employee_id
        employee_ref = db.collection('users').document(employee_id)
        employee_doc = employee_ref.get()
        
        if not employee_doc.exists:
            return jsonify({"error": "Employee not found"}), 404

        # Get date parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Query schedule collection using employee_id
        query = db.collection('schedules').where('employee_id', '==', employee_id)
        
        if start_date:
            query = query.where('date', '>=', start_date)
        if end_date:
            query = query.where('date', '<=', end_date)

        query = query.order_by('date', direction='DESCENDING')
        schedule_docs = query.stream()
        
        schedules = []
        for doc in schedule_docs:
            schedule_data = doc.to_dict()
            schedules.append({
                'date': schedule_data.get('date'),
                'hours': schedule_data.get('hours', '9:00-17:00'),
                'status': schedule_data.get('status', 'office'),
                'department': schedule_data.get('department', 'Unassigned')
            })

        return jsonify({"schedules": schedules}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch schedule: {str(e)}"}), 500