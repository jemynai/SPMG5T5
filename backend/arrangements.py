from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from datetime import datetime

db = Firebase().get_db()

# Define a blueprint for arrangement-related routes
arrangement_bp = Blueprint('arrangements', __name__)

@arrangement_bp.route('/create_arrangement', methods=['POST'])
def create_arrangement():
    try:
        # Get the arrangement data from the request
        arrangement_data = request.json
        if not arrangement_data:
            return jsonify({"error": "No data provided"}), 400

        # Create a new arrangement document in Firestore
        arrangement_ref = db.collection('arrangements').document()
        created_at = datetime.now()
        date = datetime.fromisoformat(arrangement_data.get('date').replace('Z', '+00:00'))
        notes = arrangement_data.get('notes')
        
        arrangement_ref.set({
            'employee_id': arrangement_data['employee_id'],
            'date': date,
            'shift': arrangement_data['shift'],
            'status': arrangement_data['status'],
            'supervisors': arrangement_data['supervisors'],
            'created_at': created_at,
            'notes': notes,
        })

        return jsonify({"message": "Arrangement created", "arrangement_id": arrangement_ref.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@arrangement_bp.route('/get_arrangements', methods=['GET'])
def get_arrangements():
    # Get all employee_ids from query params
    employee_ids = request.args.getlist("eid")
    supervisor_ids = request.args.getlist("sid")
    arrangements_list = []
    def parse_arr(arr):
        for arrangement in arr:
            arrangement_data = arrangement.to_dict()
            arrangement_data['id'] = arrangement.id
            arrangements_list.append(arrangement_data)
    try:
        # ids are chunked to keep within firestore's limit
        # If both employee_ids and supervisor_ids are provided, get arrangements for both
        if len(employee_ids) and len(supervisor_ids):
            echunks = [employee_ids[i:i+30] for i in range(0, len(employee_ids), 30)]
            schunks = [supervisor_ids[i:i+30] for i in range(0, len(supervisor_ids), 30)]
            for echunk in echunks:
                for schunk in schunks:
                    arrangements = db.collection('arrangements').where('employee_id', 'in', echunk).where('supervisors', 'array_contains_any', schunk).stream()
                    parse_arr(arrangements)
        # Else if only employee_ids is provided, get arrangements for employees
        elif len(employee_ids):
            chunks = [employee_ids[i:i+30] for i in range(0, len(employee_ids), 30)]
            for chunk in chunks:
                arrangements = db.collection('arrangements').where('employee_id', 'in', chunk).stream()
                parse_arr(arrangements)
        # Else if only supervisor_ids is provided, get arrangements for supervisors
        elif len(supervisor_ids):
            chunks = [supervisor_ids[i:i+30] for i in range(0, len(supervisor_ids), 30)]
            for chunk in chunks:
                arrangements = db.collection('arrangements').where('supervisors', 'array_contains_any', chunk).stream()
                parse_arr(arrangements)
        # Else get all arrangements from Firestore
        else:
            arrangements = db.collection('arrangements').stream()
            parse_arr(arrangements)
        
        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500