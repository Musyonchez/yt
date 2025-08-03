"""
JSON Data Manager
Handles thread-safe operations for downloaded.json and queue.json files.
"""

import json
import os
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class JsonManager:
    """Thread-safe JSON file manager for downloads and queue data."""
    
    def __init__(self, data_dir: str = "data") -> None:
        """
        Initialize JSON manager.
        
        Args:
            data_dir: Directory containing JSON files
        """
        self.data_dir = data_dir
        self.downloaded_file = os.path.join(data_dir, "downloaded.json")
        self.queue_file = os.path.join(data_dir, "queue.json")
        self.lock = threading.Lock()
        
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._init_files()
    
    def _init_files(self) -> None:
        """Initialize JSON files with default structure."""
        default_downloaded = {"downloads": [], "last_updated": ""}
        default_queue = {"queue": [], "last_updated": ""}
        
        if not os.path.exists(self.downloaded_file):
            self._write_json(self.downloaded_file, default_downloaded)
        
        if not os.path.exists(self.queue_file):
            self._write_json(self.queue_file, default_queue)
    
    def _read_json(self, file_path: str) -> Dict[str, Any]:
        """
        Read JSON file with error handling.
        
        Args:
            file_path: Path to JSON file
            
        Returns:
            Parsed JSON data
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error reading {file_path}: {e}")
            # Return appropriate default structure based on file
            if "downloaded" in file_path:
                return {"downloads": [], "last_updated": ""}
            else:
                return {"queue": [], "last_updated": ""}
    
    def _write_json(self, file_path: str, data: Dict[str, Any]) -> None:
        """
        Write JSON file with error handling.
        
        Args:
            file_path: Path to JSON file
            data: Data to write
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error writing {file_path}: {e}")
            raise
    
    def get_downloaded(self) -> List[str]:
        """
        Get list of downloaded video URLs.
        
        Returns:
            List of downloaded URLs
        """
        with self.lock:
            data = self._read_json(self.downloaded_file)
            return data.get("downloads", [])
    
    def get_queue(self) -> List[str]:
        """
        Get list of queued video URLs.
        
        Returns:
            List of queued URLs
        """
        with self.lock:
            data = self._read_json(self.queue_file)
            return data.get("queue", [])
    
    def add_to_queue(self, url: str) -> bool:
        """
        Add URL to download queue if not already present.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if added, False if already exists
        """
        with self.lock:
            try:
                # Check if already downloaded
                downloaded_data = self._read_json(self.downloaded_file)
                if url in downloaded_data.get("downloads", []):
                    logger.info(f"URL already downloaded: {url}")
                    return False
                
                # Check if already in queue
                queue_data = self._read_json(self.queue_file)
                current_queue = queue_data.get("queue", [])
                
                if url in current_queue:
                    logger.info(f"URL already in queue: {url}")
                    return False
                
                # Add to queue
                current_queue.append(url)
                queue_data["queue"] = current_queue
                queue_data["last_updated"] = datetime.now().isoformat()
                
                self._write_json(self.queue_file, queue_data)
                logger.info(f"Added to queue: {url}")
                return True
                
            except Exception as e:
                logger.error(f"Error adding to queue: {e}")
                return False
    
    def remove_from_queue(self, url: str) -> bool:
        """
        Remove URL from download queue.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if removed, False if not found
        """
        with self.lock:
            try:
                queue_data = self._read_json(self.queue_file)
                current_queue = queue_data.get("queue", [])
                
                if url not in current_queue:
                    logger.info(f"URL not in queue: {url}")
                    return False
                
                current_queue.remove(url)
                queue_data["queue"] = current_queue
                queue_data["last_updated"] = datetime.now().isoformat()
                
                self._write_json(self.queue_file, queue_data)
                logger.info(f"Removed from queue: {url}")
                return True
                
            except Exception as e:
                logger.error(f"Error removing from queue: {e}")
                return False
    
    def mark_downloaded(self, url: str) -> bool:
        """
        Mark URL as downloaded and remove from queue.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if successful
        """
        with self.lock:
            try:
                # Add to downloaded
                downloaded_data = self._read_json(self.downloaded_file)
                current_downloads = downloaded_data.get("downloads", [])
                
                if url not in current_downloads:
                    current_downloads.append(url)
                    downloaded_data["downloads"] = current_downloads
                    downloaded_data["last_updated"] = datetime.now().isoformat()
                    self._write_json(self.downloaded_file, downloaded_data)
                
                # Remove from queue
                self.remove_from_queue(url)
                
                logger.info(f"Marked as downloaded: {url}")
                return True
                
            except Exception as e:
                logger.error(f"Error marking as downloaded: {e}")
                return False
    
    def is_downloaded(self, url: str) -> bool:
        """
        Check if URL is already downloaded.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if downloaded
        """
        with self.lock:
            downloaded_data = self._read_json(self.downloaded_file)
            return url in downloaded_data.get("downloads", [])
    
    def is_queued(self, url: str) -> bool:
        """
        Check if URL is in download queue.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if queued
        """
        with self.lock:
            queue_data = self._read_json(self.queue_file)
            return url in queue_data.get("queue", [])
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about downloads and queue.
        
        Returns:
            Dictionary with stats
        """
        with self.lock:
            downloaded_data = self._read_json(self.downloaded_file)
            queue_data = self._read_json(self.queue_file)
            
            return {
                "downloaded_count": len(downloaded_data.get("downloads", [])),
                "queue_count": len(queue_data.get("queue", [])),
                "last_download_update": downloaded_data.get("last_updated", ""),
                "last_queue_update": queue_data.get("last_updated", "")
            }