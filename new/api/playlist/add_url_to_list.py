from fastapi import APIRouter, HTTPException, Request
import json
from pathlib import Path

# Create a router instance for adding URL to the list
add_url_to_list_router = APIRouter()



# Define the path to the JSON file inside 'store/currentdate/'
json_file_path = Path("store/playlist_urls.json")

# Ensure the 'store' directory exists before working with the file
if not json_file_path.parent.exists():
    json_file_path.parent.mkdir(parents=True)

# Initialize the file if it doesn't exist
if not json_file_path.exists():
    with open(json_file_path, "w") as f:
        json.dump({"urls": []}, f)

# Define a POST route for adding a URL to the playlist
@add_url_to_list_router.post("/")
async def add_url_to_list(request: Request):
    try:
        # Parse the incoming request body to get the URL and added_at time
        data = await request.json()
        url = data.get("url")
        added_at = data.get("added_at")  # Expecting the added_at field from frontend

        if not url:
            raise HTTPException(status_code=400, detail="URL is required.")
        if not added_at:
            raise HTTPException(status_code=400, detail="Added time is required.")

        # Load the existing data from the JSON file
        with open(json_file_path, "r") as f:
            playlist_data = json.load(f)

        # Check if the URL already exists
        for item in playlist_data["urls"]:
            if item["url"] == url:
                return {"message": "URL already exists in the playlist", "url": url}

        # Append the new URL with the added_at time to the list of URLs
        playlist_data["urls"].append({"url": url, "added_at": added_at})

        # Save the updated data back to the JSON file
        with open(json_file_path, "w") as f:
            json.dump(playlist_data, f, indent=4)

        return {"message": "URL added successfully", "url": url, "added_at": added_at}

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Invalid JSON data.") from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred: {str(e)}"
        ) from e
