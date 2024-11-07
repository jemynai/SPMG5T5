from flask import jsonify, request, Blueprint
from services.firebase import Firebase  # Updated import path
from datetime import datetime
from flask_cors import cross_origin

# Initialize Firebase once
db = Firebase().get_db()

# Create a Flask Blueprint
Appr_Rej_bp = Blueprint('Appr_Rej', __name__)

@Appr_Rej_bp.route('/dir-mgr-pending', methods=['GET'])
@cross_origin()
def get_staff_pending():
    """Get all pending arrangements for staff."""
    try:
        # Query pending arrangements
        pending_arrangements = db.collection('arrangements')\
            .where('status', '==', 'pending')\
            .stream()
        
        # Process arrangements
        arrangements_list = []
        for doc in pending_arrangements:
            arrangement_data = doc.to_dict()
            
            # Convert Firestore Timestamps
            for key, value in arrangement_data.items():
                if hasattr(value, 'seconds'):
                    arrangement_data[key] = datetime.fromtimestamp(value.seconds).isoformat()
            
            # Add document ID
            arrangement_data["id"] = doc.id
            arrangement_data["arrangementId"] = doc.id  # For backwards compatibility
            arrangements_list.append(arrangement_data)
        
        return jsonify({
            "success": True,
            "arrangements": arrangements_list,
            "count": len(arrangements_list)
        }), 200

    except Exception as e:
        print(f"Error fetching pending arrangements: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch pending arrangements",
            "details": str(e)
        }), 500

@Appr_Rej_bp.route('/arrangements/reject', methods=['POST'])
@cross_origin()
def reject_arr():
    """Reject a pending arrangement."""
    try:
        arrangement_id = request.args.get("aID")
        
        # Validate arrangement ID
        if not arrangement_id:
            return jsonify({
                "success": False,
                "error": "Arrangement ID is required"
            }), 400
        
        # Get arrangement reference
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement_doc = arrangement_ref.get()
        
        # Check if arrangement exists
        if not arrangement_doc.exists:
            return jsonify({
                "success": False,
                "error": "Arrangement not found"
            }), 404
            
        # Get current arrangement data
        arrangement_data = arrangement_doc.to_dict()
        
        # Validate current status
        if arrangement_data.get('status') != 'pending':
            return jsonify({
                "success": False,
                "error": "Only pending arrangements can be rejected"
            }), 400
        
        # Update the arrangement
        update_data = {
            'status': 'rejected',
            'rejected_at': datetime.now(),
            'last_updated': datetime.now()
        }
        
        arrangement_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": "Arrangement has been rejected successfully",
            "arrangement_id": arrangement_id
        }), 200

    except Exception as e:
        print(f"Error rejecting arrangement: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to reject arrangement",
            "details": str(e)
        }), 500

@Appr_Rej_bp.route('/arrangements/approve', methods=['POST'])
@cross_origin()
def approve_arr():
    """Approve a pending arrangement."""
    try:
        arrangement_id = request.args.get("aID")
        
        # Validate arrangement ID
        if not arrangement_id:
            return jsonify({
                "success": False,
                "error": "Arrangement ID is required"
            }), 400
        
        # Get arrangement reference
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        arrangement_doc = arrangement_ref.get()
        
        # Check if arrangement exists
        if not arrangement_doc.exists:
            return jsonify({
                "success": False,
                "error": "Arrangement not found"
            }), 404
            
        # Get current arrangement data
        arrangement_data = arrangement_doc.to_dict()
        
        # Validate current status
        if arrangement_data.get('status') != 'pending':
            return jsonify({
                "success": False,
                "error": "Only pending arrangements can be approved"
            }), 400
        
        # Update the arrangement
        update_data = {
            'status': 'approved',
            'approved_at': datetime.now(),
            'last_updated': datetime.now()
        }
        
        arrangement_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": "Arrangement has been approved successfully",
            "arrangement_id": arrangement_id
        }), 200

    except Exception as e:
        print(f"Error approving arrangement: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to approve arrangement",
            "details": str(e)
        }), 500