# api/playlist/getPlaylistByName.py
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from yt_dlp import YoutubeDL

get_playlist_by_name_router = APIRouter()
JSON_FILE_PATH = Path("store/playlist_urls.json")


@get_playlist_by_name_router.post("/")
async def fetch_playlists_by_name(request: Request):
    try:
        data = await request.json()
        search_name = data.get("name")

        if not search_name:
            raise HTTPException(status_code=400, detail="Name is required.")

        playlist_info = search_playlists_by_name(search_name)
        # print("playlist_info", playlist_info)
        filtered_info = filter_already_added_playlists(playlist_info)

        return {
            "playlists": filtered_info,
            "message": "Playlists fetched successfully",
        }

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {e}"
        ) from e



def search_playlists_by_name(search_name: str, max_results: int = 30) -> dict:
    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "skip_download": True,
        "default_search": f"ytsearch{max_results}",
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            query = f"ytsearch{max_results}:{search_name}"
            info_dict = ydl.extract_info(query, download=False)
            entries = info_dict.get("entries", [])

            videos = [
                entry for entry in entries
                if entry.get("duration") and entry.get("view_count") is not None
            ]

            videos.sort(key=lambda x: x["view_count"], reverse=True)
            # print(videos)
            return {
                "success": True,
                "results": [
                    {
                        "title": video.get("title"),
                        "url": video.get("url"),
                        "channel": video.get("channel"),
                        "duration": video.get("duration"),
                        "thumbnail": video.get("thumbnails", [{}])[0].get("url"),
                    }
                    for video in videos[:max_results]
                ]
            }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "results": [],
        }




def filter_already_added_playlists(response: dict) -> list[dict]:
    if not response.get("success"):
        # Log or handle error
        print("Error:", response.get("error"))
        return []

    playlist_info = response["results"]
    # print("playlist_info", playlist_info)
    """Remove results whose URLs are already stored in playlist_urls.json."""
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