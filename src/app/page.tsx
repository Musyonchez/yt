'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div 
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 opacity-50" />
        
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--primary)' }}
            >
              Download YouTube
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Videos Instantly
              </span>
            </h1>
            
            <p 
              className="text-xl lg:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              MP3Ninja makes it simple to search and download YouTube content. 
              Find videos by name, URL, or entire playlists with our powerful search engine.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/search-name"
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'var(--primary-foreground)' 
                }}
              >
                <span className="relative z-10">Start Searching</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link
                href="/search-video"
                className="group px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 transform hover:scale-105"
                style={{ 
                  borderColor: 'var(--border)', 
                  color: 'var(--foreground)',
                  backgroundColor: 'transparent'
                }}
              >
                Try Video Search
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  1M+
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Videos Downloaded
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  50K+
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Happy Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  99.9%
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Uptime
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  24/7
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Three Ways to Find Your Content
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Whether you know the title, have a URL, or want an entire playlist, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Search by Name */}
            <div 
              className="group relative p-8 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <svg 
                    className="w-8 h-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  Search by Name
                </h3>
                
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Simply type the video title or keywords to find exactly what you&apos;re looking for. 
                  Our smart search understands context and delivers accurate results.
                </p>
                
                <Link 
                  href="/search-name"
                  className="inline-flex items-center font-semibold transition-all duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--primary)' }}
                >
                  Try Name Search
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Video URL Search */}
            <div 
              className="group relative p-8 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <svg 
                    className="w-8 h-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  Video URL Search
                </h3>
                
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Got a YouTube video URL? Paste it here to get detailed information and download options. 
                  Works with any valid YouTube video link.
                </p>
                
                <Link 
                  href="/search-video"
                  className="inline-flex items-center font-semibold transition-all duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--primary)' }}
                >
                  Try URL Search
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Playlist Search */}
            <div 
              className="group relative p-8 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <svg 
                    className="w-8 h-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  Playlist Search
                </h3>
                
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Download entire YouTube playlists at once. Perfect for music albums, 
                  educational series, or any collection of videos you want to save.
                </p>
                
                <Link 
                  href="/search-playlist"
                  className="inline-flex items-center font-semibold transition-all duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--primary)' }}
                >
                  Try Playlist Search
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Why Choose MP3Ninja?
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Built with modern technology and designed for the best user experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🚀", title: "Lightning Fast", description: "Optimized for speed with instant search results" },
              { icon: "🌙", title: "Dark Mode", description: "Beautiful light and dark themes that adapt to your preference" },
              { icon: "📱", title: "Responsive", description: "Works perfectly on desktop, tablet, and mobile devices" },
              { icon: "🔒", title: "Secure", description: "Your privacy is protected with our secure infrastructure" }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: 'var(--foreground)' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-4xl font-bold mb-6"
              style={{ color: 'var(--foreground)' }}
            >
              Ready to Start Downloading?
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Join thousands of users who trust MP3Ninja for their YouTube downloading needs
            </p>
            
            <Link
              href="/search-name"
              className="group relative inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}
            >
              <span className="relative z-10">Get Started for Free</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
