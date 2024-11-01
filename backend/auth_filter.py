from functools import wraps
from flask import request, jsonify
from services.jwt_util import JwtUtil

class JwtRequestFilter:
    def __init__(self):
        self.role_index = {
            "1": "hr",
            "2": "employee",
            "3": "manager"
        }

    def token_required(self, roles=[]):
        def decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                token = request.headers.get('Authorization')
                if token and token.startswith('Bearer '):
                    token = token.split(' ')[1]
                    user_data = JwtUtil.verify_token(token)
                    if user_data is None:
                        return jsonify({'message': 'Token is invalid or has expired'}), 401
                    request.user_id = user_data['sub']
                    request.role = user_data['role']

                    if roles and self.role_index[request.role] not in roles:
                        return jsonify({'message': 'Access denied: insufficient permissions'}), 403
                else:
                    return jsonify({'message': 'Authorization header is expected'}), 401

                return f(*args, **kwargs)

            return decorated
        return decorator
