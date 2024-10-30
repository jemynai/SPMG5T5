from classes import *
from repositories.employee_repo import EmployeeRepository
from services.firebase import Firebase
from services.jwt_util import JwtUtil
import bcrypt

class AuthService:
    def __init__(self):
        self.employee_repo = EmployeeRepository(Firebase().get_db())
        
    def authenticate(self, email: str, password: str):
        user = self.employee_repo.get_employee_by_email(email)
        if user is None:
            return None
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return None
        return JwtUtil.generate_token(user)