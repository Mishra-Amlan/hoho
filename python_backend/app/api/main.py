from fastapi import APIRouter
from app.api.endpoints import auth, properties, audits, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(audits.router, prefix="/audits", tags=["audits"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
