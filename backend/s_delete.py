from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from datetime import datetime
from firebase import get_db  # Assuming you have a firebase.py file for your Firebase connection

# Create a Blueprint for this module
s_delete_bp = Blueprint('s_delete_bp', __name__)

db = get_db()  # Retrieve the Firestore client

# Endpoint to retrieve all WFH requests
@s_delete_bp.route('/wfh_requests', methods=['GET'])
def get_wfh_requests():
    wfh_requests = db.collection('applications').stream()
    requests_list = []
    for req in wfh_requests:
        request_data = req.to_dict()
        request_data['id'] = req.id  # Add document ID to each request
        requests_list.append(request_data)
    return jsonify(requests_list), 200

# Endpoint to submit a new WFH request
@s_delete_bp.route('/submit_application', methods=['POST'])
def submit_application():
    try:
        # Parse data from request
        application_data = request.get_json()

        # Create a new document in Firestore 'applications' collection
        application_ref = db.collection('applications').document()

        # Get the current timestamp
        created_at = datetime.now()

        # Add application data to Firestore
        application_ref.set({
            'date': application_data.get('date'),
            'type': application_data.get('type'),
            'days': application_data.get('days'),
            'half_day': application_data.get('halfDay'),
            'reason': application_data.get('reason'),
            'status': "Pending",  # Default status
            'created_at': created_at
        })

        return jsonify({"message": "Application submitted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to delete a full request by ID
@s_delete_bp.route('/delete_request/<request_id>', methods=['DELETE'])
def delete_request(request_id):
    try:
        db.collection('applications').document(request_id).delete()
        return jsonify({"message": "Request deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to remove a specific day from a request
@s_delete_bp.route('/remove_day/<request_id>', methods=['POST'])
def remove_day_from_request(request_id):
    try:
        request_data = request.get_json()
        day_to_remove = request_data.get('day')

        # Retrieve the document
        request_ref = db.collection('applications').document(request_id)
        request_doc = request_ref.get()

        if request_doc.exists:
            request_info = request_doc.to_dict()
            days = request_info.get('days', [])

            if day_to_remove in days:
                days.remove(day_to_remove)
                # Update the Firestore document
                request_ref.update({'days': days})

            return jsonify({"message": f"{day_to_remove} removed successfully"}), 200
        else:
            return jsonify({"error": "Request not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
