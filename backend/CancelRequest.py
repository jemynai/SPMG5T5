from flask import jsonify, Blueprint, request
from firebase import get_db  

# Create a Flask Blueprint
pending_request_bp = Blueprint('pending_request', __name__)


# Your existing function to get pending arrangements
@pending_request_bp.route('/pending-arrangements', methods=['GET'])
def get_pending():
    db = get_db()  # Initialize Firestore DB
    employee_id = request.args.get('eid') 
    pending_arrangements_all= db.collection('arrangements').where('status', '==', 'pending')

    if employee_id:
        pending_arrangements_all = pending_arrangements_all.where('employee_id', '==', employee_id)
    
    # Execute the query
    pending_arrangements = pending_arrangements_all.stream()
    
    tableData = []
    for doc in pending_arrangements:
        docDict = doc.to_dict()
        docDict["arrangementId"] = doc.id
        tableData.append(docDict)
    
    return jsonify(tableData)


@pending_request_bp.route('/arrangements/withdraw', methods=['POST'])
def approve_arr():

    db = get_db()
    arrangement_id = request.args.get("aID")

    if not arrangement_id:
        return jsonify({"error": "No employee id provided."}), 400 
    
    try:
        
        arrangement_ref = db.collection('arrangements').document(arrangement_id)
        
        # Check if the document exists
        if arrangement_ref.get().exists:
            arrangement_ref.update({'status': 'Withdrawn'})
        
        
        return jsonify({"message": "Arrangement has been withdrawn."}), 200
    
    except Exception as e:
        print(f"Error updating arrangements: {e}")
        return jsonify({"error": "Failed to withdraw arrangement"}), 500
