from flask import Blueprint, request, jsonify
from services.firebase import Firebase

# Define a blueprint for employee view timetable
employee_view_team_bp = Blueprint('employee_view_team', __name__)

@employee_view_team_bp.route('/employee_view_team_ttbl', methods=['GET'])
def get_employee_arrangements():
    db = Firebase().get_db()
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

        # Query the users collection
        user_doc = db.collection('users').document(employee_id).get()
        # Extract rpt_manager from the query results
        if user_doc.exists:
            user_data = user_doc.to_dict()
            rpt_manager = user_data['rpt_manager']
        else:
            return ('No user for that employee_id.'), 400
        
        arrangements = db.collection('arrangements').where('supervisors', '==', rpt_manager).stream()
        print('you reached here')
        parse_arr(arrangements)
        
        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500