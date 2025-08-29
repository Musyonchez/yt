'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoResult {
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

export default function SearchVideoPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [result, setResult] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(videoUrl.trim())) {
      setError('Please enter a valid YouTube video URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video processing failed');
      }

      setResult(data.result || null);
      
      if (!data.result) {
        setError('Video not found or unable to process.');
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the video');
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
          Search by Video URL
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Enter a YouTube video URL to get detailed information
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
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
            disabled={isLoading || !videoUrl.trim()}
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
              'Process Video'
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
              Processing video...
            </span>
          </div>
        </div>
      )}

      {/* Result */}
      {!isLoading && result && (
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-lg border overflow-hidden shadow-lg"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            {/* Video Thumbnail and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
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
                {result.duration_string && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-sm font-semibold bg-black bg-opacity-90 text-white shadow-lg">
                    {result.duration_string}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-4">
                <h2 
                  className="text-2xl font-bold leading-tight"
                  style={{ color: 'var(--foreground)' }}
                >
                  {result.title}
                </h2>
                
                <div 
                  className="space-y-2 text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <p><span className="font-medium">Channel:</span> {result.uploader}</p>
                  <p><span className="font-medium">Views:</span> {formatViews(result.view_count)}</p>
                  <p><span className="font-medium">Upload Date:</span> {formatDate(result.upload_date)}</p>
                  <p><span className="font-medium">Duration:</span> {result.duration_string}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <a
                    href={result.webpage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: 'var(--primary-foreground)'
                    }}
                  >
                    Watch on YouTube
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <button
                    className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      color: 'var(--muted-foreground)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)'
                    }}
                  >
                    Add to Library
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div 
                className="border-t p-6"
                style={{ borderTopColor: 'var(--border)' }}
              >
                <h3 
                  className="text-lg font-semibold mb-3"
                  style={{ color: 'var(--foreground)' }}
                >
                  Description
                </h3>
                <p 
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {result.description.length > 500 
                    ? result.description.substring(0, 500) + '...' 
                    : result.description
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Result */}
      {!isLoading && hasSearched && !result && !error && (
        <div className="text-center py-12">
          <p 
            className="text-lg mb-4"
            style={{ color: 'var(--muted-foreground)' }}
          >
            No video information found. Please check the URL and try again.
          </p>
        </div>
      )}
    </div>
  );
}