from flask import jsonify, Blueprint, request
from services.firebase import Firebase
from datetime import datetime
from flask_cors import cross_origin

# Initialize Firebase once
db = Firebase().get_db()

# Create a Flask Blueprint
pending_request_bp = Blueprint('pending_request', __name__)

@pending_request_bp.route('/pending-arrangements', methods=['GET'])
@cross_origin()
def get_pending():
    """Get pending arrangements with optional employee filtering."""
    try:
        # Get query parameters
        employee_id = request.args.get('eid')
        
        # Base query for pending arrangements
        query = db.collection('arrangements').where('status', '==', 'pending')
        
        # Add employee filter if provided
        if employee_id:
            query = query.where('employee_id', '==', employee_id)
        
        # Execute the query
        pending_arrangements = query.stream()
        
        # Process the results
        arrangements_list = []
        for doc in pending_arrangements:
            arrangement_data = doc.to_dict()
            
            # Convert any Firestore Timestamps to ISO format
            for key, value in arrangement_data.items():
                if hasattr(value, 'seconds'):  # Check if it's a Firestore Timestamp
                    arrangement_data[key] = datetime.fromtimestamp(value.seconds).isoformat()
            
            # Add the document ID
            arrangement_data["id"] = doc.id
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

@pending_request_bp.route('/arrangements/cancel', methods=['POST'])
@cross_origin()
def cancel_arrangement():
    """Cancel a pending arrangement by its ID."""
    try:
        # Get arrangement ID from query parameters
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
                "error": "Only pending arrangements can be cancelled"
            }), 400
        
        # Update the arrangement
        update_data = {
            'status': 'cancelled',
            'cancelled_at': datetime.now(),
            'last_updated': datetime.now()
        }
        
        arrangement_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": "Arrangement has been cancelled successfully",
            "arrangement_id": arrangement_id
        }), 200

    except Exception as e:
        print(f"Error cancelling arrangement: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to cancel arrangement",
            "details": str(e)
        }), 500

# Helper function to format arrangement data
def format_arrangement_data(doc):
    """Format a Firestore document into a consistent arrangement data structure."""
    data = doc.to_dict()
    data["id"] = doc.id
    
    # Convert timestamps to ISO format
    timestamp_fields = ['created_at', 'updated_at', 'cancelled_at']
    for field in timestamp_fields:
        if field in data and hasattr(data[field], 'seconds'):
            data[field] = datetime.fromtimestamp(data[field].seconds).isoformat()
    
    return data