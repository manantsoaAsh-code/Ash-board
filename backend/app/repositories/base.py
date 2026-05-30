from sqlalchemy.orm import Session


class CRUDBase:
    def __init__(self, db: Session):
        self.db = db

    def add(self, model):
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def delete(self, model):
        self.db.delete(model)
        self.db.commit()
        return None

    def commit(self):
        self.db.commit()
        self.db.refresh(self.model)
        return self.model
