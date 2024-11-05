from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from classes import TimetableService

# Define a blueprint for employee view timetable
employee_view_team_bp = Blueprint('employee_view_team', __name__)

@employee_view_team_bp.route('/employee_view_team_ttbl', methods=['GET'])
def get_employee_arrangements():
    # Get employee_id from query params
    employee_id = request.args.get("eid")
    if not employee_id:
        return jsonify({"error": "No employee id provided."}), 400  # Bad Request if no id
    
    timetableService = TimetableService(Firebase().get_db())
    arrangements_list = []
    def parse_arr(arr):
        for arrangement in arr:
            arrangement_data = arrangement.to_dict()
            arrangement_data['id'] = arrangement.id
            arrangements_list.append(arrangement_data)
    try:
        arrangements = timetableService.get_team_arrangements(employee_id)
        for a in arrangements:
            arrangement_data = a.to_dict()
            arrangements_list.append(arrangement_data)
        return jsonify({"arrangements": arrangements_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500