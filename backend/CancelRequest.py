from flask import Flask, jsonify, Blueprint
from firebase import get_db  # Ensure your file/module is named firebase.py and has get_db()

# Create a Flask Blueprint
cancel_request_bp = Blueprint('cancel_request', __name__)


@cancel_request_bp.route('/pending-arrangements', methods=['GET'])
def get_pending():
    db = get_db()  # Initialize Firestore DB
    pending_arrangements = db.collection('arrangements').where('status', '==', 'pending').stream()
    
    tableData = []
    for doc in pending_arrangements:
        tableData.append(doc.to_dict())  # Append the document data (fields and values) to the list
    
    return jsonify(tableData)

# Create the Flask app and register the blueprint
app = Flask(__name__)
app.register_blueprint(cancel_request_bp, url_prefix='/api')  # Prefixing with /api

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
