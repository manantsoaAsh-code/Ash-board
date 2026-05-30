from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.deps import get_current_user
from ...core.database import get_db
from ...repositories.user_repo import UserRepository
from ...schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserRead)
def get_profile(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserRead)
def update_profile(profile_update: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    repo = UserRepository(db)
    data = profile_update.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucune donnée à mettre à jour.")
    user = repo.update(current_user, data)
    return user


@router.post("/accept-cgu", response_model=UserRead)
def accept_cgu(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    repo = UserRepository(db)
    user = repo.update(current_user, {"cgu_accepted": True})
    return user
