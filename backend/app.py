from flask import Flask,request
from users import users_bp
from arrangements import arrangement_bp
from withdrawals import withdrawal_bp
from mngr_view_ttbl import mngr_view_bp
from hr_view_ttbl import hr_view_bp
from employee_view_own_ttbl import employee_view_own_bp
from controllers.auth_controller import AuthController
from controllers.employee_controller import EmployeeController
from employee_view_team_ttbl import employee_view_team_bp
from apply import apply_bp 
from flask_cors import CORS
from CancelRequest import pending_request_bp
from Appr_Rej import Appr_Rej_bp


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

# Register all blueprints
app.register_blueprint(users_bp)
app.register_blueprint(arrangement_bp)
app.register_blueprint(withdrawal_bp)
app.register_blueprint(apply_bp) 
app.register_blueprint(mngr_view_bp)
app.register_blueprint(hr_view_bp)
app.register_blueprint(employee_view_own_bp)
app.register_blueprint(employee_view_team_bp)
app.register_blueprint(pending_request_bp)
app.register_blueprint(Appr_Rej_bp)
app.register_blueprint(AuthController().bp)
app.register_blueprint(EmployeeController().bp)

# if mac has issue running, change to port 8000
if __name__ == '__main__':
    app.run(debug=True)
