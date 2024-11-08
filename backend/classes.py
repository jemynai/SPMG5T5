from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime
from firebase_admin import credentials, firestore
import logging

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
    def __init__(self, user_id: str, name: Name, contact_info: ContactInfo, job_details: JobDetails, role: str, password: str = None):
        self.user_id = user_id
        self.name = name
        self.contact_info = contact_info
        self.job_details = job_details
        self.role = role
        self.password = password
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Employee':
        name = Name(
            first_name=data.get('name', {}).get('first_name', ''),
            last_name=data.get('name', {}).get('last_name', '')
        )
        contact_info = ContactInfo(
            email=data.get('contact_info', {}).get('email', ''),
            country=data.get('contact_info', {}).get('country', '')
        )
        job_details = JobDetails(
            dept=data.get('job_details', {}).get('dept', ''),
            position=data.get('job_details', {}).get('position', ''),
            manager=data.get('job_details', {}).get('manager', '')
        )
        return cls(
            user_id=data.get('user_id'),
            name=name,
            contact_info=contact_info,
            job_details=job_details,
            role=data.get('role'),
            managers=data.get('managers', []),
            department=data.get('department'),
            status=data.get('status', 'office'),
            password=data.get('password')
        )

    def to_dict(self) -> Dict:
        return {
            'user_id': self.user_id,
            'name': {
                'first_name': self.name.first_name,
                'last_name': self.name.last_name
            },
            'contact_info': {
                'email': self.contact_info.email,
                'country': self.contact_info.country
            },
            'job_details': {
                'dept': self.job_details.dept,
                'position': self.job_details.position,
                'manager': self.job_details.manager
            },
            'role': self.role,
            'password': self.password,
        }

    def save_to_firebase(self, db: firestore.Client) -> bool:
        try:
            db.collection('employees').document(self.user_id).set(self.to_dict())
            return True
        except Exception as e:
            print(f"Error saving employee to Firebase: {str(e)}")
            return False
    
    def update_status(self, db: firestore.Client, new_status: str) -> bool:
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

    def view_arrangements(self, db: firestore.Client) -> List[Dict]:
        try:
            arrangements = db.collection('arrangements')\
                           .where('employee_id', '==', self.user_id)\
                           .stream()
            return [doc.to_dict() for doc in arrangements]
        except Exception as e:
            print(f"Error viewing arrangements: {str(e)}")
            return []

class Manager(Employee):
    def __init__(self, user_id: str, name: Name, contact_info: ContactInfo, 
                 job_details: JobDetails, role: str, managers: List[str], 
                 team: List[str], department: str = None, status: str = 'office'):
        super().__init__(user_id, name, contact_info, job_details, role, managers, department, status)
        self.team = team

    @classmethod
    def from_dict(cls, data: Dict) -> 'Manager':
        name = Name(
            first_name=data.get('name', {}).get('first_name', ''),
            last_name=data.get('name', {}).get('last_name', '')
        )
        contact_info = ContactInfo(
            email=data.get('contact_info', {}).get('email', ''),
            country=data.get('contact_info', {}).get('country', '')
        )
        job_details = JobDetails(
            dept=data.get('job_details', {}).get('dept', ''),
            position=data.get('job_details', {}).get('position', ''),
            manager=data.get('job_details', {}).get('manager', '')
        )
        return cls(
            user_id=data.get('user_id'),
            name=name,
            contact_info=contact_info,
            job_details=job_details,
            role=data.get('role'),
            managers=data.get('managers', []),
            team=data.get('team', []),
            department=data.get('department'),
            status=data.get('status', 'office')
        )

    def to_dict(self) -> Dict:
        data = super().to_dict()
        data['team'] = self.team
        return data

    def view_team_arrangements(self, db: firestore.Client, status_filter: Optional[str] = None) -> List[Dict]:
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

    def update_arrangement_status(self, db: firestore.Client, arrangement_id: str, new_status: str) -> bool:
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
    def view_employee_list(self, db: firestore.Client, department_filter: Optional[str] = None) -> List[Dict]:
        try:
            query = db.collection('employees')
            if department_filter:
                query = query.where('department', '==', department_filter)
                
            employees = query.stream()
            return [doc.to_dict() for doc in employees]
        except Exception as e:
            print(f"Error viewing employee list: {str(e)}")
            return []

    def edit_employee_role(self, db: firestore.Client, employee_id: str, new_role: str) -> bool:
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

    def get_department_stats(self, db: firestore.Client) -> Dict:
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

@dataclass
class ArrangementDetails:
    location: str
    description: str
    approved_by: Optional[str] = None

class Arrangement:
    def __init__(self, arrangement_id: str, employee_id: str, date: datetime, 
                 shift: str, status: str, details: ArrangementDetails):
        self.arrangement_id = arrangement_id
        self.employee_id = employee_id
        self.date = date
        self.shift = shift
        self.status = status
        self.details = details
        
    @classmethod
    def from_dict(cls, arrangement_id: str, data: Dict) -> 'Arrangement':
        details_data = data.get('details', {})
        details = ArrangementDetails(
            location=details_data.get('location', ''),
            description=details_data.get('description', ''),
            approved_by=details_data.get('approved_by')
        )
        return cls(
            arrangement_id=arrangement_id,
            employee_id=data.get('employee_id'),
            date=data.get('date'),
            shift=data.get('shift'),
            status=data.get('status'),
            details=details
        )
        
    def to_dict(self) -> Dict:
        return {
            'id': self.arrangement_id,
            'employee_id': self.employee_id,
            'date': self.date,
            'shift': self.shift,
            'status': self.status,
            'details': {
                'location': self.details.location,
                'description': self.details.description,
                'approved_by': self.details.approved_by
            },
            'last_updated': datetime.now()
        }

    def save_to_firebase(self, db: firestore.Client) -> bool:
        try:
            db.collection('arrangements').document(self.arrangement_id).set(self.to_dict())
            return True
        except Exception as e:
            print(f"Error saving arrangement to Firebase: {str(e)}")
            return False

    def update_status(self, db: firestore.Client, new_status: str, updated_by: str) -> bool:
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
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = 'arrangements'

    def get_department_arrangements(
        self, 
        department_id: str, 
        status_filter: Optional[str] = None
    ) -> List[Arrangement]:
        try:
            query = self.db.collection(self.collection)\
                          .where('department_id', '==', department_id)
            
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
        try:
            query = self.db.collection(self.collection)\
                          .where('employee_id', '==', employee_id)
            
            if start_date and end_date:
                query = query.where('date', '>=', start_date)\
                           .where('date', '<=', end_date)
            
            docs = query.stream()
            return [Arrangement.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            logging.error(f"Error getting employee arrangements: {str(e)}")
            return []
        
    def get_team_arrangements(
        self,
        employee_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Arrangement]:
        try:
            user_doc = self.db.collection('users')\
                        .document(employee_id).get().to_dict()
            
            rpt_manager = user_doc['rpt_manager']
            # return rpt_manager
            query = self.db.collection('arrangements')\
                        .where('supervisors', '==', str(rpt_manager))
            if start_date and end_date:
                query = query.where('date', '>=', start_date)\
                        .where('date', '<=', end_date)
            docs = query.stream()
            # broken
            return [Arrangement.from_dict(doc.id, doc.to_dict()) for doc in docs]
        except Exception as e:
            print(f"Error getting employee arrangements: {str(e)}")
            return []