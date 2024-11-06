from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from classes import TimetableService, Arrangement
from flask_cors import CORS
from typing import Dict, Tuple
from datetime import datetime, timezone

db = Firebase().get_db()
# Create blueprint
mngr_view_bp = Blueprint('mngr_view', __name__)

# Update CORS to match your Svelte dev server port
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite's default port
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000"
]

CORS(mngr_view_bp, resources={
    r"/mngr_view_ttbl": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize services
timetable_service = TimetableService(db)

def format_date(date_obj: datetime) -> str:
    if isinstance(date_obj, datetime):
        if date_obj.tzinfo is None:
            date_obj = date_obj.replace(tzinfo=timezone.utc)
        return date_obj.isoformat()
    return str(date_obj)

def normalize_status(status: str) -> str:
    """Normalize status to match frontend expectations"""
    if not status:
        return ""
    
    status_map = {
        'OFFICE': 'office',
        'HOME': 'home',
        'WFO': 'office',
        'WFH': 'home',
        'REMOTE': 'home',
        'WORK_FROM_OFFICE': 'office',
        'WORK_FROM_HOME': 'home'
    }
    return status_map.get(status.upper(), status.lower())

def format_arrangement(arr: Arrangement) -> Dict:
    """Format arrangement to match frontend expectations"""
    try:
        arr_dict = arr.to_dict()
        
        # Ensure consistent status values
        status = normalize_status(arr_dict.get('status', 'office'))
        
        # Format the arrangement to match frontend structure
        return {
            "id": str(arr_dict.get('id', '')),
            "employee_id": str(arr_dict.get('employee_id', '')),
            "department_id": str(arr_dict.get('department_id', '')),
            "status": status,
            "details": {
                "location": arr_dict.get('location', 'N/A'),
                "description": arr_dict.get('description', '')
            },
            "created_at": format_date(arr_dict.get('created_at')),
            "updated_at": format_date(arr_dict.get('updated_at'))
        }
    except Exception as e:
        raise ValueError(f"Error formatting arrangement: {str(e)}")

def calculate_summary(arrangements: list) -> Dict:
    """Calculate summary statistics for arrangements"""
    total_count = len(arrangements)
    office_count = sum(1 for arr in arrangements if arr['status'] == 'office')
    home_count = sum(1 for arr in arrangements if arr['status'] == 'home')
    
    return {
        "total": total_count,
        "status_distribution": {
            "office": {
                "count": office_count,
                "percentage": round((office_count / total_count * 100), 1) if total_count > 0 else 0
            },
            "home": {
                "count": home_count,
                "percentage": round((home_count / total_count * 100), 1) if total_count > 0 else 0
            }
        }
    }

@mngr_view_bp.route('/mngr_view_ttbl', methods=['GET'])
def mngr_view_ttbl():
    try:
        # Get query parameters
        department_id = request.args.get('department_id', '').strip()
        status_filter = request.args.get('status', '').strip()

        if not department_id:
            return jsonify({
                "success": False,
                "error": "Department ID is required",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 400

        # Normalize status filter
        if status_filter:
            status_filter = normalize_status(status_filter)

        # Get arrangements
        arrangements = timetable_service.get_department_arrangements(
            department_id=department_id,
            status_filter=status_filter
        )

        # Format arrangements
        formatted_arrangements = [format_arrangement(arr) for arr in arrangements]
        
        # Calculate summary
        summary = calculate_summary(formatted_arrangements)

        # Prepare response
        response_data = {
            "success": True,
            "arrangements": formatted_arrangements,
            "summary": summary,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        return jsonify(response_data), 200

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"An unexpected error occurred: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 500

@mngr_view_bp.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "success": False,
        "error": "Resource not found",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 404

@mngr_view_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 500

@mngr_view_bp.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    return response