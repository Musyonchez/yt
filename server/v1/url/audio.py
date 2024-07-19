# v1/url/info.py
from fastapi import APIRouter
from pytube import YouTube
from fastapi import HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import io
import os

router = APIRouter()


class URLRequest(BaseModel):
    url: str


@router.post("/url/audio")
async def url_download(data: URLRequest):

    url_str = data.url
    try:
        print(url_str)
        # Initialize YouTube object
        youtube = YouTube(url_str)

        # return {"message": "Audio test successfully to"}

        # Get the highest quality audio stream
        try:
            # Explicitly get the best audio stream
            audio_stream = (
                youtube.streams.filter(
                    progressive=False, mime_type="audio/mp4"
                )
                .order_by("abr")
                .desc()
                .first()
            )

            if audio_stream is None:
                raise HTTPException(
                    status_code=404, detail="No suitable audio stream found."
                )
        except Exception as e:
            print(f"Error fetching audio stream: {e}")
            raise

        # Define the download path
        download_path = os.path.join(os.getcwd(), f"{youtube.title}.mp3")

        # Download the audio stream to the specified path
        audio_stream.download(
            output_path=os.getcwd(), filename=f"{youtube.title}.mp3"
        )

        return {"message": f"Audio downloaded successfully to {download_path}"}

        # # Download the audio stream to a buffer
        # audio_buffer = io.BytesIO()
        # audio_stream.stream_to_buffer(audio_buffer)
        # audio_buffer.seek(0)

        # # Set up streaming response
        # headers = {
        #     "Content-Disposition": f'attachment; filename="{youtube.title}.raw"',
        #     "Content-Type": "audio/mpeg",  # Assuming AAC format, adjust accordingly
        # }
        # return StreamingResponse(
        #     audio_buffer, media_type="audio/mpeg", headers=headers
        # )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred: {str(e)}"
        ) from e
