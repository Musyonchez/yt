'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav 
      style={{ 
        backgroundColor: 'var(--background)', 
        backdropFilter: 'blur(20px)',
        borderBottomWidth: '1px', 
        borderBottomColor: 'var(--border)',
        borderBottomStyle: 'solid'
      }}
      className="sticky top-0 z-50 transition-all duration-300 bg-opacity-80"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src={theme === 'light' ? '/logo-black.png' : '/logo-white.png'}
                alt="MP3Ninja Logo"
                width={140}
                height={45}
                priority
                className="transition-all duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link 
                href="/search-name" 
                className="relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Search by Name
                </span>
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              </Link>
              
              <Link 
                href="/search-video" 
                className="relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Video Search
                </span>
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              </Link>
              
              <Link 
                href="/search-playlist" 
                className="relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Playlist Search
                </span>
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              </Link>
            </div>

            {/* CTA Button */}
            <Link
              href="/search-name"
              className="relative px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-3 rounded-full transition-all duration-300 group hover:scale-110 shadow-md hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)'
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="relative">
                {theme === 'light' ? (
                  <svg className="w-5 h-5 transition-all duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--muted-foreground)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 transition-all duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--muted-foreground)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-all duration-200"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden mt-4 p-4 rounded-lg transition-all duration-300 transform"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="space-y-3">
              <Link 
                href="/search-name" 
                className="block px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search by Name
              </Link>
              
              <Link 
                href="/search-video" 
                className="block px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Video Search
              </Link>
              
              <Link 
                href="/search-playlist" 
                className="block px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Playlist Search
              </Link>

              <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link
                  href="/search-name"
                  className="block px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'var(--primary-foreground)' 
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}