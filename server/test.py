import os
from fastapi.middleware.cors import CORSMiddleware
from server.v1.video.video import router as VideoRouter

# from models.url import Url
from pytube import YouTube
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from moviepy.editor import AudioFileClip
import io
import tempfile
from pydantic import BaseModel


app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # Adjust this to match the origins you want to allow
    "http://localhost:3000/test",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

# Include the video router
app.include_router(VideoRouter, prefix="/api/v1")


@app.post("/api/v1/url/info", response_model=dict)
async def get_url_info(data: dict):
    url_str = data.get("url")
    if not url_str:
        raise HTTPException(status_code=400, detail="URL is required")

    print("url", url_str)

    try:
        youtube = YouTube(url_str)
        video_title = youtube.title
        video_duration = youtube.length
        video_thumbnail = youtube.thumbnail_url

        return {
            "originalUrl": url_str,  # Original URL
            "title": video_title,
            "duration": video_duration,
            "thumbnail": video_thumbnail,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/v1/url/audio")
async def url_download(data: URLRequest):
    url_str = data.url
    try:
        print(url_str)
        # Initialize YouTube object
        youtube = YouTube(url_str)
        
        # Get the highest quality audio stream
        audio_stream = youtube.streams.get_audio_only()
        
        # Download the audio stream to a buffer
        audio_buffer = io.BytesIO()
        audio_stream.stream_to_buffer(audio_buffer)
        audio_buffer.seek(0)

         # Set up streaming response
        headers = {
            "Content-Disposition": f'attachment; filename="{youtube.title}.raw"',
            "Content-Type": "audio/mpeg",  # Assuming AAC format, adjust accordingly
        }
        return StreamingResponse(audio_buffer, media_type="audio/mpeg", headers=headers)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Hello World"}
