# api/__init__.py
from fastapi import APIRouter
from .playlist import playlist_router

api_router = APIRouter()


api_router.include_router(playlist_router, prefix="/playlist", tags=["playlist"])
