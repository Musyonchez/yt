from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# from v1.video.video import router as VideoRouter
from v1.url.info import router as InfoRouter
from v1.url.audio import router as AudioRouter

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # Adjust this to match the origins you want to allow
    "http://localhost:3000/test",
    "http://localhost:3001",  # Adjust this to match the origins you want to allow
    "http://localhost:3001/test",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the video router
# app.include_router(VideoRouter, prefix="/api/v1")
app.include_router(InfoRouter, prefix="/api/v1")
app.include_router(AudioRouter, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Hello World"}
