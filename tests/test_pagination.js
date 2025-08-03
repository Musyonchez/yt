// Test pagination button functionality
console.log('Testing pagination buttons...');

// Mock search results for testing
const mockResults = {
    results: [
        {title: 'Test Video 1', url: 'https://youtube.com/watch?v=test1'},
        {title: 'Test Video 2', url: 'https://youtube.com/watch?v=test2'}
    ],
    total_pages: 5,
    has_more: true,
    total_results: 75
};

// Test Search object state
console.log('Initial Search state:', {
    currentPage: Search.state.currentPage,
    totalPages: Search.state.totalPages,
    hasMore: Search.state.hasMore,
    maxPages: Search.config.maxPages
});

// Simulate setting search results
Search.state.results = mockResults.results;
Search.state.totalPages = mockResults.total_pages;
Search.state.hasMore = mockResults.has_more;
Search.state.currentPage = 1;

console.log('After setting mock results:', {
    currentPage: Search.state.currentPage,
    totalPages: Search.state.totalPages,
    hasMore: Search.state.hasMore,
    maxPages: Search.config.maxPages
});

// Test pagination update
console.log('Before updatePagination - totalPages element:', document.getElementById('total-pages')?.textContent);
Search.updatePagination();
console.log('After updatePagination - totalPages element:', document.getElementById('total-pages')?.textContent);

// Check button states
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');

console.log('Button states after updatePagination():', {
    prevDisabled: prevBtn?.disabled,
    nextDisabled: nextBtn?.disabled,
    prevClasses: prevBtn?.className,
    nextClasses: nextBtn?.className
});

// Test next page logic
console.log('Can go to next page?', Search.state.currentPage < Math.min(Search.state.totalPages, Search.config.maxPages));
console.log('Math.min result:', Math.min(Search.state.totalPages, Search.config.maxPages));

// Test event listeners
const nextBtn = document.getElementById('next-page');
if (nextBtn) {
    console.log('Adding test event listener to next button...');
    nextBtn.addEventListener('click', function() {
        console.log('Next button clicked!');
        console.log('Calling Search.nextPage()...');
        Search.nextPage();
    });
}

// Test nextPage function directly
console.log('Testing nextPage function directly...');
const originalPerformSearch = Search.performSearch;
Search.performSearch = function(query, page) {
    console.log(`performSearch called with query: "${query}", page: ${page}`);
    return Promise.resolve({results: [], total_pages: 5, has_more: true});
};

// Set a query so nextPage has something to work with
Search.state.currentQuery = 'test query';
console.log('Current query set to:', Search.state.currentQuery);

// Try calling nextPage directly
console.log('Calling Search.nextPage() directly...');
Search.nextPage();