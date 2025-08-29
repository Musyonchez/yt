'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SearchResult {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  duration_string: string;
  view_count: number;
  upload_date: string;
  thumbnail: string;
  webpage_url: string;
  description: string;
}

export default function SearchNamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const resultsPerPage = 10;
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setCurrentPage(1);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchTerm.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      
      if (data.results.length === 0) {
        setError('No videos found. Try different search terms.');
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';
    try {
      const year = dateString.slice(0, 4);
      const month = dateString.slice(4, 6);
      const day = dateString.slice(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div 
      className="container mx-auto px-6 py-8 min-h-screen"
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ color: 'var(--primary)' }}
        >
          Search Videos by Name
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Enter keywords or video titles to find YouTube content
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter video title or keywords..."
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--ring)'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div 
          className="max-w-2xl mx-auto mb-6 p-4 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--destructive)',
            borderColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)'
          }}
        >
          <p className="text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-3">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            />
            <span 
              className="text-lg"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Searching YouTube...
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <>
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <p style={{ color: 'var(--muted-foreground)' }}>
              Found {results.length} results • Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid gap-6 mb-8">
            {currentResults.map((result) => (
              <div
                key={result.id}
                className="flex gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-24 relative rounded-lg overflow-hidden">
                    {result.thumbnail ? (
                      <Image
                        src={result.thumbnail}
                        alt={result.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--muted)' }}
                      >
                        <span style={{ color: 'var(--muted-foreground)' }}>
                          No thumbnail
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-xs font-semibold bg-black bg-opacity-80 text-white">
                      {result.duration_string}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-lg font-semibold mb-2 line-clamp-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {result.title}
                  </h3>
                  
                  <p 
                    className="text-sm mb-2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {result.uploader}
                  </p>

                  <div 
                    className="text-sm space-y-1"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <p>{formatViews(result.view_count)} • {formatDate(result.upload_date)}</p>
                  </div>

                  <div className="mt-3">
                    <a
                      href={result.webpage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium transition-colors duration-200 hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Watch on YouTube
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        pageNumber === currentPage ? 'font-semibold' : ''
                      }`}
                      style={{
                        backgroundColor: pageNumber === currentPage ? 'var(--primary)' : 'var(--card)',
                        borderColor: 'var(--border)',
                        color: pageNumber === currentPage ? 'var(--primary-foreground)' : 'var(--foreground)'
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-12">
          <p 
            className="text-lg mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            No results found. Try different search terms.
          </p>
        </div>
      )}
    </div>
  );
}