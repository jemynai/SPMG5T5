from flask import Blueprint, request, jsonify
from firebase import get_db

db = get_db()

# Define a blueprint for user-related routes
users_bp = Blueprint('users', __name__)

@users_bp.route('/create_user', methods=['POST'])
def create_user():
    try:
        # Get the user data from the request
        user_data = request.json
        if not user_data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if the user already exists
        user_ref = db.collection('users').document(user_data['id'])
        if user_ref.get().exists:
            return jsonify({"error": "User already exists"}), 400

        # Create a new user document in Firestore
        user_ref = db.collection('users').document(user_data['id'])
        user_ref.set({
            'country': user_data['country'],
            'dept': user_data['dept'],
            'email': user_data['email'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'position': user_data['position'],
            'role': user_data['role'],
            'rpt_manager': user_data['rpt_manager'],
        })
        
        return jsonify({"message": "User created", "user_id": user_data['id']}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@users_bp.route('/create_users', methods=['POST'])
def create_users():
    # takes an array of users and creates multiple users
    try:
        # Get the user data from the request
        count = 0
        users_data = request.json
        if not users_data:
            return jsonify({"error": "No data provided"}), 400
        # batch write data
        
        batch = db.batch()
        for user_data in users_data:
            user_ref = db.collection('users').document(user_data['id'])

            batch.set(user_ref, {
                'country': user_data['country'],
                'dept': user_data['dept'],
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'position': user_data['position'],
                'role': user_data['role'],
                'rpt_manager': user_data['rpt_manager'],
            })
            print(f"{count}/{len(users_data)} | current user: {user_data['id']}")
            count += 1
            if count % 500 == 0:
                batch.commit()
                batch = db.batch()
                print(f"committed {count} users")
        if count % 500 != 0: batch.commit()

        return jsonify({"message": f"{count} users created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/get_users', methods=['GET'])
def get_users():
    try:
        # Get all users from Firestore
        users = db.collection('users').stream()
        
        # Convert the users to a list of dictionaries
        users_list = []
        for user in users:
            user_data = user.to_dict()
            user_data['id'] = user.id
            users_list.append(user_data)
        
        return jsonify({"users": users_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/get_user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        # Get the user from Firestore
        user = db.collection('users').document(user_id).get()
        
        # Convert the user to a dictionary
        user_dict = user.to_dict()
        user_dict['id'] = user.id
        
        return jsonify({'user': user_dict}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/update_user/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        # Get the user data from the request
        user_data = request.json
        if not user_data:
            return jsonify({"error": "No data provided"}), 400
        
        user_ref = db.collection('users').document(user_id)

        # Check if user exists
        if not user_ref.get().exists:
            return jsonify({"error": "User does not exist"}), 404
    
        # Strip id from user_data if it exists
        try:
            user_data.pop('id')
        except:
            pass

        # Update user
        user_ref.update(user_data)
        
        return jsonify({"message": "User updated", "user": user_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/delete_user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Delete the user from Firestore
        user_ref = db.collection('users').document(user_id)
        user_ref.delete()
        
        return jsonify({"message": "User deleted", "user_id": user_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/delete_all_users', methods=['DELETE'])
def delete_all_users():
    try:
        count = 0
        # Delete all users from Firestore
        users = db.collection('users').stream()
        batch = db.batch()
        for user in users:
            batch.delete(user.reference)
            count += 1
            if count % 500 == 0:
                batch.commit()
                batch = db.batch()
                print(f"committed {count} users")
        if count % 500 != 0: batch.commit()
        
        return jsonify({"message": f"Deleted {count} users"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500