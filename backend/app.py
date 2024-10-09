from flask import Flask
from users import users_bp
from arrangements import arrangement_bp
from withdrawals import withdrawal_bp
from apply import apply_bp 

app = Flask(__name__)

# Register all blueprints
app.register_blueprint(users_bp)
app.register_blueprint(arrangement_bp)
app.register_blueprint(withdrawal_bp)
app.register_blueprint(apply_bp) 

if __name__ == '__main__':
    app.run(debug=True)
