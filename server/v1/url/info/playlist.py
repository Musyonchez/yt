from fastapi import APIRouter, HTTPException
from yt_dlp import YoutubeDL

router = APIRouter()


@router.post("/url/info/playlist", response_model=dict)
async def get_url_info(data: dict):
    url_str = data.get("url")
    if not url_str:
        raise HTTPException(status_code=400, detail="URL is required")

    print("url", url_str)

    try:
        print("enter try")
        # Check if the URL is a playlist
        if "&list=" in url_str:
            print("enter if")
            ydl_opts = {
                "extract_flat": "in_playlist",  # Extract flat information for playlists only
                "playlistend": 100,  # Limit to the first 10 videos
                "quiet": True,  # Suppresses unnecessary output
                "skip_download": True,  # Ensure no download happens
                "simulate": True,  # Simulate the download to get metadata only
                "force_generic_extractor": True,
                "no_warnings": True,
            }

            with YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url_str, download=False)

            if "entries" in info_dict:
                print("enter if")
                video_info_list = []
                for entry in info_dict["entries"][:10]:
                    video_url = (
                        f"https://www.youtube.com/watch?v={entry.get('id')}"
                    )
                    video_info = {
                        "originalUrl": video_url,
                    }
                    video_info_list.append(video_info)
                return {"type": "playlist", "videos": video_info_list}
            else:
                raise HTTPException(
                    status_code=404, detail="No entries found in the playlist"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="The provided URL does not point to a playlist or a video.",
            )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
