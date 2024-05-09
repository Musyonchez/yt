import os
import subprocess
import random

def convert_webm_to_mp3_in_folder(folder_path):
    # Get a list of all files in the folder
    filenames = os.listdir(folder_path)
    
    # Filter out.webm files
    webm_files = [filename for filename in filenames if filename.endswith(".webm")]
    
    # Randomly shuffle the list of.webm files
    random.shuffle(webm_files)
    
    # Iterate over the shuffled list of.webm files
    for filename in webm_files:
        webm_path = os.path.join(folder_path, filename)
        mp3_path = os.path.splitext(webm_path)[0] + ".mp3"
        
        mp4_path = mp3_path.replace(".mp3", ".mp4")
        subprocess.run(["ffmpeg", "-i", webm_path, mp4_path], check=True)
        
        subprocess.run(["ffmpeg", "-i", mp4_path, "-vn", "-acodec", "libmp3lame", mp3_path], check=True)
        
        os.remove(mp4_path)
        print(f"Converted {filename} to {os.path.basename(mp3_path)}")
        os.remove(webm_path)
        print(f"Converted {filename} to {os.path.basename(mp3_path)} and deleted the original.webm file.")

# Example usage
folder_path = os.path.expanduser("~/Desktop/ytdl/unconverted")
convert_webm_to_mp3_in_folder(folder_path)
