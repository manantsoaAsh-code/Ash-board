from sqlalchemy.orm import Session

from ..models.patient import Patient
from .base import CRUDBase


class PatientRepository(CRUDBase):
    def __init__(self, db: Session):
        super().__init__(db)

    def get(self, patient_id: int) -> Patient | None:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_by_owner(self, owner_id: int) -> list[Patient]:
        return self.db.query(Patient).filter(Patient.owner_id == owner_id).all()

    def create(self, owner_id: int, name: str, email: str | None = None, data: dict | None = None) -> Patient:
        patient = Patient(owner_id=owner_id, name=name, email=email, data=data or {})
        return self.add(patient)

    def update(self, patient: Patient, data: dict) -> Patient:
        for field, value in data.items():
            setattr(patient, field, value)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient
