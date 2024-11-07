import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest import TestCase, main
from unittest.mock import Mock, patch, MagicMock, ANY, call
from datetime import datetime
import json
from flask import Flask
from functools import wraps
from hr_view_ttbl import hr_view_bp, db

class TestHRManager(TestCase):
    def setUp(self):
        """Set up test client and mock Firebase"""
        self.app = Flask(__name__)
        self.app.register_blueprint(hr_view_bp)
        self.client = self.app.test_client()
        
        # Setup mock data
        self.mock_employees = [
            {
                'id': '1',
                'first_name': 'John',
                'last_name': 'Doe',
                'dept': 'Engineering',
                'position': 'Senior Developer',
                'status': 'office',
                'email': 'john.doe@example.com'
            },
            {
                'id': '2',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'dept': 'HR',
                'position': 'HR Manager',
                'status': 'remote',
                'email': 'jane.smith@example.com'
            }
        ]
        
        # Setup mock for Firebase
        self.mock_db = MagicMock()
        self.db_patcher = patch('hr_view_ttbl.db', self.mock_db)
        self.db_patcher.start()

    def tearDown(self):
        """Clean up patches"""
        self.db_patcher.stop()

    def test_get_departments_success(self):
        """Test 1: Successfully get departments list"""
        mock_docs = [
            Mock(to_dict=lambda: {'dept': 'Engineering'}),
            Mock(to_dict=lambda: {'dept': 'HR'}),
            Mock(to_dict=lambda: {'dept': 'Engineering'})
        ]
        
        collection_mock = MagicMock()
        limit_mock = MagicMock()
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.limit.return_value = limit_mock
        limit_mock.stream.return_value = mock_docs
        
        response = self.client.get('/departments')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(sorted(data['departments']), ['Engineering', 'HR'])
        self.mock_db.collection.assert_called_with('users')

    def test_get_departments_empty(self):
        """Test 2: Get departments when no departments exist"""
        collection_mock = MagicMock()
        limit_mock = MagicMock()
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.limit.return_value = limit_mock
        limit_mock.stream.return_value = []
        
        response = self.client.get('/departments')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['departments'], [])

    def test_get_employees_with_pagination(self):
        """Test 3: Get employees with pagination"""
        mock_docs = [Mock(id='1', to_dict=lambda: self.mock_employees[0])]
        
        collection_mock = MagicMock()
        order_mock = MagicMock()
        limit_mock = MagicMock()
        offset_mock = MagicMock()
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.order_by.return_value = order_mock
        order_mock.limit.return_value = limit_mock
        limit_mock.offset.return_value = offset_mock
        offset_mock.stream.return_value = mock_docs
        
        response = self.client.get('/employees?page=2&per_page=1')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['employees']), 1)
        self.assertEqual(data['pagination']['page'], 2)
        self.assertEqual(data['pagination']['per_page'], 1)

    def test_get_employees_with_department_filter(self):
        """Test 4: Get employees filtered by department"""
        mock_docs = [Mock(id='1', to_dict=lambda: self.mock_employees[0])]
        
        collection_mock = MagicMock()
        where_mock = MagicMock()
        order_mock = MagicMock()
        limit_mock = MagicMock()
        offset_mock = MagicMock()
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.where.return_value = where_mock
        where_mock.order_by.return_value = order_mock
        order_mock.limit.return_value = limit_mock
        limit_mock.offset.return_value = offset_mock
        offset_mock.stream.return_value = mock_docs
        
        response = self.client.get('/employees?department=Engineering')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['employees'][0]['department'], 'Engineering')
        collection_mock.where.assert_called_with('dept', '==', 'Engineering')

    def test_get_employees_with_search(self):
        """Test 5: Get employees with search term"""
        mock_docs = [Mock(id='1', to_dict=lambda: self.mock_employees[0])]
        
        collection_mock = MagicMock()
        order_mock = MagicMock()
        limit_mock = MagicMock()
        offset_mock = MagicMock()
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.order_by.return_value = order_mock
        order_mock.limit.return_value = limit_mock
        limit_mock.offset.return_value = offset_mock
        offset_mock.stream.return_value = mock_docs
        
        response = self.client.get('/employees?search=john')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['employees']), 1)
        self.assertIn('John', data['employees'][0]['name'])

    def test_update_employee_status_success(self):
        """Test 6: Successfully update employee status"""
        employee_id = '1'
        new_status = 'remote'
        
        # Mock collections
        users_collection = MagicMock()
        schedules_collection = MagicMock()
        
        # Mock document references
        user_doc_ref = MagicMock()
        schedule_doc_ref = MagicMock()
        
        # Mock document data
        mock_doc = Mock(exists=True)
        mock_doc.to_dict.return_value = self.mock_employees[0]
        
        # Configure base collection access
        def collection_side_effect(name):
            if name == 'users':
                return users_collection
            if name == 'schedules':
                return schedules_collection
            raise ValueError(f"Unexpected collection: {name}")
        
        self.mock_db.collection.side_effect = collection_side_effect
        
        # Configure users collection chain
        users_collection.document.return_value = user_doc_ref
        user_doc_ref.get.return_value = mock_doc
        
        # Configure schedules collection
        schedules_collection.document.return_value = schedule_doc_ref
        
        # Mock the transaction decorator
        def mock_transaction_decorator(wrapped_func):
            @wraps(wrapped_func)
            def wrapper(*args, **kwargs):
                transaction_mock = MagicMock()
                # Actually run the wrapped function with our mock transaction
                result = wrapped_func(transaction_mock)
                # Verify transaction operations
                expected_user_update = {
                    'status': new_status.lower(),
                    'lastUpdated': ANY
                }
                transaction_mock.update.assert_called_with(user_doc_ref, expected_user_update)
                transaction_mock.set.assert_called_once()
                return result
            return wrapper
        
        self.mock_db.transaction = mock_transaction_decorator
        
        # Make request
        response = self.client.put(
            f'/employee/{employee_id}/status',
            json={'status': new_status}
        )
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], f'Status updated to {new_status}')
        
        # Verify document operations
        users_collection.document.assert_called_with(employee_id)
        user_doc_ref.get.assert_called_once()
        self.assertEqual(schedules_collection.document.call_count, 1)

    def test_update_employee_status_invalid_status(self):
        """Test 7: Update employee status with invalid status"""
        employee_id = '1'
        invalid_status = 'invalid'
        
        response = self.client.put(
            f'/employee/{employee_id}/status',
            json={'status': invalid_status}
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid status value', response.json['error'])

    def test_update_employee_status_not_found(self):
        """Test 8: Update status for non-existent employee"""
        employee_id = 'nonexistent'
        
        collection_mock = MagicMock()
        doc_ref = MagicMock()
        mock_doc = Mock(exists=False)
        
        self.mock_db.collection.return_value = collection_mock
        collection_mock.document.return_value = doc_ref
        doc_ref.get.return_value = mock_doc
        
        response = self.client.put(
            f'/employee/{employee_id}/status',
            json={'status': 'remote'}
        )
        
        self.assertEqual(response.status_code, 404)
        self.assertIn('Employee not found', response.json['error'])

    def test_get_employee_schedule_success(self):
        """Test 9: Successfully get employee schedule"""
        employee_id = '1'
        mock_schedules = [
            {
                'date': '2024-03-07',
                'status': 'office',
                'hours': '9:00-17:00',
                'department': 'Engineering'
            }
        ]
        
        # Mock user document
        users_collection = MagicMock()
        user_doc_ref = MagicMock()
        mock_user_doc = Mock(exists=True)
        mock_user_doc.to_dict.return_value = self.mock_employees[0]
        
        # Mock schedules query chain
        schedules_collection = MagicMock()
        where_mock = MagicMock()
        order_mock = MagicMock()
        limit_mock = MagicMock()
        
        # Mock schedule docs
        mock_schedule_docs = [Mock(to_dict=lambda: schedule) for schedule in mock_schedules]
        
        # Configure collections
        self.mock_db.collection.side_effect = lambda name: {
            'users': users_collection,
            'schedules': schedules_collection
        }[name]
        
        # Configure user document chain
        users_collection.document.return_value = user_doc_ref
        user_doc_ref.get.return_value = mock_user_doc
        
        # Configure schedules chain
        schedules_collection.where.return_value = where_mock
        where_mock.order_by.return_value = order_mock
        order_mock.limit.return_value = limit_mock
        limit_mock.stream.return_value = mock_schedule_docs
        
        response = self.client.get(f'/employee/{employee_id}/schedule')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['schedules']), 1)
        self.assertEqual(data['schedules'][0]['status'], 'office')

    def test_get_employee_schedule_with_date_filter(self):
        """Test 10: Get employee schedule with date filter"""
        employee_id = '1'
        mock_schedules = [
            {
                'date': '2024-03-07',
                'status': 'office',
                'hours': '9:00-17:00',
                'department': 'Engineering'
            }
        ]
        
        # Mock user document
        users_collection = MagicMock()
        user_doc_ref = MagicMock()
        mock_user_doc = Mock(exists=True)
        mock_user_doc.to_dict.return_value = self.mock_employees[0]
        
        # Mock schedules query chain
        schedules_collection = MagicMock()
        where_employee = MagicMock()
        where_start = MagicMock()
        where_end = MagicMock()
        order_by = MagicMock()
        limit = MagicMock()
        
        # Mock schedule docs
        mock_schedule_docs = [Mock(to_dict=lambda: schedule) for schedule in mock_schedules]
        
        # Configure collection mocks
        self.mock_db.collection.side_effect = lambda name: {
            'users': users_collection,
            'schedules': schedules_collection
        }[name]
        
        # Configure user document chain
        users_collection.document.return_value = user_doc_ref
        user_doc_ref.get.return_value = mock_user_doc
        
        # Configure schedules query chain
        schedules_collection.where.return_value = where_employee
        where_employee.where.return_value = where_start
        where_start.where.return_value = where_end
        where_end.order_by.return_value = order_by
        order_by.limit.return_value = limit
        limit.stream.return_value = mock_schedule_docs
        
        # Make request
        response = self.client.get(
            f'/employee/{employee_id}/schedule?start_date=2024-03-01&end_date=2024-03-31'
        )
        data = json.loads(response.data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['schedules']), 1)
        self.assertEqual(data['schedules'][0]['date'], '2024-03-07')
        
        # Verify the query chain
        schedules_collection.where.assert_called_with('employee_id', '==', employee_id)
        where_employee.where.assert_called_with('date', '>=', '2024-03-01')
        where_start.where.assert_called_with('date', '<=', '2024-03-31')

if __name__ == '__main__':
    main()