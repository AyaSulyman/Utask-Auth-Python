
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.exception_handlers import register_exception_handlers
from app.routers import auth, stats, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Production-style authentication & user management API. "
        "JWT auth, role-based authorization (admin/client), pagination, "
        "filtering, soft delete and public statistics."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stats.router)


@app.get("/", tags=["Health"], summary="Health check")
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
