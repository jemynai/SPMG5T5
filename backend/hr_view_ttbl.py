from flask import Blueprint, request, jsonify
from firebase import get_db
from functools import wraps
import firebase_admin
from firebase_admin import auth

db = get_db()

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

class HRViewTimetable:

    def __init__(self, department_id, status_filter=None):
        self.department_id = department_id
        self.status_filter = status_filter
        self.db = db
        self.arrangements_list = []

    def validate_inputs(self):
        if not self.department_id:
            return {"error": "Department ID is required"}, 400
        return None

    def fetch_arrangements(self):
        """Fetches arrangements from Firestore based on department ID and optional status."""
        try:
            # Query Firestore for arrangements based on department ID and optional status
            query = self.db.collection('arrangements').where('supervisors', 'array_contains', self.department_id)
            
            if self.status_filter:
                query = query.where('status', '==', self.status_filter)

            # Fetch arrangements from Firestore
            arrangements = query.stream()
            for arrangement in arrangements:
                arrangement_data = arrangement.to_dict()
                arrangement_data['id'] = arrangement.id
                self.arrangements_list.append(arrangement_data)

            if not self.arrangements_list:
                return {"message": "No arrangements found for this department"}, 404

            return {"arrangements": self.arrangements_list}, 200

        except Exception as e:
            return {"error": str(e)}, 500

@hr_view_bp.route('/hr_view_ttbl', methods=['GET'])
@require_auth
def hr_view_ttbl():
    department_id = request.args.get('department_id')
    status_filter = request.args.get('status')  # 'office' or 'home'

    # Instantiate the HRViewTimetable class
    hr_view = HRViewTimetable(department_id, status_filter)

    # Validate inputs
    validation_error = hr_view.validate_inputs()
    if validation_error:
        return jsonify(validation_error), validation_error[1]

    # Fetch and return arrangements
    response, status_code = hr_view.fetch_arrangements()
    return jsonify(response), status_code
