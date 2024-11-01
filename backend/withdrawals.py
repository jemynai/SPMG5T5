from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from datetime import datetime

db = Firebase().get_db()

withdrawal_bp = Blueprint('withdrawals', __name__)

@withdrawal_bp.route('/request_withdrawal/<arrangement_id>', methods=['POST'])
def request_withdrawal(arrangement_id):
    try:
        # Fetch the arrangement document from Firestore
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        arrangement_data = arrangement.to_dict()

        # Check if the arrangement status allows for withdrawal request
        if arrangement_data.get('status') not in ['approved']:  # Validate based on allowed statuses
            return jsonify({"error": "Cannot request withdrawal for this arrangement status"}), 400

        # Check if a withdrawal is already in process
        if arrangement_data.get('status') == 'withdrawal_requested':
            return jsonify({"error": "Withdrawal already requested"}), 400

        # Update the arrangement status to withdrawal requested
        withdrawal_requested_at = datetime.now()
        arrangement_ref.update({
            'status': 'withdrawal_requested',
            'withdrawal_requested_at': withdrawal_requested_at,
        })

        # Store the withdrawal request in a subcollection within the arrangement document
        withdrawal_ref = arrangement_ref.collection('withdrawal_requests').document()
        withdrawal_ref.set({
            'requested_at': withdrawal_requested_at,
            'status': 'pending',
            'manager_notified': False,  # Will be set to true when handled
            'decision': None
        })

        return jsonify({"message": "Withdrawal requested successfully", "request_id": withdrawal_ref.id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@withdrawal_bp.route('/handle_withdrawal/<arrangement_id>/<request_id>', methods=['POST'])
def handle_withdrawal(arrangement_id, request_id):
    try:
        # Get the decision (accept or reject) from the request body
        decision = request.json.get('decision')
        if decision not in ['accept', 'reject']:
            return jsonify({"error": "Invalid decision"}), 400

        # Fetch the arrangement and withdrawal request document
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        # Fetch the withdrawal request from the subcollection
        withdrawal_ref = arrangement_ref.collection('withdrawal_requests').document(request_id)
        withdrawal_request = withdrawal_ref.get()

        if not withdrawal_request.exists:
            return jsonify({"error": "Withdrawal request not found"}), 404

        # Update the status in the withdrawal request
        withdrawal_ref.update({
            'status': decision,
            'manager_notified': True,
            'handled_at': datetime.now()
        })

        # Update the arrangement status based on the decision
        if decision == 'accept':
            new_status = 'withdrawal_accepted'
        else:
            new_status = 'withdrawal_rejected'

        arrangement_ref.update({
            'status': new_status,
        })

        return jsonify({"message": f"Withdrawal {decision}ed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@withdrawal_bp.route('/get_withdrawal_requests/<arrangement_id>', methods=['GET'])
def get_withdrawal_requests(arrangement_id):
    try:
        # Fetch the arrangement document
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        # Fetch the withdrawal requests subcollection
        withdrawal_requests = arrangement_ref.collection('withdrawal_requests').stream()

        # Convert the requests to a list of dictionaries
        withdrawal_list = []
        for request in withdrawal_requests:
            request_data = request.to_dict()
            request_data['request_id'] = request.id
            withdrawal_list.append(request_data)

        return jsonify({"withdrawal_requests": withdrawal_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
