from flask import Blueprint, request, jsonify
from firebase import get_db
from datetime import datetime

db = get_db()

# Define a blueprint for withdrawal-related routes
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

        # Check if the arrangement is already in withdrawal process
        if arrangement_data.get('status') == 'withdrawal_requested':
            return jsonify({"error": "Withdrawal already requested"}), 400

        # Update the status and notify management
        withdrawal_requested_at = datetime.now()
        arrangement_ref.update({
            'status': 'withdrawal_requested',
            'withdrawal_requested_at': withdrawal_requested_at,
            'manager_notified': True
        })

        return jsonify({"message": "Withdrawal requested successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@withdrawal_bp.route('/handle_withdrawal/<arrangement_id>', methods=['POST'])
def handle_withdrawal(arrangement_id):
    try:
        # Get the decision (accept or reject) from the request body
        decision = request.json.get('decision')
        if decision not in ['accept', 'reject']:
            return jsonify({"error": "Invalid decision"}), 400

        # Fetch the arrangement document from Firestore
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement = arrangement_ref.get()

        if not arrangement.exists:
            return jsonify({"error": "Arrangement not found"}), 404

        arrangement_data = arrangement.to_dict()

        # Check if a withdrawal request has been made
        if arrangement_data.get('status') != 'withdrawal_requested':
            return jsonify({"error": "No withdrawal request pending"}), 400

        # Update the arrangement status based on the decision
        if decision == 'accept':
            new_status = 'withdrawal_accepted'
        else:
            new_status = 'withdrawal_rejected'

        arrangement_ref.update({
            'status': new_status,
            'manager_notified': False  # Reset the notification status after handling
        })

        return jsonify({"message": f"Withdrawal {decision}ed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
