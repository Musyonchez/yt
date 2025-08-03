"""
YouTube Audio Download Manager
A Flask web application for downloading YouTube audio from playlists and search queries.
"""

from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import os
import logging
from datetime import datetime
from typing import Dict, List, Any

# Import our custom utilities
from utils.json_manager import JsonManager
from utils.youtube import YouTubeService
from utils.downloader import DownloadManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
app.config['DOWNLOAD_FOLDER'] = os.path.join(os.getcwd(), 'downloads')
app.config['MAX_CONCURRENT_DOWNLOADS'] = int(os.environ.get('MAX_CONCURRENT_DOWNLOADS', '4'))

# Initialize services
json_manager = JsonManager()
youtube_service = YouTubeService()
download_manager = DownloadManager(
    download_folder=app.config['DOWNLOAD_FOLDER'],
    max_workers=app.config['MAX_CONCURRENT_DOWNLOADS']
)

@app.route('/')
def index() -> str:
    """Main dashboard page."""
    try:
        # Get current stats
        downloaded_count = len(json_manager.get_downloaded())
        queue_count = len(json_manager.get_queue())
        
        return render_template('index.html', 
                             downloaded_count=downloaded_count,
                             queue_count=queue_count)
    except Exception as e:
        logger.error(f"Error loading dashboard: {e}")
        return render_template('index.html', 
                             downloaded_count=0,
                             queue_count=0,
                             error="Unable to load dashboard data")

@app.route('/search')
def search_page() -> str:
    """YouTube search page."""
    return render_template('search.html')

@app.route('/playlist')
def playlist_page() -> str:
    """Playlist viewer page."""
    return render_template('playlist.html')

@app.route('/queue')
def queue_page() -> str:
    """Download queue management page."""
    try:
        queue_items = json_manager.get_queue()
        return render_template('queue.html', queue_items=queue_items)
    except Exception as e:
        logger.error(f"Error loading queue page: {e}")
        return render_template('queue.html', queue_items=[], error="Unable to load queue")

# API Routes
@app.route('/api/search')
def api_search() -> Response:
    """Search YouTube videos API endpoint."""
    try:
        query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Get raw search results
        results = youtube_service.search_videos(query, page=page, per_page=per_page)
        
        # Filter out already downloaded URLs
        if 'results' in results and results['results']:
            downloaded_urls = set(json_manager.get_downloaded())
            queued_urls = set(json_manager.get_queue())
            
            # Store original count
            original_count = len(results['results'])
            
            # Filter out downloaded and queued URLs
            filtered_results = []
            for video in results['results']:
                if video['url'] not in downloaded_urls and video['url'] not in queued_urls:
                    filtered_results.append(video)
            
            # Update results with filtered data
            results['results'] = filtered_results
            results['filtered_count'] = len(filtered_results)
            results['original_count'] = original_count
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Search API error: {e}")
        return jsonify({'error': 'Search failed'}), 500

@app.route('/api/playlist')
def api_playlist() -> Response:
    """Get playlist videos API endpoint."""
    try:
        url = request.args.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'Playlist URL is required'}), 400
        
        # Get raw playlist videos
        videos = youtube_service.get_playlist_videos(url)
        
        # Filter out already downloaded and queued URLs
        if videos:
            downloaded_urls = set(json_manager.get_downloaded())
            queued_urls = set(json_manager.get_queue())
            
            # Store original count
            original_count = len(videos)
            
            # Filter out downloaded and queued URLs
            filtered_videos = []
            for video in videos:
                if video['url'] not in downloaded_urls and video['url'] not in queued_urls:
                    filtered_videos.append(video)
            
            # Return filtered results with metadata
            return jsonify({
                'videos': filtered_videos,
                'filtered_count': len(filtered_videos),
                'original_count': original_count
            })
        
        return jsonify({'videos': videos})
        
    except Exception as e:
        logger.error(f"Playlist API error: {e}")
        return jsonify({'error': 'Failed to load playlist'}), 500

