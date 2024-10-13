from flask import Blueprint, request, jsonify
from firebase import get_db

db = get_db()

# Define a blueprint for manager view timetable
mngr_view_bp = Blueprint('mngr_view', __name__)

# Route for managers to view team timetables (department-based)
@mngr_view_bp.route('/mngr_view_ttbl', methods=['GET'])
def mngr_view_ttbl():
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
