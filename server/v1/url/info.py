import asyncio
from fastapi import APIRouter, HTTPException
import subprocess
from pytube import YouTube
from yt_dlp import YoutubeDL

router = APIRouter()


@router.post("/url/info", response_model=dict)
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
                'extract_flat': True,  # Extract information without downloading
                'playlistend': 10,     # Only fetch the first 10 videos
            }

            with YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url_str, download=False)

            if 'entries' in info_dict:
                titles = [entry['title'] for entry in info_dict['entries'][:10]]
                return {"titles": titles}
            else:
                raise HTTPException(status_code=404, detail="No entries found in the playlist")

        elif "watch?v=" in url_str:
            print("enter else")
            youtube = YouTube(url_str)
            return {
                "originalUrl": url_str,
                "title": youtube.title,
                "channel": youtube.author,
                "duration": youtube.length,
                "thumbnail": youtube.thumbnail_url,
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="The provided URL does not point to a playlist.",
            )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


async def run_async_command(command: str) -> list[str]:
    """
    Runs a shell command asynchronously and returns its output.
    """
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        raise Exception(f"Command failed with error {stderr.decode()}")
    return stdout.decode().strip().split("\n")
