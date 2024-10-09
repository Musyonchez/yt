from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api import api_router
from static import static_router


app = FastAPI()

# Register the router in the main FastAPI app
app.include_router(api_router, prefix="/api", tags=["central_api"])
app.include_router(static_router, prefix="", tags=["static_files"])


# Serve static files (HTML, JS, CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")

