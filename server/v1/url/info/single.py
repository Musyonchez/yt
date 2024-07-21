from fastapi import APIRouter, HTTPException
from pytube import YouTube

router = APIRouter()


@router.post("/url/info/single", response_model=dict)
async def get_url_info(data: dict):
    url_str = data.get("url")
    if not url_str:
        raise HTTPException(status_code=400, detail="URL is required")

    print("url", url_str)

    try:
        print("enter try")

        if "watch?v=" in url_str:
            print("enter else")
            youtube = YouTube(url_str)
            video_info = {
                "originalUrl": url_str,
                "title": youtube.title,
                "channel": youtube.author,
                "duration": youtube.length,
                "thumbnail": youtube.thumbnail_url,
            }
            return {"type": "single", "videos": [video_info]} # Return a list with a single item
        else:
            raise HTTPException(
                status_code=400,
                detail="The provided URL does not point to a playlist or a video.",
            )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
