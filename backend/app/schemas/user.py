from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    study_level: str | None = None
    institution: str | None = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: str | None = None
    study_level: str | None = None
    institution: str | None = None


class UserRead(UserBase):
    id: int
    is_active: bool
    email_verified: bool | None = None
    cgu_accepted: bool = False

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str
