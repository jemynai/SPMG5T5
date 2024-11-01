from flask import Blueprint, request, jsonify
from services.firebase import Firebase
from classes import TimetableService, Arrangement
from flask_cors import CORS
from typing import Dict, Tuple
from datetime import datetime, timezone

db = Firebase().get_db()
# Create blueprint
mngr_view_bp = Blueprint('mngr_view', __name__)

ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
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

def create_response(data: Dict = None, error: str = None, status_code: int = 200) -> Tuple:
    response = {
        "success": error is None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if error:
        response["error"] = error
    elif data:
        if "arrangements" in data:
            response.update(data)
        else:
            response["data"] = data
        
    return jsonify(response), status_code

def format_arrangement(arr: Arrangement) -> Dict:
    try:
        arr_dict = arr.to_dict()
        return {
            "id": str(arr_dict.get('id', '')),
            "employee_id": str(arr_dict.get('employee_id', '')),
            "department_id": str(arr_dict.get('department_id', '')),
            "status": normalize_status(arr_dict.get('status', '')),
            "date": format_date(arr_dict.get('date')),
            "details": arr_dict.get('details', {}),
            "created_at": format_date(arr_dict.get('created_at')),
            "updated_at": format_date(arr_dict.get('updated_at'))
        }
    except Exception as e:
        raise ValueError(f"Error formatting arrangement: {str(e)}")

@mngr_view_bp.route('/mngr_view_ttbl', methods=['GET'])
def mngr_view_ttbl():
    try:
        department_id = request.args.get('department_id', '').strip()
        status_filter = request.args.get('status', '').strip()
        
        if not department_id:
            return create_response(error="Department ID is required", status_code=400)

        if status_filter:
            status_filter = normalize_status(status_filter)

        arrangements = timetable_service.get_department_arrangements(
            department_id=department_id,
            status_filter=status_filter
        )

        arrangements_data = [format_arrangement(arr) for arr in arrangements]
        
        total_count = len(arrangements_data)
        status_counts = {
            'office': sum(1 for arr in arrangements_data if arr['status'] == 'office'),
            'home': sum(1 for arr in arrangements_data if arr['status'] == 'home')
        }

        response_data = {
            "arrangements": arrangements_data,
            "summary": {
                "total": total_count,
                "status_distribution": {
                    "office": {
                        "count": status_counts['office'],
                        "percentage": round((status_counts['office'] / total_count * 100), 1) if total_count > 0 else 0
                    },
                    "home": {
                        "count": status_counts['home'],
                        "percentage": round((status_counts['home'] / total_count * 100), 1) if total_count > 0 else 0
                    }
                }
            },
            "metadata": {
                "department_id": department_id,
                "status_filter": status_filter or "all",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

        return create_response(response_data)

    except ValueError as e:
        return create_response(error=str(e), status_code=400)
    except Exception as e:
        return create_response(error=f"An unexpected error occurred: {str(e)}", status_code=500)

@mngr_view_bp.errorhandler(404)
def not_found_error(error):
    return create_response(error="Resource not found", status_code=404)

@mngr_view_bp.errorhandler(500)
def internal_error(error):
    return create_response(error="Internal server error", status_code=500)

@mngr_view_bp.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    return response
