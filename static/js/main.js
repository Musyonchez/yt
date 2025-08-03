/**
 * Main JavaScript application for YouTube Audio Downloader
 * Handles core functionality, API communication, and UI interactions
 */

// Main application object
const App = {
    // Configuration
    config: {
        apiBaseUrl: '',
        progressUpdateInterval: 2000,
        toastDuration: 5000
    },
    
    // State management
    state: {
        downloads: new Map(),
        queue: new Set(),
        progressEventSource: null,
        isDownloading: false,
        isPaused: false
    },
    
    /**
     * Initialize the application
     */
    init: function() {
        console.log('Initializing YouTube Audio Downloader App...');
        
        // Initialize components
        this.initializeEventListeners();
        this.initializeProgressMonitoring();
        this.updateQueueBadge();
        
        console.log('App initialized successfully');
    },
    
    /**
     * Initialize global event listeners
     */
    initializeEventListeners: function() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showToast('An error occurred: ' + e.error.message, 'error');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showToast('An error occurred: ' + e.reason, 'error');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to start downloads
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.startDownloads();
            }
            
            // Escape to close modals/overlays
            if (e.key === 'Escape') {
                this.hideLoadingOverlay();
            }
        });
    },
    
    /**
     * Initialize progress monitoring via Server-Sent Events
     */
    initializeProgressMonitoring: function() {
        // Check if EventSource is supported
        if (typeof EventSource === 'undefined') {
            console.warn('Server-Sent Events not supported, falling back to polling');
            this.startProgressPolling();
            return;
        }
        
        try {
            this.state.progressEventSource = new EventSource('/progress');
            
            this.state.progressEventSource.onmessage = (event) => {
                try {
                    const progressData = JSON.parse(event.data);
                    this.handleProgressUpdate(progressData);
                } catch (error) {
                    console.error('Error parsing progress data:', error);
                }
            };
            
            this.state.progressEventSource.onerror = (error) => {
                console.error('Progress EventSource error:', error);
                // Fallback to polling on error
                this.startProgressPolling();
            };
            
        } catch (error) {
            console.error('Error initializing progress monitoring:', error);
            this.startProgressPolling();
        }
    },
    
    /**
     * Start progress polling as fallback
     */
    startProgressPolling: function() {
        setInterval(() => {
            this.fetchProgressUpdate();
        }, this.config.progressUpdateInterval);
    },
    
    /**
     * Fetch progress update via polling
     */
    fetchProgressUpdate: async function() {
        try {
            const response = await fetch('/api/progress');
            if (response.ok) {
                const progressData = await response.json();
                this.handleProgressUpdate(progressData);
            }
        } catch (error) {
            console.error('Error fetching progress update:', error);
        }
    },
    
    /**
     * Handle progress updates from server
     */
    handleProgressUpdate: function(progressData) {
        // Update application state
        this.state.isDownloading = progressData.is_running || false;
        this.state.isPaused = progressData.is_paused || false;
        
        // Update download status indicator
        this.updateDownloadStatus(progressData);
        
        // Update individual download progress
        if (progressData.active_downloads) {
            Object.entries(progressData.active_downloads).forEach(([url, download]) => {
                this.state.downloads.set(url, download);
            });
        }
        
        // Update queue badge
        this.updateQueueBadge(progressData.queue_size);
        
        // Notify dashboard if present
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateProgress(progressData);
        }
        
        // Notify queue page if present
        if (typeof Queue !== 'undefined') {
            Queue.updateProgress(progressData);
        }
    },
    
    /**
     * Update download status indicator
     */
    updateDownloadStatus: function(progressData) {
        const statusElement = document.getElementById('download-status');
        const footerStatusElement = document.getElementById('footer-status');
        
        let statusText = 'Idle';
        let statusColor = 'bg-gray-400';
        
        if (progressData.is_running) {
            if (progressData.is_paused) {
                statusText = 'Paused';
                statusColor = 'bg-yellow-400';
            } else {
                statusText = 'Downloading';
                statusColor = 'bg-green-400';
            }
        }
        
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="flex items-center">
                    <span class="w-2 h-2 ${statusColor} rounded-full mr-2"></span>
                    ${statusText}
                </span>
            `;
        }
        
        if (footerStatusElement) {
            footerStatusElement.textContent = statusText;
        }
    },
    
    /**
     * Update queue badge in navigation
     */
    updateQueueBadge: function(queueSize) {
        const badge = document.getElementById('queue-badge');
        if (badge) {
            const size = queueSize || this.state.queue.size;
            if (size > 0) {
                badge.textContent = size;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },
    
    /**
     * Add URLs to download queue
     */
    addToQueue: async function(urls) {
        if (!Array.isArray(urls)) {
            urls = [urls];
        }
        
        this.showLoadingOverlay();
        
        try {
            const response = await fetch('/api/queue/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls: urls })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add to queue');
            }
            
            // Update local state
            urls.forEach(url => this.state.queue.add(url));
            this.updateQueueBadge();
            
            this.hideLoadingOverlay();
            
            return data;
            
        } catch (error) {
            this.hideLoadingOverlay();
            console.error('Error adding to queue:', error);
            throw error;
        }
    },
    
    /**
     * Remove URL from download queue
     */
    removeFromQueue: async function(url) {
        try {
            const response = await fetch('/api/queue/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove from queue');
            }
            
            // Update local state
            this.state.queue.delete(url);
            this.updateQueueBadge();
            
            return data;
            
        } catch (error) {
            console.error('Error removing from queue:', error);
            throw error;
        }
    },
    
    /**
     * Start downloads
     */
    startDownloads: async function() {
        try {
            const response = await fetch('/api/download/start', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to start downloads');
            }
            
            this.state.isDownloading = true;
            this.state.isPaused = false;
            
            this.showToast('Downloads started', 'success');
            
            return data;
            
        } catch (error) {
            console.error('Error starting downloads:', error);
            this.showToast('Error starting downloads: ' + error.message, 'error');
            throw error;
        }
    },
    
    /**
     * Pause downloads
     */
    pauseDownloads: async function() {
        try {
            const response = await fetch('/api/download/pause', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to pause downloads');
            }
            
            this.state.isPaused = true;
            
            this.showToast('Downloads paused', 'success');
            
            return data;
            
        } catch (error) {
            console.error('Error pausing downloads:', error);
            this.showToast('Error pausing downloads: ' + error.message, 'error');
            throw error;
        }
    },
    
    /**
     * Search YouTube videos
     */
    searchVideos: async function(query, page = 1, perPage = 15) {
        try {
            const params = new URLSearchParams({
                q: query,
                page: page.toString(),
                per_page: perPage.toString()
            });
            
            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }
            
            return data;
            
        } catch (error) {
            console.error('Error searching videos:', error);
            throw error;
        }
    },
    
    /**
     * Get playlist videos
     */
    getPlaylistVideos: async function(playlistUrl) {
        try {
            const params = new URLSearchParams({
                url: playlistUrl
            });
            
            const response = await fetch(`/api/playlist?${params}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load playlist');
            }
            
            return data;
            
        } catch (error) {
            console.error('Error loading playlist:', error);
            throw error;
        }
    },
    
    /**
     * Clear completed downloads
     */
    clearCompleted: async function() {
        try {
            const response = await fetch('/api/downloads/clear-completed', {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showToast('Completed downloads cleared', 'success');
                
                // Notify dashboard if present
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.clearCompleted();
                }
            }
            
        } catch (error) {
            console.error('Error clearing completed downloads:', error);
            this.showToast('Error clearing completed downloads', 'error');
        }
    },
    
    /**
     * Update dashboard statistics
     */
    updateDashboardStats: async function() {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const stats = await response.json();
                
                // Notify dashboard if present
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.updateStats(stats);
                }
            }
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    },
    
    /**
     * Show toast notification
     */
    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast transform transition-all duration-300 translate-x-full`;
        
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const icons = {
            success: 'fas fa-check',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation',
            info: 'fas fa-info'
        };
        
        toast.innerHTML = `
            <div class="${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
                <i class="${icons[type]}"></i>
                <span class="flex-1">${message}</span>
                <button class="toast-close text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        // Auto-hide after duration
        setTimeout(() => {
            this.hideToast(toast);
        }, this.config.toastDuration);
    },
    
    /**
     * Hide toast notification
     */
    hideToast: function(toast) {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },
    
    /**
     * Show loading overlay
     */
    showLoadingOverlay: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    },
    
    /**
     * Hide loading overlay
     */
    hideLoadingOverlay: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },
    
    /**
     * Format duration from seconds to readable format
     */
    formatDuration: function(seconds) {
        if (!seconds || seconds <= 0) return 'Unknown';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    },
    
    /**
     * Validate YouTube URL
     */
    isValidYouTubeUrl: function(url) {
        const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=)|youtu\.be\/)/;
        return youtubeRegex.test(url);
    },
    
    /**
     * Extract video ID from YouTube URL
     */
    extractVideoId: function(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    },
    
    /**
     * Cleanup on page unload
     */
    cleanup: function() {
        if (this.state.progressEventSource) {
            this.state.progressEventSource.close();
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    App.cleanup();
});

// Make App available globally
window.App = App;