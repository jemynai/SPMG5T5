import jwt
from datetime import datetime, timedelta, timezone
from classes import Employee
from jwt_config import *

class JwtUtil:
    @staticmethod
    def generate_token(user: Employee):
        payload = {
            "sub": user.user_id, # Subject (the user ID)
            "role": user.role,
            "first_name": user.name.first_name,
            "last_name": user.name.last_name,
            "iat": datetime.now(timezone.utc),  # Issued at
            "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)  # Expiration time
        }

        return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

    @staticmethod
    def verify_token(token):
        try:
            print(token)
            decoded_payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            return decoded_payload
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
            return None
