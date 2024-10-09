# static/__init__.py

from fastapi import APIRouter
from fastapi.responses import FileResponse

static_router = APIRouter()


@static_router.get("/")
def read_root():
    return FileResponse("static/index.html")