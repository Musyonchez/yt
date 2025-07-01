# api/playlist/get_name_playlist.py

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from yt_dlp import YoutubeDL

# Create a router instance for playlist
get_playlist_router = APIRouter()

JSON_FILE_PATH = Path("store/playlist_urls.json")


@get_playlist_router.post("/")
async def fetch_playlist(request: Request):
    try:
        data = await request.json()
        playlist_url = data.get("url")

        if not playlist_url:
            raise HTTPException(status_code=400, detail="URL is required.")

        playlist_info = get_playlist_info(playlist_url)

        if isinstance(playlist_info, dict) and "error" in playlist_info:
            raise HTTPException(status_code=500, detail=playlist_info["error"])

        filtered_info = filter_already_added_videos(playlist_info)

        return {"videos": filtered_info, "message": "Playlist fetched successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching playlist: {str(e)}"
        ) from e


def get_playlist_info(playlist_url: str):
    ydl_opts = {
        "extract_flat": "in_playlist",
        "playlistend": 200,
        "quiet": True,
        "skip_download": True,
        "simulate": True,
        "force_generic_extractor": True,
        "no_warnings": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        try:
            info_dict = ydl.extract_info(playlist_url, download=False)
            return [
                {
                    "title": video.get("title"),
                    "url": video.get("url"),
                    "duration": video.get("duration"),
                    "channel": video.get("channel"),
                    "thumbnail": video.get("thumbnails", [{}])[0].get("url"),
                }
                for video in info_dict.get("entries", [])
                if video and "url" in video
            ]
        except Exception as e:
            return {"error": str(e)}


def filter_already_added_videos(playlist_info: list[dict]) -> list[dict]:
    """Removes videos from playlist_info that already exist in playlist_urls.json"""
    if not JSON_FILE_PATH.exists():
        return playlist_info  # Nothing to filter

    try:
        with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            stored_urls = {entry["url"] for entry in data.get("urls", [])}

        return [video for video in playlist_info if video["url"] not in stored_urls]

    except Exception as e:
        # If reading or parsing fails, return unfiltered as fallback
        print(f"Error reading playlist_urls.json: {e}")
        return playlist_info
