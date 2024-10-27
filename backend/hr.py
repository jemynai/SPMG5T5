import typing
class Employee:
    def __init__(self, user_id: int, country: str, dept: str, email: str, first_name: str, last_name: str, position: str, rpt_manager_id: str, hashed_password: typing.Optional[str] = None):
        
        self.user_id = user_id
        self.country = country
        self.dept = dept
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.position = position
        self.rpt_manager = rpt_manager_id
        self.hashed_password = hashed_password
        
        self.role = "employee"
        
    def to_dict(self):
        roles = {
            "employee": "2",
            "manager": "3",
            "hr": "1"
        }
        return {
            "user_id": self.user_id,
            "country": self.country,
            "dept": self.dept,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "position": self.position,
            "rpt_manager_id": self.rpt_manager,
            "hashed_password": self.hashed_password,
            "role": roles[self.role]
        }
        
class Manager(Employee):
    def __init__(self, user_id: int, country: str, dept: str, email: str, first_name: str, last_name: str, position: str, rpt_manager_id: str, hashed_password: str):
        super().__init__(user_id, country, dept, email, first_name, last_name, position, rpt_manager_id, hashed_password)
        self.role = "manager"

class HR(Employee):
    def __init__(self, user_id: int, country: str, dept: str, email: str, first_name: str, last_name: str, position: str, rpt_manager_id: str, hashed_password: str):
        super().__init__(user_id, country, dept, email, first_name, last_name, position, rpt_manager_id, hashed_password)
        self.role = "hr"
    
    @staticmethod
    def set_employee_role(employee: Employee, new_role: str):
        if employee.role == "hr":
            raise ValueError("HR cannot change the role of another HR")
        valid_roles = ["employee", "manager", "hr"]
        if new_role not in valid_roles:
            raise ValueError(f"Invalid role: {new_role}")

        employee.role = new_role
        
class EmployeeRepository:
    def __init__(self, db):
        self.db = db
        
    def get_employee(self, user_id):
        employee = self.db.collection("users").document(str(user_id)).get()
        if employee.exists:
            try:
                pw = employee.get("hashed_password")
            except:
                pw = None
            if employee.get("role") == "2":
                return Employee(user_id, employee.get("country"), employee.get("dept"), employee.get("email"), employee.get("first_name"), employee.get("last_name"), employee.get("position"), employee.get("rpt_manager"), pw)
            elif employee.get("role") == "3":
                return Manager(user_id, employee.get("country"), employee.get("dept"), employee.get("email"), employee.get("first_name"), employee.get("last_name"), employee.get("position"), employee.get("rpt_manager"), pw)
            elif employee.get("role") == "1":
                return HR(user_id, employee.get("country"), employee.get("dept"), employee.get("email"), employee.get("first_name"), employee.get("last_name"), employee.get("position"), employee.get("rpt_manager"), pw)
        else:
            return None

    def update_employee(self, employee: Employee):
        self.db.collection("users").document(str(employee.user_id)).update(employee.to_dict())
        