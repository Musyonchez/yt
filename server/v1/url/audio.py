from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import yt_dlp as youtube_dl
import tempfile

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/url/audio")
async def download_audio(data: URLRequest):
    url_str = data.url
    try:
        print(f"Received URL: {url_str}")

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(tempfile.gettempdir(), '%(title)s.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url_str, download=True)
            filename = ydl.prepare_filename(info_dict).replace(info_dict['ext'], 'mp3')

            return FileResponse(
                filename,
                media_type='audio/mpeg',
                filename=os.path.basename(filename),
            )
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"An error occurred: {str(e)}"
        ) from e
