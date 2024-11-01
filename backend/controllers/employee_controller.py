from flask import request, jsonify
from controllers.controller import Controller
from services.employee_service import EmployeeService

class EmployeeController(Controller):
    def __init__(self):
        super().__init__('employee')
        self.employee_service = EmployeeService()
        self.register_routes()
    
    def register_routes(self):
        self.register_route('/create-employee', 'create_employee', self.create_employee, methods=['POST'])
    
    def create_employee(self):
        data = request.json
        response = self.employee_service.create_employee(data)
        if response:
            return jsonify(response), 200
        else:
            return jsonify({'message': 'Employee creation failed'}), 400