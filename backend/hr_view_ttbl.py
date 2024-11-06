from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services.firebase import Firebase
from datetime import datetime

# Create Blueprint
hr_view_bp = Blueprint('hr_view_ttbl', __name__)
CORS(hr_view_bp)

# Initialize Firestore DB
db = Firebase().get_db()

@hr_view_bp.route('/employees', methods=['GET'])
def get_employees():
    try:
        # Start with base query
        query = db.collection('employees')
        
        # Get filter parameters
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')

        # Apply filters if they exist and aren't 'All'
        if department and department != 'All':
            query = query.where('department', '==', department)
        if status and status != 'All':
            query = query.where('status', '==', status.lower())

        # Execute query
        employees = []
        docs = query.stream()
        
        for doc in docs:
            employee_data = doc.to_dict()
            employee_data['id'] = doc.id
            
            # Apply search filter if it exists
            if search:
                search_term = search.lower()
                if not any(search_term in str(value).lower() 
                         for value in [employee_data.get('name'), 
                                     employee_data.get('department'),
                                     employee_data.get('team')]):
                    continue

            # Ensure all required fields exist
            employee_data.setdefault('name', 'Unknown')
            employee_data.setdefault('department', 'Unassigned')
            employee_data.setdefault('team', 'Unassigned')
            employee_data.setdefault('status', 'office')
            employee_data.setdefault('manager', 'Unassigned')
            employee_data.setdefault('email', '')
            employee_data.setdefault('phone', '')
            employee_data.setdefault('joinDate', '')
            
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

        # Update employee status
        employee_ref = db.collection('employees').document(employee_id)
        employee_ref.update({
            'status': new_status
        })
        
        # Add to schedule history
        schedule_ref = db.collection('schedules').document()
        schedule_ref.set({
            'employee_id': employee_id,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'status': new_status,
            'hours': '9:00-17:00'
        })
        
        return jsonify({"message": f"Status updated to {new_status}"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to update status: {str(e)}"}), 500

@hr_view_bp.route('/employee/<employee_id>/schedule', methods=['GET'])
def get_schedule(employee_id):
    try:
        # Get date parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Query schedule collection
        query = db.collection('schedules').where('employee_id', '==', employee_id)
        
        if start_date:
            query = query.where('date', '>=', start_date)
        if end_date:
            query = query.where('date', '<=', end_date)

        # Get schedule documents
        schedule_docs = query.stream()
        
        schedules = []
        for doc in schedule_docs:
            schedule_data = doc.to_dict()
            schedules.append({
                'date': schedule_data.get('date'),
                'hours': schedule_data.get('hours', '9:00-17:00'),
                'status': schedule_data.get('status', 'office')
            })

        return jsonify({"schedules": schedules}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch schedule: {str(e)}"}), 500