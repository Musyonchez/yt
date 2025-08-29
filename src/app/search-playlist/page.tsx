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

export default function SearchPlaylistPage() {
  const [playlistUrl, setPlaylistUrl] = useState('');
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
    
    if (!playlistUrl.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    // Basic YouTube playlist URL validation
    const playlistRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(playlist\?list=|watch\?.*&list=)|youtu\.be\/.*\?list=)([a-zA-Z0-9_-]+)/;
    if (!playlistRegex.test(playlistUrl.trim())) {
      setError('Please enter a valid YouTube playlist URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setCurrentPage(1);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Playlist processing failed');
      }

      setResults(data.results || []);
      
      if (data.results.length === 0) {
        setError('No videos found in playlist. Please check the URL and try again.');
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the playlist');
    } finally {
      setIsLoading(false);
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
          Search by Playlist URL
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Enter a YouTube playlist URL to extract all videos
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !playlistUrl.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Process Playlist'
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
              Processing playlist...
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
              Found {results.length} videos • Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-col rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105 overflow-hidden group"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {result.thumbnail ? (
                    <Image
                      src={result.thumbnail}
                      alt={result.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
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
                  {result.duration_string && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-semibold bg-black bg-opacity-90 text-white shadow-lg">
                      {result.duration_string}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    className="font-semibold mb-2 line-clamp-2 text-sm leading-tight flex-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {result.title}
                  </h3>
                  
                  <div 
                    className="text-xs mb-3"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <p className="truncate">{result.uploader}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <a
                      href={result.webpage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium px-2 py-1 rounded transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: 'var(--primary)', 
                        color: 'var(--primary-foreground)'
                      }}
                    >
                      Watch on YouTube
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    <button
                      className="inline-flex items-center text-xs font-medium px-2 py-1 rounded transition-all duration-200 hover:scale-105"
                      style={{ 
                        color: 'var(--muted-foreground)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      Add to Library
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:space-x-2 sm:gap-0">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
                className="w-full sm:w-auto px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
            No videos found in playlist. Please check the URL and try again.
          </p>
        </div>
      )}
    </div>
  );
}