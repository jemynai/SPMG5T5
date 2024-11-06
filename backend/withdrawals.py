from flask import Blueprint, request, jsonify
from services.firebase import Firebase 
from datetime import datetime
from flask_cors import cross_origin

db = Firebase().get_db()
withdrawal_bp = Blueprint('withdrawal', __name__)

@withdrawal_bp.route('/get_user_applications', methods=['GET'])
@cross_origin()
def get_user_applications():
    try:
        # Get employee ID from query parameters
        employee_id = request.args.get('eid')
        
        if not employee_id:
            return jsonify({"error": "Employee ID is required"}), 400
            
        # Query applications for this employee that are approved
        applications = db.collection('applications')\
            .where('employee_id', '==', employee_id)\
            .where('status', '==', 'Approved')\
            .stream()
            
        applications_list = []
        for doc in applications:
            data = doc.to_dict()
            data['id'] = doc.id
            applications_list.append(data)
            
        return jsonify(applications_list), 200
        
    except Exception as e:
        print(f"Error getting applications: {e}")
        return jsonify({"error": "Failed to fetch applications"}), 500

@withdrawal_bp.route('/withdraw_application/<application_id>', methods=['POST'])
@cross_origin()
def withdraw_application(application_id):
    try:
        # Get employee ID from request body
        data = request.json
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({"error": "Employee ID is required"}), 400
            
        # Get the application
        application_ref = db.collection('applications').document(application_id)
        application = application_ref.get()
        
        if not application.exists:
            return jsonify({"error": "Application not found"}), 404
            
        application_data = application.to_dict()
        
        # Verify ownership
        if application_data.get('employee_id') != employee_id:
            return jsonify({"error": "Not authorized to withdraw this application"}), 403
            
        # Verify status
        if application_data.get('status') != 'Approved':
            return jsonify({"error": "Only approved applications can be withdrawn"}), 400
            
        # Update the application
        application_ref.update({
            'status': 'Withdrawn',
            'withdrawn_at': datetime.now(),
            'last_updated': datetime.now()
        })
        
        return jsonify({
            "message": "Application withdrawn successfully",
            "application_id": application_id
        }), 200
        
    except Exception as e:
        print(f"Error withdrawing application: {e}")
        return jsonify({"error": "Failed to withdraw application"}), 500