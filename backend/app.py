from flask import Flask
from users import users_bp
from arrangements import arrangement_bp

app = Flask(__name__)

# Register all blueprints
app.register_blueprint(users_bp)
app.register_blueprint(arrangement_bp)

if __name__ == '__main__':
    app.run(debug=True)
