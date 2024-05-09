import yt_dlp as youtube_dl


# Function to download audio from YouTube URL
def download_audio(url, output_dir):
    options = {
        "format": "bestaudio/best",  # Choose best audio quality
        "extractaudio": True,  # Extract audio only
        "audioformat": "mp3",  # Choose mp3 format
        "outtmpl": f"{output_dir}/%(title)s.%(ext)s",  # Output file name template with directory
    }
    with youtube_dl.YoutubeDL(options) as ydl:
        ydl.download([url])


# Example usage
youtube_url = "https://www.youtube.com/watch?v=osdoLjUNFnA&list=RDosdoLjUNFnA&start_radio=400"  # Example YouTube URL
output_dir = "~/Desktop/ytdl/unconverted"  # Specify the directory where you want to save the audio file
download_audio(youtube_url, output_dir)
