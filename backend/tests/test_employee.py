import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from unittest.mock import Mock, patch, MagicMock, ANY, call
from datetime import datetime
import json
from flask import Flask
from functools import wraps
from employee_view_own_ttbl import employee_view_own_bp
from employee_view_team_ttbl import employee_view_team_bp
from classes import TimetableService


class TestTimetableService(unittest.TestCase):
    @patch('firebase_admin.firestore.Client')
    def setUp(self, mock_firestore_client):
    # Mock Firestore client and initialize TimetableService
        self.mock_db = MagicMock()
        mock_firestore_client.return_value = self.mock_db
        self.service = TimetableService(db=self.mock_db)
        
        # Mock Firestore document data for employee arrangements
        self.mock_doc1 = MagicMock()
        self.mock_doc1.id = 'value1'
        self.mock_doc1.to_dict.return_value = {
            'employee_id': '123456',
            'date': datetime(2024, 1, 1),
            'supervisors': '100000'
        }
        
        self.mock_doc2 = MagicMock()
        self.mock_doc2.id = 'value2'
        self.mock_doc2.to_dict.return_value = {
            'employee_id': '123456',
            'date': datetime(2025, 6, 15),
            'supervisors': '100000'
        }
    
    
    def test_get_employee_arrangements(self):
        # Testing without date 
        # Mock query stream to return this document
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [self.mock_doc1]
        # Call the method
        arrangements = self.service.get_employee_arrangements('123456')
        # Assertions
        self.assertEqual(len(arrangements), 1)  # Ensure 1 arrangement returned
        self.assertEqual(arrangements[0].employee_id, '123456')
        self.mock_db.collection.assert_called_with('arrangements')  # Ensure collection was called
        
        # Testing with dates
        # Mock the behavior of the query with date filters
        query_mock = MagicMock()
        query_mock.where.return_value = query_mock

        # Simulate filtering within the date range by manually checking dates
        def stream_mock():
            # Return only the document that falls within the range
            if self.mock_doc2.to_dict()['date'] >= datetime(2025, 1, 1) and self.mock_doc2.to_dict()['date'] <= datetime(2026, 12, 31):
                return [self.mock_doc2]  # Only return self.mock_doc2 which fits within the date range
            return []  # Otherwise, return no documents

        query_mock.stream.side_effect = stream_mock
        self.mock_db.collection.return_value = query_mock
    
        # Call the method
        arrangements = self.service.get_employee_arrangements('123456', datetime(2025, 1, 1), datetime(2026, 12, 31))
        # Assertions
        self.assertEqual(len(arrangements), 1)  # Ensure 1 arrangement returned
        self.assertEqual(arrangements[0].date, datetime(2025, 6, 15))
        self.mock_db.collection.assert_called_with('arrangements')  # Ensure collection was called
        
    def test_get_employee_arrangements_error(self):
        # Mock Firestore client to raise an exception
        self.mock_db.collection.side_effect = Exception("Some error")
        
        # Capture logs when the exception is raised
        with self.assertLogs(level='ERROR') as log:
            arrangements = self.service.get_employee_arrangements('1')
        
        # Check if the exception message was printed
        self.assertIn("ERROR:root:Error getting employee arrangements: Some error", log.output)
        # Ensure it returns an empty list on error
        self.assertEqual(len(arrangements), 0)

    def test_get_team_arrangements(self):
        mock_user_doc = MagicMock()
        mock_user_doc.to_dict.return_value = {
            'rpt_manager': '100000'
        }
        
        self.mock_db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        self.mock_db.collection.return_value.where.return_value.stream.return_value = [self.mock_doc1, self.mock_doc2]
        
        arrangements = self.service.get_team_arrangements('123456')
        
        self.assertEqual(len(arrangements), 2)  # Two arrangements should be returned
        self.mock_db.collection.assert_called_with('arrangements')  # Ensure collection was called
        
# class TestEmployee(unittest.TestCase):
#     def setUp(self):
#         """Set up test client and mock Firebase"""
#         self.app = Flask(__name__)
#         self.app.register_blueprint(employee_view_own_bp)
#         self.app.register_blueprint(employee_view_team_bp)
#         self.client = self.app.test_client()
#         self.mock_values = {
#             'value1' : {
#                 'employee_id': '123456',
#                 'shift': 'AM',
#                 'date': datetime(2024, 11, 3),
#                 'supervisors': '100000'
#             },
#             'value2' : {
#                 'employee_id': '654321',
#                 'shift': 'PM',
#                 'date': datetime(2024, 10, 31),
#                 'supervisors': '100000'
#                 }
#         }
#         self.mock_db = MagicMock()