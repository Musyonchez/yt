# v1/endpoints/video.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/videos/{video_id}")
async def get_video(video_id: int):
    # Your logic here
    return {"video_id": video_id}
