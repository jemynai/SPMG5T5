from classes import *
from repositories.employee_repo import EmployeeRepository
from services.firebase import Firebase
import bcrypt

class EmployeeService:
    def __init__(self):
        self.repo = EmployeeRepository(Firebase().get_db())
    
    def create_employee(self, user_data):
        try:
            hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            employee = Employee(
                user_id=user_data['id'],
                name=Name(
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name']
                ),
                contact_info=ContactInfo(
                    email=user_data['email'],
                    country=user_data['country']
                ),
                job_details=JobDetails(
                    dept=user_data['dept'],
                    position=user_data['position'],
                    manager=user_data['rpt_manager']
                ),
                role=user_data['role'],
                password=hashed_password
            )
            self.repo.add_employee(employee)
            return True
        except:
            return False