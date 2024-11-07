class DbRepository:
    def __init__(self, db, collection):
        self.db = db
        self.collection = collection

    def get_by_id(self, doc_id):
        doc = self.collection.document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    def get_by_field(self, field, value):
        query = self.collection.where(field, "==", value).get()
        results = []
        for doc in query:
            doc_dict = doc.to_dict()
            doc_dict["user_id"] = doc.id
            results.append(doc_dict)
        return results if query else None

    def add_document(self, data, doc_id=None):
        if doc_id:
            doc_ref = self.collection.document(doc_id).set(data)
        else:
            doc_ref = self.collection.add(data)
        return doc_ref

    def update_document(self, data, doc_id):
        doc_ref = self.collection.document(doc_id)
        doc_ref.update(data)

    def delete_document(self, doc_id):
        self.collection.document(doc_id).delete()