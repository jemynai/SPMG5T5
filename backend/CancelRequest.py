from flask import jsonify, Blueprint
from firebase import get_db  # Ensure your file/module is named firebase.py and has get_db()

# Create a Flask Blueprint
pending_request_bp = Blueprint('pending_request', __name__)

# Your existing function to get pending arrangements
@pending_request_bp.route('/pending-arrangements', methods=['GET'])
def get_pending():
    db = get_db()  # Initialize Firestore DB
    pending_arrangements = db.collection('arrangements').where('status', '==', 'pending').stream()
    
    tableData = []
    for doc in pending_arrangements:
        tableData.append(doc.to_dict())  # Append the document data (fields and values) to the list
    
    return jsonify(tableData)



