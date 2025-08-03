"""
Download Manager
Handles concurrent YouTube audio downloads with progress tracking and queue management.
"""

import yt_dlp
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
import logging
import re
from .json_manager import JsonManager

logger = logging.getLogger(__name__)

class DownloadProgress:
    """Progress tracking for individual downloads."""
    
    def __init__(self, url: str) -> None:
        """Initialize progress tracker for a URL."""
        self.url = url
        self.status = "pending"  # pending, downloading, completed, failed
        self.percentage = 0.0
        self.speed = ""
        self.eta = ""
        self.filename = ""
        self.error = ""
        self.start_time = None
        self.end_time = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert progress to dictionary."""
        return {
            "url": self.url,
            "status": self.status,
            "percentage": self.percentage,
            "speed": self.speed,
            "eta": self.eta,
            "filename": self.filename,
            "error": self.error,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None
        }

class DownloadManager:
    """Manages concurrent YouTube audio downloads with progress tracking."""
    
    def __init__(self, download_folder: str, max_workers: int = 4) -> None:
        """
        Initialize download manager.
        
        Args:
            download_folder: Directory to save downloaded files
            max_workers: Maximum concurrent downloads
        """
        self.download_folder = download_folder
        self.max_workers = max_workers
        self.json_manager = JsonManager()
        
        # Thread management
        self.executor: Optional[ThreadPoolExecutor] = None
        self.is_running = False
        self.is_paused = False
        self.lock = threading.Lock()
        
        # Progress tracking
        self.progress_tracker: Dict[str, DownloadProgress] = {}
        self.completed_downloads: List[str] = []
        self.failed_downloads: List[str] = []
        
        # Ensure download directory exists
        os.makedirs(download_folder, exist_ok=True)
        
        # yt-dlp configuration for audio downloads
        self.ydl_opts = {
            'format': 'bestaudio/best',
            'extractaudio': True,
            'audioformat': 'mp3',
            'audioquality': '128K',
            'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
            'restrictfilenames': True,
            'ignoreerrors': True,
            'no_warnings': False,
            'quiet': False,
        }
    
    def start_downloads(self) -> bool:
        """
        Start processing the download queue.
        
        Returns:
            True if started successfully
        """
        with self.lock:
            if self.is_running:
                logger.info("Downloads already running")
                return True
            
            try:
                # Get current queue
                queue = self.json_manager.get_queue()
                if not queue:
                    logger.info("No items in download queue")
                    return True
                
                # Initialize progress tracking
                for url in queue:
                    if url not in self.progress_tracker:
                        self.progress_tracker[url] = DownloadProgress(url)
                
                # Start thread pool
                self.executor = ThreadPoolExecutor(max_workers=self.max_workers)
                self.is_running = True
                self.is_paused = False
                
                # Start download worker thread
                worker_thread = threading.Thread(target=self._download_worker, daemon=True)
                worker_thread.start()
                
                logger.info(f"Started downloads with {len(queue)} items in queue")
                return True
                
            except Exception as e:
                logger.error(f"Error starting downloads: {e}")
                return False
    
    def pause_downloads(self) -> bool:
        """
        Pause all downloads.
        
        Returns:
            True if paused successfully
        """
        with self.lock:
            try:
                self.is_paused = True
                logger.info("Downloads paused")
                return True
                
            except Exception as e:
                logger.error(f"Error pausing downloads: {e}")
                return False
    
    def resume_downloads(self) -> bool:
        """
        Resume paused downloads.
        
        Returns:
            True if resumed successfully
        """
        with self.lock:
            try:
                if not self.is_running:
                    return self.start_downloads()
                
                self.is_paused = False
                logger.info("Downloads resumed")
                return True
                
            except Exception as e:
                logger.error(f"Error resuming downloads: {e}")
                return False
    
    def stop_downloads(self) -> bool:
        """
        Stop all downloads and cleanup.
        
        Returns:
            True if stopped successfully
        """
        with self.lock:
            try:
                self.is_running = False
                self.is_paused = False
                
                if self.executor:
                    self.executor.shutdown(wait=False)
                    self.executor = None
                
                logger.info("Downloads stopped")
                return True
                
            except Exception as e:
                logger.error(f"Error stopping downloads: {e}")
                return False
    
    def get_progress(self) -> Dict[str, Any]:
        """
        Get current download progress for all items.
        
        Returns:
            Progress information dictionary
        """
        with self.lock:
            return {
                "is_running": self.is_running,
                "is_paused": self.is_paused,
                "active_downloads": {url: progress.to_dict() 
                                   for url, progress in self.progress_tracker.items()},
                "completed_count": len(self.completed_downloads),
                "failed_count": len(self.failed_downloads),
                "queue_size": len(self.json_manager.get_queue())
            }
    
    def _download_worker(self) -> None:
        """Main worker thread that processes the download queue."""
        logger.info("Download worker started")
        
        try:
            while self.is_running:
                # Check if paused
                if self.is_paused:
                    time.sleep(1)
                    continue
                
                # Get current queue
                queue = self.json_manager.get_queue()
                if not queue:
                    logger.info("Queue empty, stopping downloads")
                    break
                
                # Submit download tasks
                futures = []
                for url in queue[:self.max_workers]:  # Limit concurrent downloads
                    if url not in self.progress_tracker:
                        self.progress_tracker[url] = DownloadProgress(url)
                    
                    if self.progress_tracker[url].status == "pending":
                        future = self.executor.submit(self._download_single, url)
                        futures.append(future)
                
                # Wait for completions
                if futures:
                    for future in as_completed(futures):
                        try:
                            future.result()
                        except Exception as e:
                            logger.error(f"Download task error: {e}")
                else:
                    time.sleep(2)  # No new downloads, wait before checking again
        
        except Exception as e:
            logger.error(f"Download worker error: {e}")
        
        finally:
            with self.lock:
                self.is_running = False
                if self.executor:
                    self.executor.shutdown(wait=True)
                    self.executor = None
            logger.info("Download worker stopped")
    
    def _download_single(self, url: str) -> bool:
        """
        Download a single video.
        
        Args:
            url: YouTube video URL
            
        Returns:
            True if successful
        """
        progress = self.progress_tracker.get(url)
        if not progress:
            return False
        
        try:
            progress.status = "downloading"
            progress.start_time = datetime.now()
            logger.info(f"Starting download: {url}")
            
            # Create progress hook for this download
            ydl_opts = self.ydl_opts.copy()
            ydl_opts['progress_hooks'] = [lambda d: self._progress_hook(d, url)]
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # Mark as completed
            progress.status = "completed"
            progress.end_time = datetime.now()
            progress.percentage = 100.0
            
            # Update JSON files
            self.json_manager.mark_downloaded(url)
            self.completed_downloads.append(url)
            
            logger.info(f"Download completed: {url}")
            return True
            
        except Exception as e:
            # Mark as failed
            progress.status = "failed"
            progress.error = str(e)
            progress.end_time = datetime.now()
            
            self.failed_downloads.append(url)
            logger.error(f"Download failed for {url}: {e}")
            return False
    
    def _progress_hook(self, d: Dict[str, Any], url: str) -> None:
        """
        Progress hook for yt-dlp downloads.
        
        Args:
            d: Progress dictionary from yt-dlp
            url: Video URL being downloaded
        """
        progress = self.progress_tracker.get(url)
        if not progress:
            return
        
        try:
            if d['status'] == 'downloading':
                # Update progress information
                if 'downloaded_bytes' in d and 'total_bytes' in d:
                    progress.percentage = (d['downloaded_bytes'] / d['total_bytes']) * 100
                elif 'downloaded_bytes' in d and 'total_bytes_estimate' in d:
                    progress.percentage = (d['downloaded_bytes'] / d['total_bytes_estimate']) * 100
                
                progress.speed = d.get('_speed_str', '')
                progress.eta = d.get('_eta_str', '')
                progress.filename = os.path.basename(d.get('filename', ''))
            
            elif d['status'] == 'finished':
                progress.percentage = 100.0
                progress.filename = os.path.basename(d.get('filename', ''))
                progress.speed = ""
                progress.eta = ""
                
        except Exception as e:
            logger.error(f"Progress hook error for {url}: {e}")
    
    def _sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for safe filesystem storage.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove or replace problematic characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'[^\w\s-.]', '_', filename)
        filename = re.sub(r'\s+', ' ', filename).strip()
        
        # Limit length
        if len(filename) > 200:
            name, ext = os.path.splitext(filename)
            filename = name[:190] + ext
        
        return filename
    
    def get_download_stats(self) -> Dict[str, Any]:
        """
        Get detailed download statistics.
        
        Returns:
            Statistics dictionary
        """
        with self.lock:
            total_downloads = len(self.progress_tracker)
            completed = len([p for p in self.progress_tracker.values() if p.status == "completed"])
            failed = len([p for p in self.progress_tracker.values() if p.status == "failed"])
            downloading = len([p for p in self.progress_tracker.values() if p.status == "downloading"])
            pending = len([p for p in self.progress_tracker.values() if p.status == "pending"])
            
            return {
                "total_downloads": total_downloads,
                "completed": completed,
                "failed": failed,
                "downloading": downloading,
                "pending": pending,
                "is_running": self.is_running,
                "is_paused": self.is_paused,
                "max_workers": self.max_workers
            }
    
    def clear_completed(self) -> None:
        """Clear completed downloads from progress tracker."""
        with self.lock:
            self.progress_tracker = {
                url: progress for url, progress in self.progress_tracker.items()
                if progress.status not in ["completed", "failed"]
            }
            self.completed_downloads.clear()
            self.failed_downloads.clear()
            logger.info("Cleared completed downloads from tracker")