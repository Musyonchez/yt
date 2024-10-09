from fastapi import APIRouter
import yt_dlp as youtube_dl
import os
import json
from pathlib import Path


download_from_url_list_router = APIRouter()



# File where processed URLs will be stored
PROCESSED_URLS_FILE = Path("store/processed_urls.json")
URL_LIST_FILE = Path("store/playlist_urls.json")
DOWNLOAD_DIR = "downloads/yt_download"  # Directory where the audio files will be saved

# Ensure the download directory exists
os.makedirs(DOWNLOAD_DIR, exist_ok=True)




# Function to load previously processed URLs
def load_processed_urls():
    if PROCESSED_URLS_FILE.exists():
        try:
            with open(PROCESSED_URLS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('urls', [])
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON format in {PROCESSED_URLS_FILE}. Returning empty list.")
            return []
    return []

# Function to load the playlist of URLs to download
def load_playlist_urls():
    if URL_LIST_FILE.exists():
        try:
            with open(URL_LIST_FILE, 'r') as f:
                data = json.load(f)
                return [item['url'] for item in data.get('urls', [])]
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON format in {URL_LIST_FILE}. Returning empty list.")
            return []
    return []


# Function to save processed URLs to a JSON file
def save_processed_urls(urls):
    with open(PROCESSED_URLS_FILE, 'w') as f:
        json.dump({"urls": urls}, f)


# Function to download audio and update the processed URLs in real-time
def download_audio_from_list(url_list):
    processed_urls = load_processed_urls()  # Load already processed URLs

    for url_str in url_list:
        if url_str in processed_urls:
            print(f"Skipping already processed URL: {url_str}")
            continue  # Skip if URL is already processed

        try:
            print(f"Downloading audio from URL: {url_str}")

            # Set up yt-dlp options for audio download
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),  # Save audio in the 'downloads' folder
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }

            with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url_str])  # Download audio

            print(f"Downloaded audio for: {url_str}")
            processed_urls.append(url_str)  # Add successful URL to the list
            save_processed_urls(processed_urls)  # Save processed URLs after each successful download

        except Exception as e:
            print(f"An error occurred while downloading {url_str}: {str(e)}")
            continue  # Continue with the next URL even if one fails

@download_from_url_list_router.get("/")
def download_url():
    if not URL_LIST_FILE.parent.exists():
        print(f"File not found: {URL_LIST_FILE}")
    if urls_to_download := load_playlist_urls():
        download_audio_from_list(urls_to_download)
    else:
        print("No URLs found in the playlist.")
