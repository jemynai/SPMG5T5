from flask import Flask
from flask_cors import CORS
from users import users_bp
from arrangements import arrangement_bp
from withdrawals import withdrawal_bp

app = Flask(__name__)
CORS(app)

# Register all blueprints
app.register_blueprint(users_bp)
app.register_blueprint(arrangement_bp)
app.register_blueprint(withdrawal_bp)

if __name__ == '__main__':
    app.run(debug=True)
