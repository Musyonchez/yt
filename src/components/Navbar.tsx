'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav 
      style={{ 
        backgroundColor: 'var(--card)', 
        borderBottomWidth: '1px', 
        borderBottomColor: 'var(--border)',
        borderBottomStyle: 'solid'
      }}
      className="p-4 transition-colors duration-200"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
          YouTube Search
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/search-name" 
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
            className="transition-colors duration-200"
          >
            Search by Name
          </Link>
          
          <Link 
            href="/search-video" 
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
            className="transition-colors duration-200"
          >
            Search Video URL
          </Link>
          
          <Link 
            href="/search-playlist" 
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
            className="transition-colors duration-200"
          >
            Search Playlist URL
          </Link>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors duration-200"
            style={{ 
              color: 'var(--muted-foreground)',
              backgroundColor: 'var(--accent)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted-foreground)';
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}