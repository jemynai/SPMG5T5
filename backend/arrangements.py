from flask import Blueprint, request, jsonify
from firebase import get_db
from datetime import datetime

class ArrangementService:
    def __init__(self):
        self.db = get_db()

    def create_arrangement(self, arrangement_data):
        if not arrangement_data:
            return {"error": "No data provided"}, 400

        try:
            # Create a new arrangement document in Firestore
            arrangement_ref = self.db.collection('arrangements').document()
            created_at = datetime.now()

            # Prepare the data to be inserted
            arrangement_details = {
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
            }

            # Insert the arrangement data into Firestore
            arrangement_ref.set(arrangement_details)

            return {"message": "Arrangement created", "arrangement_id": arrangement_ref.id}, 201
        except Exception as e:
            return {"error": str(e)}, 500

    def get_arrangements(self, employee_ids):
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
                    arrangements = self.db.collection('arrangements').where('employee_id', 'in', chunk).stream()
                    parse_arr(arrangements)
            else:
                arrangements = self.db.collection('arrangements').stream()
                parse_arr(arrangements)

            return {"arrangements": arrangements_list}, 200
        except Exception as e:
            return {"error": str(e)}, 500


# Create an instance of the service
arrangement_service = ArrangementService()

# Define a blueprint for arrangement-related routes
arrangement_bp = Blueprint('arrangements', __name__)

@arrangement_bp.route('/create_arrangement', methods=['POST'])
def create_arrangement():
    arrangement_data = request.json
    response, status_code = arrangement_service.create_arrangement(arrangement_data)
    return jsonify(response), status_code

@arrangement_bp.route('/get_arrangements', methods=['GET'])
def get_arrangements():
    employee_ids = request.args.getlist("eid")
    response, status_code = arrangement_service.get_arrangements(employee_ids)
    return jsonify(response), status_code
