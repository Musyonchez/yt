from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os
import yt_dlp as youtube_dl

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
            'outtmpl': '%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url_str, download=True)
            # print(f"Downloaded audio info: {info_dict}")
            new_file = ydl.prepare_filename(info_dict).replace(info_dict['ext'], 'mp3')
            print(f"Renamed file to: {new_file}")

        # Send the audio file as a response
        return FileResponse(new_file, media_type='audio/mpeg', filename=os.path.basename(new_file))

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
