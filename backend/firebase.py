import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

def get_db() -> firestore.client:
    if not firebase_admin._apps:
        cred = credentials.Certificate('firebase.key.json')
        firebase_admin.initialize_app(cred)
    return firestore.client()