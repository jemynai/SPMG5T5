import requests
from typing import List, Dict, Optional
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime

# Initialize Firebase Admin
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_app = initialize_app(cred)
db = firestore.client()

class Employee:
    def __init__(self, user_id: str, name: str, email: str, role: str, managers: List[str], 
                 department: str = None, status: str = 'office'):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.role = role
        self.managers = managers
        self.department = department
        self.status = status
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Employee':
        return cls(
            user_id=data.get('user_id'),
            name=data.get('name'),
            email=data.get('email'),
            role=data.get('role'),
            managers=data.get('managers', []),
            department=data.get('department'),
            status=data.get('status', 'office')
        )

    def to_dict(self) -> Dict:
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'managers': self.managers,
            'department': self.department,
            'status': self.status,
            'lastUpdated': datetime.now()
        }
    
    def save_to_firebase(self):
        """Save employee data to Firebase"""
        try:
            db.collection('employees').document(self.user_id).set(self.to_dict())
            return True
        except Exception as e:
            print(f"Error saving employee to Firebase: {str(e)}")
            return False
    
    def update_status(self, new_status: str):
        """Update employee status in Firebase"""
        try:
            self.status = new_status
            db.collection('employees').document(self.user_id).update({
                'status': new_status,
                'lastUpdated': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error updating employee status: {str(e)}")
            return False

    def view_arrangements(self) -> List[Dict]:
        """View employee's arrangements from Firebase"""
        try:
            arrangements = db.collection('arrangements')\
                           .where('employee_id', '==', self.user_id)\
                           .stream()
            return [doc.to_dict() for doc in arrangements]
        except Exception as e:
            print(f"Error viewing arrangements: {str(e)}")
            return []

class Manager(Employee):
    def __init__(self, user_id: str, name: str, email: str, role: str, managers: List[str], 
                 team: List[str], department: str = None, status: str = 'office'):
        super().__init__(user_id, name, email, role, managers, department, status)
        self.team = team

    @classmethod
    def from_dict(cls, data: Dict) -> 'Manager':
        employee = super().from_dict(data)
        return cls(
            user_id=employee.user_id,
            name=employee.name,
            email=employee.email,
            role=employee.role,
            managers=employee.managers,
            team=data.get('team', []),
            department=employee.department,
            status=employee.status
        )

    def to_dict(self) -> Dict:
        data = super().to_dict()
        data['team'] = self.team
        return data

    def view_team_arrangements(self, status_filter: Optional[str] = None) -> List[Dict]:
        """View team arrangements from Firebase"""
        try:
            query = db.collection('arrangements')\
                     .where('department', '==', self.department)
            
            if status_filter:
                query = query.where('status', '==', status_filter)
                
            arrangements = query.stream()
            return [doc.to_dict() for doc in arrangements]
        except Exception as e:
            print(f"Error viewing team arrangements: {str(e)}")
            return []

    def update_arrangement_status(self, arrangement_id: str, new_status: str) -> bool:
        """Update arrangement status in Firebase"""
        try:
            db.collection('arrangements').document(arrangement_id).update({
                'status': new_status,
                'last_updated_by': self.user_id,
                'last_updated': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error updating arrangement status: {str(e)}")
            return False

class HR(Employee):
    def view_employee_list(self, department_filter: Optional[str] = None) -> List[Dict]:
        """View all employees from Firebase with optional department filter"""
        try:
            query = db.collection('employees')
            if department_filter:
                query = query.where('department', '==', department_filter)
                
            employees = query.stream()
            return [doc.to_dict() for doc in employees]
        except Exception as e:
            print(f"Error viewing employee list: {str(e)}")
            return []

    def edit_employee_role(self, employee_id: str, new_role: str) -> bool:
        """Update employee role in Firebase"""
        try:
            db.collection('employees').document(employee_id).update({
                'role': new_role,
                'last_updated_by': self.user_id,
                'last_updated': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error updating employee role: {str(e)}")
            return False

    def get_department_stats(self) -> Dict:
        """Get department statistics from Firebase"""
        try:
            employees = db.collection('employees').stream()
            stats = {}
            
            for emp in employees:
                emp_data = emp.to_dict()
                dept = emp_data.get('department')
                status = emp_data.get('status')
                
                if dept not in stats:
                    stats[dept] = {'total': 0, 'office': 0, 'remote': 0}
                
                stats[dept]['total'] += 1
                stats[dept][status] += 1
                
            return stats
        except Exception as e:
            print(f"Error getting department stats: {str(e)}")
            return {}

class Arrangement:
    def __init__(self, arrangement_id: str, employee_id: str, date: datetime, 
                 shift: str, status: str, details: Dict):
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
            'details': self.details,
            'last_updated': datetime.now()
        }

    def save_to_firebase(self) -> bool:
        """Save arrangement to Firebase"""
        try:
            db.collection('arrangements').document(self.arrangement_id).set(self.to_dict())
            return True
        except Exception as e:
            print(f"Error saving arrangement to Firebase: {str(e)}")
            return False

    def update_status(self, new_status: str, updated_by: str) -> bool:
        """Update arrangement status in Firebase"""
        try:
            self.status = new_status
            db.collection('arrangements').document(self.arrangement_id).update({
                'status': new_status,
                'last_updated_by': updated_by,
                'last_updated': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error updating arrangement status: {str(e)}")
            return False

class TimetableService:
    def __init__(self):
        self.db = db
        self.collection = 'arrangements'

    def get_department_arrangements(
        self, 
        department_id: str, 
        status_filter: Optional[str] = None
    ) -> List[Arrangement]:
        """Get department arrangements from Firebase"""
        try:
            query = self.db.collection(self.collection)\
                          .where('department', '==', department_id)
            
            if status_filter:
                query = query.where('status', '==', status_filter)
            
            docs = query.stream()
            return [Arrangement.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            print(f"Error getting department arrangements: {str(e)}")
            return []

    def get_employee_arrangements(
        self,
        employee_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Arrangement]:
        """Get employee arrangements from Firebase with optional date range"""
        try:
            query = self.db.collection(self.collection)\
                          .where('employee_id', '==', employee_id)
            
            if start_date and end_date:
                query = query.where('date', '>=', start_date)\
                           .where('date', '<=', end_date)
            
            docs = query.stream()
            return [Arrangement.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            print(f"Error getting employee arrangements: {str(e)}")
            return []