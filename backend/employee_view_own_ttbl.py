from flask import Blueprint, request, jsonify
from firebase import get_db

# Define a blueprint for employee view timetable
employee_view_own_bp = Blueprint('employee_view_own', __name__)

@employee_view_own_bp.route('/employee_view_own_ttbl', methods=['GET'])
def get_employee_arrangements():
    db = get_db()
    # Get employee_id from query params
    employee_id = request.args.get("eid")
    if not employee_id:
        return jsonify({"error": "No employee id provided."}), 400  # Bad Request if no id
    
    arrangements_list = []
    def parse_arr(arr):
        for arrangement in arr:
            arrangement_data = arrangement.to_dict()
            arrangement_data['id'] = arrangement.id
            arrangements_list.append(arrangement_data)
    try:
        arrangements = db.collection('arrangements').where('employee_id', '==', employee_id).stream()
        parse_arr(arrangements)
        
        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500