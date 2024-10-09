# api/playlist/getPlaylist.py

from fastapi import APIRouter, HTTPException, Request
from yt_dlp import YoutubeDL

# Create a router instance for playlist
get_playlist_router = APIRouter()


# Define a GET route for fetching playlist info
@get_playlist_router.post("/")
async def fetch_playlist(request: Request):
    try:
        # Extract the URL from the request body
        data = await request.json()
        playlist_url = data.get("url")

        if not playlist_url:
            raise HTTPException(status_code=400, detail="URL is required.")

        playlist_info = get_playlist_info(playlist_url)

        # Return the list of videos from the playlist
        return {"videos": playlist_info, "message": "Playlist fetched successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching playlist: {str(e)}"
        ) from e


def get_playlist_info(playlist_url: str):
    ydl_opts = {
        "extract_flat": "in_playlist",  # Extract flat information for playlists only
        "playlistend": 200,  # Limit to the first 100 videos (you can adjust this)
        "quiet": True,  # Suppress unnecessary output
        "skip_download": True,  # Ensure no download happens
        "simulate": True,  # Simulate the download to get metadata only
        "force_generic_extractor": True,
        "no_warnings": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract playlist information
            info_dict = ydl.extract_info(playlist_url, download=False)

            return [
                {
                    "title": video["title"],
                    "url": video["url"],
                    "duration": video["duration"],
                    "channel": video["channel"],
                    "thumbnail": video["thumbnails"][0]["url"],
                }
                for video in info_dict.get("entries", [])
            ]
        except Exception as e:
            return {"error": str(e)}