@app.route('/api/queue/add', methods=['POST'])
def api_queue_add() -> Response:
    """Add video(s) to download queue."""
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        
        if not urls or not isinstance(urls, list):
            return jsonify({'error': 'URLs list is required'}), 400
        
        added_count = 0
        for url in urls:
            if json_manager.add_to_queue(url):
                added_count += 1
        
        return jsonify({
            'success': True,
            'added_count': added_count,
            'total_requested': len(urls)
        })
        
    except Exception as e:
        logger.error(f"Add to queue error: {e}")
        return jsonify({'error': 'Failed to add to queue'}), 500

@app.route('/api/queue/remove', methods=['POST'])
def api_queue_remove() -> Response:
    """Remove video from download queue."""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        success = json_manager.remove_from_queue(url)
        return jsonify({'success': success})
        
    except Exception as e:
        logger.error(f"Remove from queue error: {e}")
        return jsonify({'error': 'Failed to remove from queue'}), 500

@app.route('/api/download/start', methods=['POST'])
def api_download_start() -> Response:
    """Start processing download queue."""
    try:
        download_manager.start_downloads()
        return jsonify({'success': True, 'message': 'Downloads started'})
        
    except Exception as e:
        logger.error(f"Start downloads error: {e}")
        return jsonify({'error': 'Failed to start downloads'}), 500

@app.route('/api/download/pause', methods=['POST'])
def api_download_pause() -> Response:
    """Pause all downloads."""
    try:
        download_manager.pause_downloads()
        return jsonify({'success': True, 'message': 'Downloads paused'})
        
    except Exception as e:
        logger.error(f"Pause downloads error: {e}")
        return jsonify({'error': 'Failed to pause downloads'}), 500

@app.route('/api/download/stop', methods=['POST'])
def api_download_stop() -> Response:
    """Stop all downloads."""
    try:
        download_manager.stop_downloads()
        return jsonify({'success': True, 'message': 'Downloads stopped'})
        
    except Exception as e:
        logger.error(f"Stop downloads error: {e}")
        return jsonify({'error': 'Failed to stop downloads'}), 500

@app.route('/api/downloads/clear-completed', methods=['POST'])
def api_clear_completed() -> Response:
    """Clear completed downloads."""
    try:
        download_manager.clear_completed()
        return jsonify({'success': True, 'message': 'Completed downloads cleared'})
        
    except Exception as e:
        logger.error(f"Clear completed error: {e}")
        return jsonify({'error': 'Failed to clear completed downloads'}), 500

@app.route('/api/stats')
def api_stats() -> Response:
    """Get download statistics."""
    try:
        stats = download_manager.get_download_stats()
        json_stats = json_manager.get_stats()
        
        # Combine stats
        combined_stats = {
            **stats,
            **json_stats
        }
        
        return jsonify(combined_stats)
        
    except Exception as e:
        logger.error(f"Stats API error: {e}")
        return jsonify({'error': 'Failed to get stats'}), 500

@app.route('/api/progress')
def api_progress() -> Response:
    """Get current progress data (polling fallback)."""
    try:
        progress_data = download_manager.get_progress()
        return jsonify(progress_data)
    except Exception as e:
        logger.error(f"Progress API error: {e}")
        return jsonify({'error': 'Failed to get progress'}), 500

@app.route('/progress')
def progress_stream() -> Response:
    """Server-Sent Events endpoint for download progress."""
    def generate():
        import json
        import time
        while True:
            try:
                with app.app_context():
                    progress_data = download_manager.get_progress()
                    yield f"data: {json.dumps(progress_data)}\n\n"
                    time.sleep(2)  # Update every 2 seconds
            except Exception as e:
                logger.error(f"Progress stream error: {e}")
                with app.app_context():
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    time.sleep(5)  # Wait longer on error
    
    return Response(generate(), mimetype='text/event-stream')

@app.errorhandler(404)
def not_found_error(error) -> tuple:
    """Handle 404 errors."""
    return render_template('index.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error) -> tuple:
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return render_template('index.html', error="Internal server error"), 500

if __name__ == '__main__':
    # Create downloads directory if it doesn't exist
    os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)
    
    # Run in development mode
    app.run(host='0.0.0.0', port=5000, debug=True)