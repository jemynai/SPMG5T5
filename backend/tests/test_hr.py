import unittest
from hr import *

class TestEmployeeMethods(unittest.TestCase):
    def setUp(self):
        self.hr = HR(1, "Singapore", "Dept1", "john.doe@example.com", "John", "Doe", "Pos1", "3", "password")
        self.emp = Employee(2, "Singapore", "Dept2", "jane.doe@example.com", "Jane", "Doe", "Pos2", "3", "password")
        self.manager = Manager(3, "Singapore", "Dept3", "mike.tan@example.com", "Mike", "Tan", "Pos3", "3", "password")

    def test_employee(self):
        employee = self.emp
        self.assertEqual(employee.role, "employee")
        self.assertEqual(employee.user_id, 2)
        self.assertEqual(employee.country, "Singapore")
        self.assertEqual(employee.dept, "Dept2")
        self.assertEqual(employee.email, "jane.doe@example.com")
        self.assertEqual(employee.first_name, "Jane")
        self.assertEqual(employee.last_name, "Doe")
        self.assertEqual(employee.position, "Pos2")
        self.assertEqual(employee.rpt_manager, "3")
        self.assertEqual(employee.hashed_password, "password")
        
    def test_employee_to_dict(self):
        employee = self.emp
        employee_dict = employee.to_dict()
        self.assertEqual(employee_dict, {'user_id': 2, 'country': 'Singapore', 'dept': 'Dept2', 'email': 'jane.doe@example.com', 'first_name': 'Jane', 'last_name': 'Doe', 'position': 'Pos2', 'rpt_manager': '3', 'hashed_password': 'password', 'role': '2'})

    def test_manager(self):
        manager = self.manager
        self.assertEqual(manager.role, "manager")
        self.assertEqual(manager.user_id, 3)
        self.assertEqual(manager.country, "Singapore")
        self.assertEqual(manager.dept, "Dept3")
        self.assertEqual(manager.email, "mike.tan@example.com")
        self.assertEqual(manager.first_name, "Mike")
        self.assertEqual(manager.last_name, "Tan")
        self.assertEqual(manager.position, "Pos3")
        self.assertEqual(manager.rpt_manager, "3")
        self.assertEqual(manager.hashed_password, "password")

    def test_hr(self):
        hr = self.hr
        self.assertEqual(hr.role, "hr")
        self.assertEqual(hr.user_id, 1)
        self.assertEqual(hr.country, "Singapore")
        self.assertEqual(hr.dept, "Dept1")
        self.assertEqual(hr.email, "john.doe@example.com")
        self.assertEqual(hr.first_name, "John")
        self.assertEqual(hr.last_name, "Doe")
        self.assertEqual(hr.position, "Pos1")
        self.assertEqual(hr.rpt_manager, "3")
        self.assertEqual(hr.hashed_password, "password")
    
    def test_hr_set_employee_role_invalid_role(self):
        hr = self.hr
        employee = self.emp
        with self.assertRaises(ValueError):
            hr.set_employee_role(employee, "invalid_role")
    
    def test_hr_set_employee_role(self):
        hr = self.hr
        employee = self.emp
        hr.set_employee_role(employee, "employee")
        self.assertEqual(employee.role, "employee")
        hr.set_employee_role(employee, "manager")
        self.assertEqual(employee.role, "manager")
        hr.set_employee_role(employee, "hr")
        self.assertEqual(employee.role, "hr")
            
    def test_hr_set_employee_role_hr_cannot_change_role(self):
        hr = self.hr
        employee = self.emp
        hr.set_employee_role(employee, "hr")
        self.assertEqual(employee.role, "hr")
        with self.assertRaises(ValueError):
            hr.set_employee_role(employee, "manager")
