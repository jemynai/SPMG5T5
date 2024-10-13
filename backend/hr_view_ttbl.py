from flask import Blueprint, request, jsonify
from firebase import get_db
from functools import wraps
import firebase_admin
from firebase_admin import auth

# Initialize Firestore database
db = get_db()

# Define a blueprint for HR view timetable
hr_view_bp = Blueprint('hr_view', __name__)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Unauthorized access"}), 401
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user_role = decoded_token.get('role')  # Assuming you set user role in the token
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated_function

@hr_view_bp.route('/hr_view_ttbl', methods=['GET'])
@require_auth
def hr_view_ttbl():
    department_id = request.args.get('department_id')
    status_filter = request.args.get('status')  # 'office' or 'home'
    arrangements_list = []

    if not department_id:
        return jsonify({"error": "Department ID is required"}), 400

    try:
        # Query Firestore for arrangements based on department ID and optional status
        query = db.collection('arrangements').where('supervisors', 'array_contains', department_id)
        
        if status_filter:
            query = query.where('status', '==', status_filter)
        
        # Fetch arrangements from Firestore
        arrangements = query.stream()
        for arrangement in arrangements:
            arrangement_data = arrangement.to_dict()
            arrangement_data['id'] = arrangement.id
            arrangements_list.append(arrangement_data)

        if not arrangements_list:
            return jsonify({"message": "No arrangements found for this department"}), 404
        
        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
