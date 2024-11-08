import unittest
from unittest.mock import Mock, patch, MagicMock
from flask import Flask
from datetime import datetime, timezone
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mngr_view_ttbl import mngr_view_bp

class TestManagerView(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(mngr_view_bp)
        self.client = self.app.test_client()
        self.valid_token = 'valid_token'
        self.manager_id = 'manager123'
        self.employee_id = 'employee123'
        
        self.mock_claims = {
            'uid': self.manager_id
        }
        
        self.mock_manager = {
            'role': 'manager',
            'dept': 'Engineering',
            'first_name': 'John',
            'last_name': 'Manager'
        }
        
        self.mock_employee = {
            'first_name': 'Jane',
            'last_name': 'Employee',
            'dept': 'Engineering',
            'position': 'Developer',
            'status': 'office',
            'email': 'jane@company.com',
            'country': 'USA'
        }

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_get_employees_success(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = self.mock_manager
        
        mock_employee_doc = MagicMock()
        mock_employee_doc.id = self.employee_id
        mock_employee_doc.to_dict.return_value = self.mock_employee
        
        mock_db.collection().document().get.return_value = mock_manager_doc
        mock_db.collection().where().stream.return_value = [mock_employee_doc]
        
        response = self.client.get('/employees', headers={'Authorization': f'Bearer {self.valid_token}'})
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('employees', data)
        self.assertEqual(len(data['employees']), 1)
        
        employee = data['employees'][0]
        self.assertEqual(employee['id'], self.employee_id)
        self.assertEqual(employee['name'], 'Jane Employee')
        self.assertEqual(employee['department'], 'Engineering')
        self.assertEqual(employee['status'], 'office')

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_employees_no_token(self, mock_verify_token):
        response = self.client.get('/employees')
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.get_json())

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_get_employees_unauthorized_role(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = {**self.mock_manager, 'role': 'employee'}
        
        mock_db.collection().document().get.return_value = mock_manager_doc
        
        response = self.client.get('/employees', headers={'Authorization': f'Bearer {self.valid_token}'})
        
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.get_json())

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_update_employee_status_success(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = self.mock_manager
        
        mock_employee_doc = MagicMock()
        mock_employee_doc.exists = True
        mock_employee_doc.to_dict.return_value = self.mock_employee
        
        mock_db.collection().document().get.side_effect = [mock_manager_doc, mock_employee_doc]
        
        response = self.client.put(
            f'/employee/{self.employee_id}/status',
            headers={'Authorization': f'Bearer {self.valid_token}'},
            json={'status': 'remote'}
        )
        
        self.assertEqual(response.status_code, 200)
        mock_db.collection().document().update.assert_called_once()

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_update_employee_status_invalid_status(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        response = self.client.put(
            f'/employee/{self.employee_id}/status',
            headers={'Authorization': f'Bearer {self.valid_token}'},
            json={'status': 'invalid_status'}
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_update_employee_status_different_department(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = self.mock_manager
        
        mock_employee_doc = MagicMock()
        mock_employee_doc.exists = True
        mock_employee_doc.to_dict.return_value = {**self.mock_employee, 'dept': 'Different'}
        
        mock_db.collection().document().get.side_effect = [mock_manager_doc, mock_employee_doc]
        
        response = self.client.put(
            f'/employee/{self.employee_id}/status',
            headers={'Authorization': f'Bearer {self.valid_token}'},
            json={'status': 'remote'}
        )
        
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.get_json())

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_get_employees_with_status_filter(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = self.mock_manager
        
        mock_employee_doc = MagicMock()
        mock_employee_doc.id = self.employee_id
        mock_employee_doc.to_dict.return_value = self.mock_employee
        
        mock_db.collection().document().get.return_value = mock_manager_doc
        mock_db.collection().where().where().stream.return_value = [mock_employee_doc]
        
        response = self.client.get(
            '/employees?status=office',
            headers={'Authorization': f'Bearer {self.valid_token}'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('employees', data)
        self.assertEqual(len(data['employees']), 1)
        self.assertEqual(data['employees'][0]['status'], 'office')

    @patch('firebase_admin.auth.verify_id_token')
    @patch('mngr_view_ttbl.db')
    def test_get_employees_empty_department(self, mock_db, mock_verify_token):
        mock_verify_token.return_value = self.mock_claims
        
        mock_manager_doc = MagicMock()
        mock_manager_doc.exists = True
        mock_manager_doc.to_dict.return_value = {**self.mock_manager, 'dept': None}
        
        mock_db.collection().document().get.return_value = mock_manager_doc
        
        response = self.client.get('/employees', headers={'Authorization': f'Bearer {self.valid_token}'})
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_cors_headers(self):
        response = self.client.options('/employees', headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:5173')
        self.assertEqual(response.headers.get('Access-Control-Allow-Credentials'), 'true')
        self.assertIn('Authorization', response.headers.get('Access-Control-Allow-Headers'))

if __name__ == '__main__':
    unittest.main()