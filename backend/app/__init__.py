from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .api.v1 import auth, patients, ai, user

Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI(title="Ash Board API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router, prefix="/api")
    app.include_router(patients.router, prefix="/api")
    app.include_router(ai.router, prefix="/api")
    app.include_router(user.router, prefix="/api")
    return app


app = create_app()
