from classes import *
from repositories.employee_repo import EmployeeRepository
from services.firebase import Firebase
from services.jwt_util import JwtUtil
import bcrypt

class AuthService:
    def __init__(self):
        self.employee_repo = EmployeeRepository(Firebase().get_db())
        
    def authenticate(self, email: str, password: str):
        print("authenticating")
        user = self.employee_repo.get_employee_by_email(email)
        if user is None:
            print("no user found")
            return None
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return None
        token = JwtUtil.generate_token(user)
        print(f"success, generated token {token}")
        return token