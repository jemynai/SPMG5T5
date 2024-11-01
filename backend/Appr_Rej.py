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
        tableData.append(doc.to_dict())  # Append the document data (fields and values) to the list
    
    return jsonify(tableData)


@Appr_Rej_bp.route('/arrangements/reject', methods=['POST'])
def reject_arr():
    db = get_db()
    employee_id = request.args.get("eid")
    date = request.args.get("date") 

    if not employee_id:
        return jsonify({"error": "No employee id provided."}), 400 
    
    try:
        # Query for documents with matching employee_id
        # Query for documents with matching employee_id and date
        arrangements = db.collection('arrangements') \
                 .where('employee_id', '==', employee_id) \
                 .where('date', '==', date) \
                 .stream()

        
        
        
        for arrangement in arrangements:
            doc_ref = db.collection('arrangements').document(arrangement.id)
            doc_ref.update({'status': 'Rejected'})
        
        
        
        return jsonify({"message": "All matching arrangements have been rejected."}), 200
    
    except Exception as e:
        print(f"Error updating arrangements: {e}")
        return jsonify({"error": "Failed to reject arrangements"}), 500
    

@Appr_Rej_bp.route('/arrangements/approve', methods=['POST'])
def approve_arr():
    db = get_db()
    employee_id = request.args.get("eid")
    date = request.args.get("date") 

    if not employee_id:
        return jsonify({"error": "No employee id provided."}), 400 
    
    try:
        
        arrangements = db.collection('arrangements') \
                 .where('employee_id', '==', employee_id) \
                 .where('date', '==', date) \
                 .stream()

        
        # Update each document's status field to "Approved"
        batch = db.batch()  # Use a batch to apply updates in a single operation
        
        for arrangement in arrangements:
            doc_ref = db.collection('arrangements').document(arrangement.id)
            batch.update(doc_ref, {'status': 'Approved'})
        
        # Commit the batch
        batch.commit()
        
        return jsonify({"message": "All matching arrangements have been approved."}), 200
    
    except Exception as e:
        print(f"Error updating arrangements: {e}")
        return jsonify({"error": "Failed to approve arrangements"}), 500
