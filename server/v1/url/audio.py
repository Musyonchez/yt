# v1/url/info.py
from fastapi import APIRouter
from yt_dlp import YoutubeDL
from fastapi import HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import io

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/url/audio")
async def url_download(data: URLRequest):
    url_str = data.url
    try:
        print(f"Received URL: {url_str}")

        # Create an in-memory buffer
        buffer = io.BytesIO()

        # Set up yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',  # Get the best audio format
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',  # Extract audio using ffmpeg
                'preferredcodec': 'mp3',  # Convert to mp3
                'preferredquality': '192',  # Set quality
            }],
            # 'outtmpl': '-',  # Output to stdout
            # 'quiet': False,  # Show detailed logs
        }

        # print("yt-dlp options set:", ydl_opts)

        def write_to_buffer(info_dict, audio_stream):
            print("Writing to buffer...")
            buffer.write(audio_stream.read())
            print("Finished writing to buffer.")

        # with YoutubeDL(ydl_opts) as ydl:
        #     print("Starting yt-dlp download...")
        #     # Download the audio and write to the buffer
        #     info_dict = ydl.extract_info(url_str, download=True)
        #     print("Download complete.")
        
        # Check buffer content length
        buffer.seek(0)
        buffer_length = len(buffer.getvalue())
        # print(f"Buffer size: {buffer_length} bytes")

        return StreamingResponse(
            buffer, 
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=downloaded_audio.mp3"}
        )

    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"An error occurred: {str(e)}"
        ) from e
