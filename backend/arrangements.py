from flask import Blueprint, request, jsonify
from firebase import get_db
from datetime import datetime

db = get_db()

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

        arrangement_ref.set({
            'employee_id': arrangement_data.get('employee_id'),
            'date': arrangement_data.get('date'),
            'type': arrangement_data.get('type'),
            'days': arrangement_data.get('days'),
            'half_day': arrangement_data.get('halfDay'),
            'reason': arrangement_data.get('reason'),
            'status': arrangement_data.get('status', 'Pending'),
            'created_at': created_at,
            'shift': arrangement_data.get('shift', 'N/A'),
            'supervisors': arrangement_data.get('supervisors', []),
            'notes': arrangement_data.get('notes', ''),
        })

        return jsonify({"message": "Arrangement created", "arrangement_id": arrangement_ref.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@arrangement_bp.route('/get_arrangements', methods=['GET'])
def get_arrangements():
    employee_ids = request.args.getlist("eid")
    arrangements_list = []

    def parse_arr(arr):
        for arrangement in arr:
            arrangement_data = arrangement.to_dict()
            arrangement_data['id'] = arrangement.id
            arrangements_list.append(arrangement_data)

    try:
        if len(employee_ids):
            chunks = [employee_ids[i:i+30] for i in range(0, len(employee_ids), 30)]
            for chunk in chunks:
                arrangements = db.collection('arrangements').where('employee_id', 'in', chunk).stream()
                parse_arr(arrangements)
        else:
            arrangements = db.collection('arrangements').stream()
            parse_arr(arrangements)

        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
