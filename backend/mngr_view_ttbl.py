from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from flask_cors import CORS
from datetime import datetime, timezone
import firebase_admin.auth as auth

db = Firebase().get_db()
mngr_view_bp = Blueprint('mngr_view', __name__)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8080", 
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000"
]

CORS(mngr_view_bp)

def verify_token(token):
    try:
        return auth.verify_id_token(token)
    except:
        return None

@mngr_view_bp.route('/employees', methods=['GET'])
def get_employees():
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authorization token provided"}), 401

        token = auth_header.split('Bearer ')[1]
        claims = verify_token(token)
        if not claims:
            return jsonify({"error": "Invalid token"}), 401

        manager_ref = db.collection('users').document(claims['uid']).get()
        if not manager_ref.exists:
            return jsonify({"error": "Manager not found"}), 404

        manager_data = manager_ref.to_dict()
        if manager_data.get('role') != 'manager':
            return jsonify({"error": "Unauthorized access"}), 403

        manager_dept = manager_data.get('dept')
        if not manager_dept:
            return jsonify({"error": "Manager department not set"}), 400

        query = db.collection('users').where('dept', '==', manager_dept)
        
        status = request.args.get('status')
        if status and status.lower() != 'all':
            query = query.where('status', '==', status.lower())

        docs = query.stream()
        
        employees = []
        for doc in docs:
            data = doc.to_dict()
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            employees.append({
                'id': doc.id,
                'name': f"{first_name} {last_name}".strip() or 'Unknown',
                'department': data.get('dept', 'Unassigned'),
                'team': data.get('position', 'Unassigned'),
                'status': data.get('status', 'office').lower(),
                'email': data.get('email', ''),
                'country': data.get('country', 'Unassigned'),
                'position': data.get('position', 'Unassigned')
            })

        return jsonify({"employees": employees}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mngr_view_bp.route('/employee/<employee_id>/status', methods=['PUT'])
def update_status(employee_id):
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authorization token provided"}), 401

        token = auth_header.split('Bearer ')[1]
        claims = verify_token(token)
        if not claims:
            return jsonify({"error": "Invalid token"}), 401

        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({"error": "Status is required"}), 400
        
        if new_status not in ['office', 'remote']:
            return jsonify({"error": "Invalid status value"}), 400

        employee_ref = db.collection('users').document(employee_id)
        employee = employee_ref.get()
        
        if not employee.exists:
            return jsonify({"error": "Employee not found"}), 404

        employee_data = employee.to_dict()
        manager_data = db.collection('users').document(claims['uid']).get().to_dict()

        if employee_data.get('dept') != manager_data.get('dept'):
            return jsonify({"error": "Unauthorized to modify this employee"}), 403

        employee_ref.update({
            'status': new_status,
            'lastUpdated': datetime.now(timezone.utc).isoformat()
        })

        return jsonify({"message": "Status updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mngr_view_bp.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS')
    return response