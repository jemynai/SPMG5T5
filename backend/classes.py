import requests
from typing import List, Dict, Optional
from firebase_admin import firestore
from datetime import datetime

class Employee:
    def __init__(self, user_id, name, email, role, managers):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.role = role
        self.managers = managers
    
    def login(self):
        pass
    
    def logout(self):
        pass
    
    def create_arrangement(self):
        pass
    
    def delete_arrangement(self):
        pass
    
    def view_arrangements(self):
        response = requests.get(f"http://localhost:8000/employee_view_own_ttbl?eid={self.user_id}")
        if response.status_code == 200:
            print("Success!")
            print(response.text)
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)

class Manager(Employee):
    def __init__(self, user_id, name, email, role, managers, team):
        super().__init__(user_id, name, email, role, managers)
        self.team = team

    def accept_arrangement(self, arrangement_id):
        pass
    
    def reject_arrangement(self, arrangement_id):
        pass
    
    def view_pending_arrangements(self):
        pass
    
    def view_team_arrangements(self, status_filter: Optional[str] = None) -> List[Dict]:
        url = f"http://localhost:8000/mngr_view_ttbl?department_id={self.user_id}"
        if status_filter:
            url += f"&status={status_filter}"
            
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json().get('arrangements', [])
        except requests.exceptions.RequestException as e:
            print(f"Error viewing team arrangements: {str(e)}")
            return []
    
class HR(Employee):
    def edit_employee_role(self, employee_id, new_role):
        pass
    
    def view_employee_list(self):
        pass

class Arrangement:
    def __init__(self, arrangement_id, employee_id, date, shift, status, details):
        self.arrangement_id = arrangement_id
        self.employee_id = employee_id
        self.date = date
        self.shift = shift
        self.status = status
        self.details = details
        
    @classmethod
    def from_dict(cls, arrangement_id: str, data: Dict) -> 'Arrangement':
        return cls(
            arrangement_id=arrangement_id,
            employee_id=data.get('employee_id'),
            date=data.get('date'),
            shift=data.get('shift'),
            status=data.get('status'),
            details=data.get('details', {})
        )
        
    def to_dict(self) -> Dict:
        return {
            'id': self.arrangement_id,
            'employee_id': self.employee_id,
            'date': self.date,
            'shift': self.shift,
            'status': self.status,
            'details': self.details
        }
        
    def update_arrangement(self):
        pass
    
    def delete_arrangement(self):
        pass
    
    def change_status(self, status):
        pass

class RepeatedArrangement(Arrangement):
    def __init__(self, arrangement_id, employee_id, date, shift, status, details, day_of_week, exceptions):
        super().__init__(arrangement_id, employee_id, date, shift, status, details)
        self.day_of_week = day_of_week
        self.exceptions = exceptions

class TimetableService:
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = 'arrangements'

    def get_department_arrangements(
        self, 
        department_id: str, 
        status_filter: Optional[str] = None
    ) -> List[Arrangement]:
        if not department_id:
            raise ValueError("Department ID is required")

        query = self.db.collection(self.collection).where(
            'supervisors', 'array_contains', department_id
        )
        
        if status_filter:
            query = query.where('status', '==', status_filter)
        
        arrangements = []
        for doc in query.stream():
            arrangement = Arrangement.from_dict(doc.id, doc.to_dict())
            arrangements.append(arrangement)
            
        return arrangements