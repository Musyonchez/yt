'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-8"
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* 404 Number */}
        <div>
          <h1 
            className="text-6xl md:text-8xl font-bold mb-2"
            style={{ color: 'var(--primary)' }}
          >
            404
          </h1>
          <h2 
            className="text-xl md:text-2xl font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Page Not Found
          </h2>
          <p 
            className="text-base md:text-lg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            Go Home
          </Link>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/search-name"
              className="px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center text-sm"
              style={{
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              Search by Name
            </Link>
            
            <Link
              href="/search-video"
              className="px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center text-sm"
              style={{
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              Video Search
            </Link>
            
            <Link
              href="/search-playlist"
              className="px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center text-sm"
              style={{
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              Playlist Search
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="pt-4 border-t" style={{ borderTopColor: 'var(--border)' }}>
          <p 
            className="text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            🎵 Don&apos;t worry, the music never stops! Try one of our search features above.
          </p>
        </div>
      </div>
    </div>
  );
}