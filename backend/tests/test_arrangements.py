import unittest
from flask import Flask
from arrangements import arrangement_bp
from services.firebase import Firebase

class TestArrangements(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = Flask(__name__)
        cls.app.register_blueprint(arrangement_bp)
        cls.client = cls.app.test_client()
        cls.db = Firebase().get_db()

    def test_create_arrangement(self):
        response = self.client.post('/create_arrangement', json={
            'employee_id': 'test_employee_123',
            'date': '2024-11-01T00:00:00Z',
            'type': 'one-time',
            'days': ['Monday'],
            'halfDay': 'Full Day',
            'reason': 'Test reason',
            'status': 'Pending',
            'shift': 'Morning',
            'supervisors': ['supervisor1'],
            'notes': 'This is a test note'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Arrangement created', response.get_json()['message'])

    def test_get_arrangements(self):
        response = self.client.get('/get_arrangements?eid=test_employee_123')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json()['arrangements'], list)

if __name__ == '__main__':
    unittest.main()
