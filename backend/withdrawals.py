from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from datetime import datetime
from flask_cors import cross_origin

db = Firebase().get_db()
withdrawal_bp = Blueprint('withdrawals', __name__)

@withdrawal_bp.route('/get_arrangements', methods=['GET'])
@cross_origin()
def get_arrangements():
    try:
        # Fetch arrangements that are either approved or have pending withdrawals
        arrangements_ref = db.collection('arrangements')
        arrangements = arrangements_ref.where('status', 'in', 
            ['approved', 'withdrawal_requested']).stream()

        arrangements_list = []
        for arr in arrangements:
            data = arr.to_dict()
            data['id'] = arr.id
            
            # Convert Firestore Timestamp to seconds for frontend
            if 'date' in data and hasattr(data['date'], 'seconds'):
                data['date'] = {
                    'seconds': data['date'].seconds,
                    'nanoseconds': data['date'].nanoseconds
                }
            
            # Map the status for frontend consistency
            if data.get('status') == 'withdrawal_requested':
                data['status'] = 'pending_withdrawal'
                
            arrangements_list.append(data)

        return jsonify({"arrangements": arrangements_list}), 200

    except Exception as e:
        print(f"Error getting arrangements: {str(e)}")
        return jsonify({"error": "Failed to fetch arrangements"}), 500

@withdrawal_bp.route('/request_withdrawal/<arrangement_id>', methods=['POST'])
@cross_origin()
def request_withdrawal(arrangement_id):
    try:
        # Fetch the arrangement document
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        arrangement_data = arrangement.to_dict()

        # Validate the current status
        if arrangement_data.get('status') != 'approved':
            return jsonify({
                "error": "Withdrawal can only be requested for approved arrangements"
            }), 400

        # Update the arrangement status
        withdrawal_requested_at = datetime.now()
        
        # Start a batch write
        batch = db.batch()
        
        # Update arrangement status
        batch.update(arrangement_ref, {
            'status': 'withdrawal_requested',
            'withdrawal_requested_at': withdrawal_requested_at,
        })

        # Create withdrawal request document
        withdrawal_ref = arrangement_ref.collection('withdrawal_requests').document()
        batch.set(withdrawal_ref, {
            'requested_at': withdrawal_requested_at,
            'status': 'pending',
            'manager_notified': False,
            'decision': None
        })

        # Commit the batch
        batch.commit()

        return jsonify({
            "message": "Withdrawal request submitted successfully",
            "status": "pending_withdrawal"
        }), 200

    except Exception as e:
        print(f"Error requesting withdrawal: {str(e)}")
        return jsonify({"error": "Failed to submit withdrawal request"}), 500

@withdrawal_bp.route('/check_withdrawal_status/<arrangement_id>', methods=['GET'])
@cross_origin()
def check_withdrawal_status(arrangement_id):
    try:
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        arrangement_data = arrangement.to_dict()
        
        # Map the status for frontend consistency
        status = arrangement_data.get('status', '')
        if status == 'withdrawal_requested':
            frontend_status = 'pending_withdrawal'
        elif status == 'withdrawal_accepted':
            frontend_status = 'withdrawn'
        elif status == 'withdrawal_rejected':
            frontend_status = 'approved'  # Reset to approved if rejected
        else:
            frontend_status = status

        return jsonify({
            "status": frontend_status,
            "last_updated": arrangement_data.get('withdrawal_requested_at')
        }), 200

    except Exception as e:
        print(f"Error checking withdrawal status: {str(e)}")
        return jsonify({"error": "Failed to check withdrawal status"}), 500

@withdrawal_bp.route('/handle_withdrawal/<arrangement_id>', methods=['POST'])
@cross_origin()
def handle_withdrawal(arrangement_id):
    try:
        decision = request.json.get('decision')
        if decision not in ['accept', 'reject']:
            return jsonify({"error": "Invalid decision"}), 400

        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        # Get the latest withdrawal request
        withdrawal_requests = arrangement_ref.collection('withdrawal_requests')\
            .where('status', '==', 'pending')\
            .order_by('requested_at', direction='DESCENDING')\
            .limit(1)\
            .stream()
        
        withdrawal_request = next(withdrawal_requests, None)
        if not withdrawal_request:
            return jsonify({"error": "No pending withdrawal request found"}), 404

        # Start a batch write
        batch = db.batch()
        
        # Update withdrawal request
        withdrawal_ref = withdrawal_request.reference
        batch.update(withdrawal_ref, {
            'status': decision,
            'manager_notified': True,
            'handled_at': datetime.now()
        })

        # Update arrangement status
        new_status = 'withdrawal_accepted' if decision == 'accept' else 'approved'
        batch.update(arrangement_ref, {
            'status': new_status
        })

        # Commit the batch
        batch.commit()

        return jsonify({
            "message": f"Withdrawal request {decision}ed successfully",
            "status": "withdrawn" if decision == 'accept' else 'approved'
        }), 200

    except Exception as e:
        print(f"Error handling withdrawal: {str(e)}")
        return jsonify({"error": "Failed to handle withdrawal request"}), 500