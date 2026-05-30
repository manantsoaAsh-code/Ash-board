from fastapi import APIRouter, Depends

from ...api.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat")
def chat(query: dict, current_user=Depends(get_current_user)):
    return {
        "query": query,
        "answer": "Fonctionnalité IA en développement. En attendant, utilisez les données cliniques saisies.",
        "user_email": current_user.email,
    }


@router.post("/analyze")
def analyze(payload: dict, current_user=Depends(get_current_user)):
    return {
        "summary": "Analyse rapide non disponible pour le moment.",
        "payload": payload,
        "owner": current_user.email,
    }
