from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...api.deps import get_current_user, get_db
from ...repositories.patient_repo import PatientRepository
from ...schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=list[PatientRead])
def list_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return PatientRepository(db).get_by_owner(current_user.id)


@router.post("", response_model=PatientRead, status_code=201)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return PatientRepository(db).create(owner_id=current_user.id, **patient.model_dump())


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    patient = PatientRepository(db).get(patient_id)
    if not patient or patient.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(patient_id: int, patient_update: PatientUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    patient = PatientRepository(db).get(patient_id)
    if not patient or patient.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return PatientRepository(db).update(patient, patient_update.model_dump(exclude_none=True))


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    patient = PatientRepository(db).get(patient_id)
    if not patient or patient.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    PatientRepository(db).delete(patient)
    return
