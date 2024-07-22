from fastapi import APIRouter, HTTPException
from pytube import YouTube
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

router = APIRouter()

def clean_youtube_url(url_str: str) -> str:
    url_parts = urlparse(url_str)
    query_params = parse_qs(url_parts.query)

    # Keep only the 'v' parameter
    clean_params = {k: v for k, v in query_params.items() if k == "v"}
    clean_query = urlencode(clean_params, doseq=True)

    # Reconstruct the URL without &list= and &start_radio=
    clean_url = urlunparse((
        url_parts.scheme,
        url_parts.netloc,
        url_parts.path,
        url_parts.params,
        clean_query,
        url_parts.fragment
    ))
    return clean_url

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
            cleaned_url = clean_youtube_url(url_str)
            print("cleaned url", cleaned_url)
            youtube = YouTube(cleaned_url)
            video_info = {
                "originalUrl": cleaned_url,
                "title": youtube.title,
                "channel": youtube.author,
                "duration": youtube.length,
                "thumbnail": youtube.thumbnail_url,
            }
            return {"type": "single", "videos": [video_info]}  # Return a list with a single item
        else:
            raise HTTPException(
                status_code=400,
                detail="The provided URL does not point to a playlist or a video.",
            )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
