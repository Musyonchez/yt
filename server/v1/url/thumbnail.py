from fastapi import APIRouter, HTTPException
from pytube import YouTube

router = APIRouter()


@router.post("/url/thumbnail", response_model=dict)
async def get_url_thumbnail(data: dict):
    url_str = data.get("url")
    if not url_str:
        raise HTTPException(status_code=400, detail="URL is required")

    print("url", url_str)

    try:
        print("enter try")

        print("enter else")
        youtube = YouTube(url_str)
        video_info = {
            "thumbnail": youtube.thumbnail_url,
        }
        return {"type": "single", "videos": video_info}

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
