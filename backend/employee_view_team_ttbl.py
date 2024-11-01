from flask import Blueprint, request, jsonify
from firebase import get_db

# Define a blueprint for employee view timetable
employee_view_team_bp = Blueprint('employee_view_team', __name__)

@employee_view_team_bp.route('/employee_view_team_ttbl', methods=['GET'])
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
        ## this section is broken, clarify what defines teammates with grp
        
        # arrangements = db.collection('arrangements').where('employee_id', '==', employee_id).stream()
        # parse_arr(arrangements)
        # Query the users collection
        query1 = db.collection('users').where('employee_id', '==', employee_id).stream()

        # Extract rpt_manager from the query results
        for user in query1:
            rpt_manager = user.to_dict().get('rpt_manager')
            print(rpt_manager)  # Output the rpt_manager

        query2 = db.collection('arrangements').where('employee_id', '==', employee_id).where('supervisor', '==', [1]).stream()
                
        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500