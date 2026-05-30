from pydantic import BaseModel


class PatientBase(BaseModel):
    name: str
    email: str | None = None
    data: dict | None = {}


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    data: dict | None = None


class PatientRead(PatientBase):
    id: int
    owner_id: int
    created_at: str

    class Config:
        from_attributes = True
