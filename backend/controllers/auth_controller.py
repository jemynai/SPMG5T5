from flask import request, jsonify
from services.auth_service import AuthService
from controllers.controller import Controller
from auth_filter import JwtRequestFilter

class AuthController(Controller):
    def __init__(self):
        super().__init__('auth')
        self.auth_service = AuthService()
        self.register_routes()

    def register_routes(self):
        self.register_route('/login', 'login', self.login, methods=['POST'])
        self.register_route('/protected-hr', 'protected1', self.protected_route_hr, methods=['GET'])
        self.register_route('/protected-hr-manager', 'protected2', self.protected_route_hr_manager, methods=['GET'])
        self.register_route('/protected-employee', 'protected3', self.protected_route_employee, methods=['GET'])

    def login(self):
        data = request.json
        response = self.auth_service.authenticate(data['email'], data['password'])
        if response:
            return jsonify(response), 200
        else:
            return jsonify({'message': 'Login Failed'}), 401

    @JwtRequestFilter().token_required(roles=['hr'])
    def protected_route_hr(self):
        return jsonify({'message': 'You are authorized to access this route!'}), 200

    @JwtRequestFilter().token_required(roles=['hr', 'manager'])
    def protected_route_hr_manager(self):
        return jsonify({'message': 'You are authorized to access this route!'}), 200
    
    @JwtRequestFilter().token_required(roles=['employee'])
    def protected_route_employee(self):
        return jsonify({'message': 'You are authorized to access this route!'}), 200