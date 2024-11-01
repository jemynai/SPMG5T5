from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from functools import wraps
import firebase_admin
from firebase_admin import auth, firestore
from datetime import datetime, timedelta


# Initialize Firestore database
db = Firebase().get_db()

hr_view_bp = Blueprint('hr_view', __name__)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Unauthorized access"}), 401
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user_role = decoded_token.get('role')
            if request.user_role not in ['HR', 'ADMIN']:
                return jsonify({"error": "Insufficient permissions"}), 403
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
        return f(*args, **kwargs)
    return decorated_function

class HRDashboard:
    def __init__(self):
        self.db = db

    def get_all_employees(self, filters=None):
        try:
            query = self.db.collection('employees')

            if filters:
                if filters.get('department'):
                    query = query.where('department', '==', filters['department'])
                if filters.get('status'):
                    query = query.where('status', '==', filters['status'])
                if filters.get('search'):
                    # Note: Firebase doesn't support direct text search
                    # We'll need to filter in memory for search
                    pass

            employees = []
            docs = query.stream()
            
            for doc in docs:
                employee_data = doc.to_dict()
                employee_data['id'] = doc.id
                
                # Apply search filter if exists
                if filters and filters.get('search'):
                    search_term = filters['search'].lower()
                    if not any(search_term in str(value).lower() 
                             for value in [employee_data.get('name'), 
                                         employee_data.get('id'), 
                                         employee_data.get('email'), 
                                         employee_data.get('department')]):
                        continue
                
                employees.append(employee_data)

            return {"employees": employees}, 200
        except Exception as e:
            return {"error": f"Failed to fetch employees: {str(e)}"}, 500

    def update_employee_status(self, employee_id, new_status):
        """
        Update employee's work status (office/remote)
        """
        try:
            employee_ref = self.db.collection('employees').document(employee_id)
            employee_ref.update({
                'status': new_status,
                'lastUpdated': firestore.SERVER_TIMESTAMP
            })
            return {"message": f"Status updated to {new_status}"}, 200
        except Exception as e:
            return {"error": f"Failed to update status: {str(e)}"}, 500

    def get_department_stats(self):
        """
        Get statistics for all departments
        """
        try:
            stats = {}
            employees = self.db.collection('employees').stream()
            
            for emp in employees:
                data = emp.to_dict()
                dept = data.get('department', 'Unassigned')
                status = data.get('status', 'office')
                
                if dept not in stats:
                    stats[dept] = {'total': 0, 'office': 0, 'remote': 0}
                
                stats[dept]['total'] += 1
                stats[dept][status] += 1
            
            return {"statistics": stats}, 200
        except Exception as e:
            return {"error": f"Failed to fetch statistics: {str(e)}"}, 500

    def get_employee_schedule(self, employee_id, start_date=None, end_date=None):
        """
        Get employee's schedule history
        """
        try:
            if not start_date:
                start_date = datetime.now() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now()

            schedule_ref = self.db.collection('schedules')\
                             .where('employee_id', '==', employee_id)\
                             .where('date', '>=', start_date)\
                             .where('date', '<=', end_date)\
                             .stream()

            schedules = []
            for doc in schedule_ref:
                schedule_data = doc.to_dict()
                schedule_data['id'] = doc.id
                schedules.append(schedule_data)

            return {"schedules": schedules}, 200
        except Exception as e:
            return {"error": f"Failed to fetch schedule: {str(e)}"}, 500

# Routes
@hr_view_bp.route('/employees', methods=['GET'])
@require_auth
def get_employees():
    filters = {
        'department': request.args.get('department'),
        'status': request.args.get('status'),
        'search': request.args.get('search')
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    hr_dashboard = HRDashboard()
    response, status_code = hr_dashboard.get_all_employees(filters)
    return jsonify(response), status_code

@hr_view_bp.route('/employee/<employee_id>/status', methods=['PUT'])
@require_auth
def update_status(employee_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({"error": "Status is required"}), 400
    
    if new_status not in ['office', 'remote']:
        return jsonify({"error": "Invalid status value"}), 400
    
    hr_dashboard = HRDashboard()
    response, status_code = hr_dashboard.update_employee_status(employee_id, new_status)
    return jsonify(response), status_code

@hr_view_bp.route('/statistics', methods=['GET'])
@require_auth
def get_stats():
    hr_dashboard = HRDashboard()
    response, status_code = hr_dashboard.get_department_stats()
    return jsonify(response), status_code

@hr_view_bp.route('/employee/<employee_id>/schedule', methods=['GET'])
@require_auth
def get_schedule(employee_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    
    hr_dashboard = HRDashboard()
    response, status_code = hr_dashboard.get_employee_schedule(
        employee_id, start_date, end_date
    )
    return jsonify(response), status_code
