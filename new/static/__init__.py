# static/__init__.py

from fastapi import APIRouter
from fastapi.responses import FileResponse

static_router = APIRouter()


@static_router.get("/")
def read_index():
    return FileResponse("static/index.html")


@static_router.get("/name")
def read_name():
    return FileResponse("static/name.html")

