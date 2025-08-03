/**
 * Search functionality for YouTube Audio Downloader
 * Handles video search, pagination, and lazy loading
 */

const Search = {
    // Configuration
    config: {
        resultsPerPage: 50,
        maxResults: 50,
        maxPages: 1
    },
    
    // State
    state: {
        currentQuery: '',
        currentPage: 1,
        totalPages: 1,
        results: [],
        selectedVideos: new Set(),
        isLoading: false,
        hasMore: false
    },
    
    /**
     * Initialize search functionality
     */
    init: function() {
        console.log('Initializing Search functionality...');
        this.bindEvents();
    },
    
    /**
     * Bind search-specific events
     */
    bindEvents: function() {
        // Search form submission is handled in the template
        // This handles programmatic search calls
        
        // Video selection events will be bound dynamically
        // Intersection Observer for lazy loading
        this.initIntersectionObserver();
    },
    
    /**
     * Initialize Intersection Observer for lazy loading
     */
    initIntersectionObserver: function() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Lazy load images
                        const img = entry.target.querySelector('img[data-src]');
                        if (img) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            this.observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    },
    
    /**
     * Perform search
     */
    performSearch: async function(query, page = 1) {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.state.currentQuery = query;
        this.state.currentPage = page;
        
        try {
            this.showLoadingState();
            this.setSearchButtonLoading(true);
            
            const results = await App.searchVideos(query, page, this.config.resultsPerPage);
            
            this.state.results = results.results || [];
            this.state.totalPages = results.total_pages || 1;
            this.state.hasMore = results.has_more || false;
            
            if (this.state.results.length === 0) {
                this.showNoResultsState();
            } else {
                this.displayResults(results);
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorState(error.message);
            App.showToast('Search failed: ' + error.message, 'error');
        } finally {
            this.state.isLoading = false;
            this.setSearchButtonLoading(false);
        }
    },
    
    /**
     * Display search results
     */
    displayResults: function(results) {
        this.hideAllStates();
        this.showResultsContainer();
        
        // Update results header
        this.updateResultsHeader(results);
        
        // Display results grid
        this.renderResultsGrid(results.results);
        
        // Update pagination
        this.updatePagination();
        
        // Reset selection
        this.state.selectedVideos.clear();
        this.updateSelectedCount();
    },
    
    /**
     * Update results header
     */
    updateResultsHeader: function(results) {
        const resultsInfo = document.getElementById('results-info');
        if (resultsInfo) {
            const start = ((this.state.currentPage - 1) * this.config.resultsPerPage) + 1;
            const end = Math.min(start + results.results.length - 1, results.total_results);
            resultsInfo.textContent = `Showing ${start}-${end} of ${results.total_results} results for "${this.state.currentQuery}"`;
        }
    },
    
    /**
     * Render results grid
     */
    renderResultsGrid: function(videos) {
        const grid = document.getElementById('results-grid');
        const template = document.getElementById('video-result-template');
        
        if (!grid || !template) return;
        
        // Clear existing results for new search
        if (this.state.currentPage === 1) {
            grid.innerHTML = '';
        }
        
        videos.forEach((video, index) => {
            const videoFragment = this.createVideoElement(video, template);
            grid.appendChild(videoFragment);
            
            // Get the actual element after it's been appended
            const videoElement = grid.lastElementChild;
            
            // Add to intersection observer
            if (this.observer && videoElement) {
                this.observer.observe(videoElement);
            }
        });
    },
    
    /**
     * Create video element from template
     */
    createVideoElement: function(video, template) {
        const clone = template.content.cloneNode(true);
        const element = clone.querySelector('.video-result');
        
        // Set video data
        element.dataset.videoUrl = video.url;
        element.dataset.videoId = video.video_id;
        
        // Update content
        const thumbnail = clone.querySelector('.video-thumbnail');
        thumbnail.dataset.src = video.thumbnail; // For lazy loading
        thumbnail.alt = video.title;
        
        clone.querySelector('.video-duration').textContent = video.duration;
        clone.querySelector('.video-title').textContent = video.title;
        clone.querySelector('.video-title').title = video.title;
        clone.querySelector('.video-channel').textContent = video.channel;
        
        // Bind events
        const checkbox = clone.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            this.toggleVideoSelection(video.url, checkbox.checked);
        });
        
        const addBtn = clone.querySelector('.add-single');
        addBtn.addEventListener('click', () => {
            this.addSingleVideo(video);
        });
        
        const previewBtn = clone.querySelector('.preview-btn');
        previewBtn.addEventListener('click', () => {
            window.open(video.url, '_blank');
        });
        
        // Click on card to select/deselect
        element.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                checkbox.checked = !checkbox.checked;
                this.toggleVideoSelection(video.url, checkbox.checked);
            }
        });
        
        return clone;
    },
    
    /**
     * Toggle video selection
     */
    toggleVideoSelection: function(url, selected) {
        if (selected) {
            this.state.selectedVideos.add(url);
        } else {
            this.state.selectedVideos.delete(url);
        }
        this.updateSelectedCount();
        
        // Visual feedback
        const videoElement = document.querySelector(`[data-video-url="${url}"]`);
        if (videoElement) {
            if (selected) {
                videoElement.classList.add('ring-2', 'ring-youtube');
            } else {
                videoElement.classList.remove('ring-2', 'ring-youtube');
            }
        }
    },
    
    /**
     * Toggle select all videos
     */
    toggleSelectAll: function() {
        const checkboxes = document.querySelectorAll('#results-grid input[type="checkbox"]');
        const allSelected = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            const newState = !allSelected;
            checkbox.checked = newState;
            
            const videoElement = checkbox.closest('.video-result');
            const url = videoElement.dataset.videoUrl;
            this.toggleVideoSelection(url, newState);
        });
        
        // Update button text
        const selectAllBtn = document.getElementById('select-all');
        if (selectAllBtn) {
            selectAllBtn.textContent = allSelected ? 'Select All' : 'Deselect All';
        }
    },
    
    /**
     * Update selected count display
     */
    updateSelectedCount: function() {
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = this.state.selectedVideos.size;
        }
        
        // Enable/disable add selected button
        const addSelectedBtn = document.getElementById('add-selected');
        if (addSelectedBtn) {
            addSelectedBtn.disabled = this.state.selectedVideos.size === 0;
            if (this.state.selectedVideos.size === 0) {
                addSelectedBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                addSelectedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    },
    
    /**
     * Add selected videos to queue
     */
    addSelected: async function() {
        if (this.state.selectedVideos.size === 0) {
            App.showToast('No videos selected', 'warning');
            return;
        }
        
        try {
            const urls = Array.from(this.state.selectedVideos);
            await App.addToQueue(urls);
            
            // Clear selection and update UI
            this.clearSelection();
            App.showToast(`Added ${urls.length} videos to queue`, 'success');
            
        } catch (error) {
            App.showToast('Error adding videos to queue: ' + error.message, 'error');
        }
    },
    
    /**
     * Add single video to queue
     */
    addSingleVideo: async function(video) {
        try {
            await App.addToQueue([video.url]);
            App.showToast(`Added "${video.title}" to queue`, 'success');
            
            // Visual feedback
            const videoElement = document.querySelector(`[data-video-url="${video.url}"]`);
            if (videoElement) {
                const addBtn = videoElement.querySelector('.add-single');
                addBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Added';
                addBtn.classList.remove('bg-youtube', 'hover:bg-youtube-dark');
                addBtn.classList.add('bg-green-500', 'cursor-not-allowed');
                addBtn.disabled = true;
            }
            
        } catch (error) {
            App.showToast('Error adding to queue: ' + error.message, 'error');
        }
    },
    
    /**
     * Clear selection
     */
    clearSelection: function() {
        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('#results-grid input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const videoElement = checkbox.closest('.video-result');
            videoElement.classList.remove('ring-2', 'ring-youtube');
        });
        
        // Clear state
        this.state.selectedVideos.clear();
        this.updateSelectedCount();
        
        // Reset select all button
        const selectAllBtn = document.getElementById('select-all');
        if (selectAllBtn) {
            selectAllBtn.textContent = 'Select All';
        }
    },
    
    /**
     * Navigate to previous page
     */
    previousPage: function() {
        if (this.state.currentPage > 1) {
            this.performSearch(this.state.currentQuery, this.state.currentPage - 1);
        }
    },
    
    /**
     * Navigate to next page
     */
    nextPage: function() {
        if (this.state.currentPage < Math.min(this.state.totalPages, this.config.maxPages)) {
            this.performSearch(this.state.currentQuery, this.state.currentPage + 1);
        }
    },
    
    /**
     * Load more results (lazy loading)
     */
    loadMore: function() {
        if (this.state.hasMore && this.state.currentPage < this.config.maxPages) {
            this.performSearch(this.state.currentQuery, this.state.currentPage + 1);
        }
    },
    
    /**
     * Update pagination controls
     */
    updatePagination: function() {
        // Update page numbers
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (currentPageElement) {
            currentPageElement.textContent = this.state.currentPage;
        }
        
        if (totalPagesElement) {
            totalPagesElement.textContent = Math.min(this.state.totalPages, this.config.maxPages);
        }
        
        // Update button states
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const loadMoreBtn = document.getElementById('load-more');
        
        if (prevBtn) {
            prevBtn.disabled = this.state.currentPage <= 1;
            if (prevBtn.disabled) {
                prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.state.currentPage >= Math.min(this.state.totalPages, this.config.maxPages);
            if (nextBtn.disabled) {
                nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        
        // Show/hide load more button
        if (loadMoreBtn) {
            if (this.state.hasMore && this.state.currentPage < this.config.maxPages) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }
    },
    
    /**
     * Show loading state
     */
    showLoadingState: function() {
        this.hideAllStates();
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
    },
    
    /**
     * Show no results state
     */
    showNoResultsState: function() {
        this.hideAllStates();
        const noResultsState = document.getElementById('no-results');
        if (noResultsState) {
            noResultsState.classList.remove('hidden');
        }
    },
    
    /**
     * Show error state
     */
    showErrorState: function(message) {
        this.hideAllStates();
        // For now, just show a toast - could implement a proper error state
        App.showToast('Search error: ' + message, 'error');
    },
    
    /**
     * Show results container
     */
    showResultsContainer: function() {
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
        }
    },
    
    /**
     * Hide all states
     */
    hideAllStates: function() {
        const states = [
            'loading-state',
            'no-results',
            'search-results'
        ];
        
        states.forEach(stateId => {
            const element = document.getElementById(stateId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    },
    
    /**
     * Set search button loading state
     */
    setSearchButtonLoading: function(isLoading) {
        const searchButton = document.getElementById('search-button');
        const searchIcon = document.getElementById('search-icon');
        const searchSpinner = document.getElementById('search-spinner');
        const searchText = document.getElementById('search-text');
        const searchInput = document.getElementById('search-input');
        
        if (!searchButton) return;
        
        if (isLoading) {
            // Show loading state
            searchButton.disabled = true;
            searchInput.disabled = true;
            searchIcon.classList.add('hidden');
            searchSpinner.classList.remove('hidden');
            searchText.textContent = 'Searching...';
            searchButton.classList.add('cursor-not-allowed');
        } else {
            // Show normal state
            searchButton.disabled = false;
            searchInput.disabled = false;
            searchIcon.classList.remove('hidden');
            searchSpinner.classList.add('hidden');
            searchText.textContent = 'Search';
            searchButton.classList.remove('cursor-not-allowed');
        }
    }
};

// Make Search available globally
window.Search = Search;