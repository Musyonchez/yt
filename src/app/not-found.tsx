'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6"
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      <div className="max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src={theme === 'light' ? '/logo-black.png' : '/logo-white.png'}
            alt="MP3Ninja Logo"
            width={140}
            height={45}
            className="mx-auto opacity-50"
            style={{ height: 'auto' }}
          />
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 
            className="text-8xl font-bold mb-4"
            style={{ color: 'var(--primary)' }}
          >
            404
          </h1>
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Page Not Found
          </h2>
          <p 
            className="text-lg mb-8"
            style={{ color: 'var(--muted-foreground)' }}
          >
            The page you're looking for doesn't exist or has been moved.
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
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center"
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
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center"
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
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center"
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
        <div className="mt-8 pt-6 border-t" style={{ borderTopColor: 'var(--border)' }}>
          <p 
            className="text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            🎵 Don't worry, the music never stops! Try one of our search features above.
          </p>
        </div>
      </div>
    </div>
  );
}