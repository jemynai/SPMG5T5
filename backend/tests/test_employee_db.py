import unittest
from unittest.mock import MagicMock
from hr import *


class TestGetEmployee(unittest.TestCase):

    def test_get_employee_existing_employee_role_2(self):
        db_mock = MagicMock()
        emp_repo = EmployeeRepository(db_mock)

        mock_employee = MagicMock()
        mock_employee.exists = True
        mock_employee.get.side_effect = lambda field: {
            "role": "2",
            "country": "US",
            "dept": "Engineering",
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "position": "Developer",
            "rpt_manager": "manager_id_1",
            "hashed_password": "hashed_password"
        }.get(field)

        db_mock.collection().document().get.return_value = mock_employee

        # Call the method
        employee = emp_repo.get_employee("user_id_1")

        # Assertions
        self.assertIsInstance(employee, Employee)
        self.assertNotIsInstance(employee, Manager)
        self.assertNotIsInstance(employee, HR)
        self.assertEqual(employee.first_name, "John")

    def test_get_employee_non_existent(self):
        db_mock = MagicMock()
        emp_repo = EmployeeRepository(db_mock)

        mock_employee = MagicMock()
        mock_employee.exists = False

        db_mock.collection().document().get.return_value = mock_employee

        # Call the method
        employee = emp_repo.get_employee("non_existent_user_id")

        # Assertions
        self.assertIsNone(employee)

    def test_get_employee_existing_employee_role_3(self):
        db_mock = MagicMock()
        emp_repo = EmployeeRepository(db_mock)

        mock_employee = MagicMock()
        mock_employee.exists = True
        mock_employee.get.side_effect = lambda field: {
            "role": "3",
            "country": "US",
            "dept": "Engineering",
            "email": "test@example.com",
            "first_name": "Jane",
            "last_name": "Doe",
            "position": "Manager",
            "rpt_manager": "manager_id_2",
            "hashed_password": "hashed_password"
        }.get(field)

        db_mock.collection().document().get.return_value = mock_employee

        # Call the method
        employee = emp_repo.get_employee("user_id_2")

        # Assertions
        self.assertIsInstance(employee, Manager)
        self.assertEqual(employee.first_name, "Jane")

    def test_get_employee_existing_employee_role_1(self):
        db_mock = MagicMock()
        emp_repo = EmployeeRepository(db_mock)

        mock_employee = MagicMock()
        mock_employee.exists = True
        mock_employee.get.side_effect = lambda field: {
            "role": "1",
            "country": "US",
            "dept": "HR",
            "email": "hr@example.com",
            "first_name": "Admin",
            "last_name": "User",
            "position": "HR Specialist",
            "rpt_manager": "manager_id_3",
            "hashed_password": "hashed_password"
        }.get(field)

        db_mock.collection().document().get.return_value = mock_employee

        # Call the method
        employee = emp_repo.get_employee("user_id_3")

        # Assertions
        self.assertIsInstance(employee, HR)
        self.assertEqual(employee.first_name, "Admin")
        
    def test_update_db(self):
        mock_db = MagicMock()
        
        
        hr = HR(1, "Singapore", "Dept1", "john.doe@example.com", "John", "Doe", "Pos1", "3", "password")
        employee = Employee(2, "Singapore", "Dept2", "jane.doe@example.com", "Jane", "Doe", "Pos2", "3", "password")
        
        hr.set_employee_role(employee, "manager")

        employee_repository = EmployeeRepository(mock_db)
        employee_repository.update_employee(employee)

        mock_db.collection().document().update.assert_called_once_with({'user_id': 2, 'country': 'Singapore', 'dept': 'Dept2', 'email': 'jane.doe@example.com', 'first_name': 'Jane', 'last_name': 'Doe', 'position': 'Pos2', 'rpt_manager': '3', 'hashed_password': 'password', 'role': '3'})