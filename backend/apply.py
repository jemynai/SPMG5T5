from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from datetime import datetime

# Create a new blueprint for handling applications
apply_bp = Blueprint('apply_bp', __name__)

# Route for form submissions
@apply_bp.route('/submit_application', methods=['POST', 'OPTIONS'])
def submit_application():
    if request.method == 'OPTIONS':
        return '', 200  # Return OK for preflight check
    # Your existing POST logic here

    try:
        # Get Firestore DB instance
        db = Firebase().get_db()

        # Parse data from the request
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
            'status': application_data.get('status'),
            'created_at': created_at
            
        })

    

        
        return jsonify({"message": "Application submitted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500