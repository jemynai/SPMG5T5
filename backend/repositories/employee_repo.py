# extend db_repo
from typing import Optional
from repositories.db_repo import DbRepository
from classes import *

class EmployeeRepository(DbRepository):
    def __init__(self, db):
        super().__init__(db, db.collection('users'))
    
    def get_employee_by_id(self, employee_id: str) -> Optional[Employee]:
        employee_data = self.get_by_id(employee_id)
        try:
            if employee_data:
                name = Name(
                    first_name=employee_data["first_name"],
                    last_name=employee_data["last_name"]
                )
                
                contact_info = ContactInfo(
                    email=employee_data["email"],
                    country=employee_data["country"]
                )
                
                job_details = JobDetails(
                    dept=employee_data["dept"],
                    position=employee_data["position"],
                    manager=employee_data["rpt_manager"]
                )
                
                password = employee_data["password"] if "password" in employee_data else None

                employee = Employee(
                    user_id=employee_data["user_id"],
                    name=name,
                    contact_info=contact_info,
                    job_details=job_details,
                    role=employee_data["role"],
                    password=password
                )

                return employee
            else:
                return None
        except Exception as e:
            print(e)
            return None
    
    def get_employee_by_email(self, email: str) -> Optional[Employee]:
        employee_data = self.get_by_field("email", email)
        try:
            if employee_data:
                name = Name(
                    first_name=employee_data[0]["first_name"],
                    last_name=employee_data[0]["last_name"]
                )
                
                contact_info = ContactInfo(
                    email=employee_data[0]["email"],
                    country=employee_data[0]["country"]
                )
                
                job_details = JobDetails(
                    dept=employee_data[0]["dept"],
                    position=employee_data[0]["position"],
                    manager=employee_data[0]["rpt_manager"]
                )
                
                password = employee_data[0]["password"] if "password" in employee_data[0] else None

                employee = Employee(
                    user_id=employee_data[0]["user_id"],
                    name=name,
                    contact_info=contact_info,
                    job_details=job_details,
                    role=employee_data[0]["role"],
                    password=password
                )
                
                print("Employee found")

                return employee
            else:
                print("Employee not found")
                return None
        except Exception as e:
            print("ERROR!")
            print(e)
            return None
        
    def add_employee(self, employee: Employee):
        self.add_document(employee.to_dict(), employee.user_id)
        
    def update_employee(self, employee: Employee):
        self.update_document(employee.to_dict(), employee.user_id)
        