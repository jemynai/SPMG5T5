import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

class Firebase:
    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate('firebase.key.json')
            firebase_admin.initialize_app(cred)
        self.db = firestore.client()

    def get_db(self) -> firestore.client:
        return self.db