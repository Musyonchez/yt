from fastapi import APIRouter, HTTPException
from pytube import YouTube

router = APIRouter()


@router.post("/url/info", response_model=dict)
async def get_url_info(data: dict):
    url_str = data.get("url")
    if not url_str:
        raise HTTPException(status_code=400, detail="URL is required")

    print("url", url_str)

    try:
        youtube = YouTube(url_str)
        audio_title = youtube.title
        author_name = youtube.author
        audio_duration = youtube.length
        audio_thumbnail = youtube.thumbnail_url

        return {
            "originalUrl": url_str,
            "title": audio_title,
            "channel": author_name,
            "duration": audio_duration,
            "thumbnail": audio_thumbnail,
        }
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
