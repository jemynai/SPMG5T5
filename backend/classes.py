import requests
from typing import Optional
from dataclasses import dataclass

@dataclass
class Name:
    first_name: str
    last_name: str

@dataclass
class ContactInfo:
    email: str
    country: str

@dataclass
class JobDetails:
    dept: str
    position: str
    manager: str

class Employee:
    def __init__(self, user_id: str, name: Name, contact_info: ContactInfo, job_details: JobDetails, role: str, password: Optional[str] = None):
        self.user_id = user_id
        self.name = name
        self.contact_info = contact_info
        self.job_details = job_details
        self.role = role
        self.password = password
        
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'first_name': self.name.first_name,
            'last_name': self.name.last_name,
            'email': self.contact_info.email,
            'country': self.contact_info.country,
            'dept': self.job_details.dept,
            'position': self.job_details.position,
            'rpt_manager': self.job_details.manager,
            'role': self.role,
            'password': self.password
        }

    def create_arrangement(self):
        pass
    
    def delete_arrangement(self):
        pass
    
    def view_arrangements(self):
        response = requests.get(f"http://localhost:8000/employee_view_own_ttbl?eid={self.user_id}")
        # Check the status code and print the response
        if response.status_code == 200:
            print("Success!")
            print(response.text)  # Get the response content
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
    
# class Manager(Employee):
#     def __init__(self, user_id, name, email, role, managers, team):
#         super().__init__(user_id, name, email, role, managers)
#         self.team = team

#     def accept_arrangement(self, arrangement_id):
#         pass
    
#     def reject_arrangement(self, arrangement_id):
#         pass
    
#     def view_pending_arrangements(self):
#         pass
    
#     def view_team_arrangements(self):
#         pass
    
# class HR(Employee):
#     def edit_employee_role(employee_id, new_role):
#         pass
    
#     def view_employee_list(self):
#         pass
    
class Arrangement:
    def __init__(self, arrangement_id, employee_id, date, shift, status, details):
        self.arrangement_id = arrangement_id
        self.employee_id = employee_id
        self.date = date
        self.shift = shift
        self.status = status
        self.details = details
        
    def update_arrangement(self):
        pass
    
    def delete_arrangement(self):
        pass
    
    def change_status(self, status):
        pass

class RepeatedArrangement(Arrangement):
    def __init__(self, arrangement_id, employee_id, date, shift, status, details, day_of_week, exceptions):
        super().__init__(self, arrangement_id, employee_id, date, shift, status, details)
        self.day_of_week = day_of_week
        self.exceptions = exceptions