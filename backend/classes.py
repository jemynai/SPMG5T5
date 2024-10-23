import requests

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
        # Check the status code and print the response
        if response.status_code == 200:
            print("Success!")
            print(response.text)  # Get the response content
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
    
    def view_team_arrangements(self):
        pass
    
class HR(Employee):
    def edit_employee_role(employee_id, new_role):
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