from flask import jsonify, request, Blueprint
from firebase import get_db  # Ensure your file/module is named firebase.py and has get_db()

# Create a Flask Blueprint
Appr_Rej_bp = Blueprint('Appr_Rej', __name__)


# Your existing function to get pending arrangements
@Appr_Rej_bp.route('/dir-mgr-pending', methods=['GET'])

def get_staff_pending():
    db = get_db()  # Initialize Firestore DB
    pending_arrangements = db.collection('arrangements').where('status', '==', 'pending').stream()
    
    tableData = []
    for doc in pending_arrangements:
        docDict = doc.to_dict()
        docDict["arrangementId"] = doc.id
        tableData.append(docDict)  # Append the document data (fields and values) to the list
    
    return jsonify(tableData)


@Appr_Rej_bp.route('/arrangements/reject', methods=['POST'])
def reject_arr():
    db = get_db()
    arrangement_id = request.args.get("aID")
    

    if not arrangement_id:
        return jsonify({"error": "No employee id provided."}), 400 
    
    try:
    
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        
        if arrangement_ref.get().exists:
            arrangement_ref.update({'status': 'Rejected'})
        
        return jsonify({"message": "Arrangement has been rejected."}), 200
    
    except Exception as e:
        print(f"Error updating arrangements: {e}")
        return jsonify({"error": "Failed to reject arrangement"}), 500
    

@Appr_Rej_bp.route('/arrangements/approve', methods=['POST'])
def approve_arr():

    db = get_db()
    arrangement_id = request.args.get("aID")

    if not arrangement_id:
        return jsonify({"error": "No employee id provided."}), 400 
    
    try:
        
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        
        # Check if the document exists
        if arrangement_ref.get().exists:
            arrangement_ref.update({'status': 'Approved'})
        
        
        return jsonify({"message": "Arrangement has been approved."}), 200
    
    except Exception as e:
        print(f"Error updating arrangements: {e}")
        return jsonify({"error": "Failed to approve arrangement"}), 500
