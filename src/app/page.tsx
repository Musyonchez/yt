'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="container mx-auto px-4 py-8"
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      <div className="text-center mb-12">
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ color: 'var(--primary)' }}
        >
          MP3Ninja
        </h1>
        <p 
          className="text-xl"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Search and download YouTube videos by name, video URL, or playlist URL
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div 
          className="p-6 rounded-lg border transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card)', 
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg 
                className="w-8 h-8" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--primary-foreground)' }}
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              Search by Name
            </h3>
            <p 
              className="mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Find YouTube videos by searching for their titles or keywords
            </p>
            <Link 
              href="/search-name"
              className="inline-block px-4 py-2 rounded transition-colors duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}
            >
              Start Searching
            </Link>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card)', 
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg 
                className="w-8 h-8" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--primary-foreground)' }}
              >
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              Video URL Search
            </h3>
            <p 
              className="mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Get detailed information about a specific YouTube video
            </p>
            <Link 
              href="/search-video"
              className="inline-block px-4 py-2 rounded transition-colors duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}
            >
              Search Video
            </Link>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card)', 
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg 
                className="w-8 h-8" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--primary-foreground)' }}
              >
                <path d="M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6M20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H8V4H20V16Z"/>
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              Playlist URL Search
            </h3>
            <p 
              className="mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Explore YouTube playlists and their video contents
            </p>
            <Link 
              href="/search-playlist"
              className="inline-block px-4 py-2 rounded transition-colors duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}
            >
              Search Playlist
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <h2 
          className="text-2xl font-semibold mb-4"
          style={{ color: 'var(--card-foreground)' }}
        >
          Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Theme switching (Light/Dark mode)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Responsive design
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Fast search functionality
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Modern UI/UX
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
