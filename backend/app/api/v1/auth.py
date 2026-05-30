from datetime import timedelta
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session
import logging

from ...core.config import settings
from ...core.database import get_db
from ...core.security import create_access_token, decode_access_token, get_password_hash, verify_password
from ...repositories.user_repo import UserRepository
from ...schemas.token import Token
from ...schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

EMAIL_VERIFICATION_EXPIRE_MINUTES = 60 * 24


def _validate_google_redirect_uri(redirect_uri: str | None) -> str:
    allowed_redirects = {
        settings.GOOGLE_REDIRECT_URI,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    }
    if redirect_uri and redirect_uri in allowed_redirects:
        return redirect_uri
    if settings.GOOGLE_REDIRECT_URI:
        return settings.GOOGLE_REDIRECT_URI
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Google OAuth n'est pas configuré correctement. Veuillez définir GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans backend/.env.",
    )


def _build_google_auth_url(redirect_uri: str | None = None) -> str:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth n'est pas configuré correctement. Veuillez définir GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans backend/.env.",
        )

    redirect_uri = _validate_google_redirect_uri(redirect_uri)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "prompt": "consent",
        "access_type": "offline",
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


@router.get("/google/login")
def google_login(redirect_uri: str | None = Query(None)):
    return RedirectResponse(_build_google_auth_url(redirect_uri))


@router.get("/google/callback", response_model=Token)
async def google_callback(
    code: str = Query(...),
    redirect_uri: str | None = Query(None),
    db: Session = Depends(get_db),
):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth n'est pas configuré correctement.",
        )

    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": _validate_google_redirect_uri(redirect_uri),
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10,
            )

            if token_response.status_code != 200:
                logger.debug("Google token exchange response: %s", token_response.text)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Échec de l'échange du code Google.",
                )

            token_data = token_response.json()
            id_token = token_data.get("id_token")
            if not id_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Jeton ID Google introuvable.",
                )

            verification_response = await client.get(
                GOOGLE_TOKENINFO_URL, params={"id_token": id_token}, timeout=10
            )

        if verification_response.status_code != 200:
            logger.debug("Google tokeninfo response: %s", verification_response.text)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de vérifier le jeton Google.",
            )

        info = verification_response.json()
        if info.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audience Google invalide.",
            )

        email_verified = str(info.get("email_verified", "false")).lower() == "true"
        if not email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adresse e-mail Google non vérifiée.",
            )

        email = info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adresse e-mail Google introuvable.",
            )

        repo = UserRepository(db)
        user = repo.get_by_email(email)
        temp_password = None
        if not user:
            temp_password = uuid4().hex[:12]
            user = repo.create(
                email=email,
                full_name=info.get("name"),
                hashed_password=get_password_hash(temp_password),
                is_active=True,
                email_verified=True,
            )
        elif not user.is_active:
            user = repo.update(user, {"is_active": True, "email_verified": True})

        access_token = create_access_token({"sub": user.email})
        result = {"access_token": access_token, "token_type": "bearer", "email": user.email}
        if temp_password:
            result["temp_password"] = temp_password
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled exception in google_callback")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur lors du callback Google: {str(e)}",
        )


@router.post("/logout")
def logout():
    return {"detail": "Déconnexion effectuée côté client."}


def _create_email_verification_token(email: str) -> str:
    return create_access_token(
        {"sub": email, "action": "verify_email"},
        expires_delta=timedelta(minutes=EMAIL_VERIFICATION_EXPIRE_MINUTES),
    )


def _validate_email_verification_token(token: str) -> str:
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jeton de vérification invalide ou expiré.",
        )

    if payload.get("action") != "verify_email":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jeton de vérification invalide.",
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adresse e-mail introuvable dans le jeton.",
        )
    return email


@router.post("/register")
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    if repo.get_by_email(user_create.email):
        raise HTTPException(status_code=400, detail="Utilisateur déjà existant")

    user = repo.create(
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=get_password_hash(user_create.password),
        is_active=False,
        email_verified=False,
    )

    verification_token = _create_email_verification_token(user.email)
    
    # URL pointant vers le frontend (ajout de FRONTEND_URL suggéré dans .env)
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    verification_url = f"{frontend_url}/verify-email?token={verification_token}"

    return {
        "detail": "Compte créé. Vous devez confirmer votre adresse e-mail avant de vous connecter.",
        "verification_url": verification_url,
        "email": user.email,
    }


@router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    email = _validate_email_verification_token(token)
    repo = UserRepository(db)
    user = repo.get_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    repo.update(user, {"is_active": True, "email_verified": True})

    return {"detail": "Adresse e-mail confirmée. Vous pouvez maintenant vous connecter."}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veuillez vérifier votre adresse email avant de vous connecter.",
        )

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}