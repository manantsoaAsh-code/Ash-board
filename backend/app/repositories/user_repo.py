from sqlalchemy.orm import Session

from ..models.user import User
from .base import CRUDBase


class UserRepository(CRUDBase):
    def __init__(self, db: Session):
        super().__init__(db)

    def get(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(
        self,
        email: str,
        hashed_password: str,
        full_name: str | None = None,
        is_active: bool = False,
        email_verified: bool = False,
        study_level: str | None = None,
        institution: str | None = None,
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            is_active=is_active,
            email_verified=email_verified,
            study_level=study_level,
            institution=institution,
        )
        return self.add(user)

    def update(self, user: User, data: dict) -> User:
        for field, value in data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
