# api/playlist/__init__.py
from fastapi import APIRouter


from .get_playlist import get_playlist_router
from .add_url_to_list import add_url_to_list_router
from .download_from_url_list import download_from_url_list_router
playlist_router = APIRouter()


playlist_router.include_router(get_playlist_router, prefix="/get_playlist", tags=["get_playlist"])
playlist_router.include_router(add_url_to_list_router, prefix="/add_url_to_list", tags=["add_url_to_list"])
playlist_router.include_router(download_from_url_list_router, prefix="/download_from_url_list", tags=["download_from_url_list"])


