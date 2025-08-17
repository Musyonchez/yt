'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import SearchResults from '@/components/SearchResults';
import { VideoInfo, determineSearchType } from '@/lib/youtube';

export default function SearchPage() {
  const { user } = useAuth();
  const [searchMethod, setSearchMethod] = useState<'url' | 'playlist' | 'text'>('text');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VideoInfo[]>([]);
  const [searchType, setSearchType] = useState<'video' | 'playlist' | 'text'>('text');
  const [playlistInfo, setPlaylistInfo] = useState<{title: string; video_count: number} | undefined>();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setHasSearched(false);
    
    try {
      // Determine search type automatically or use selected method
      const detectedType = determineSearchType(searchInput);
      const finalSearchType = searchMethod === 'text' ? detectedType : 
                             searchMethod === 'url' ? 'video' :
                             searchMethod === 'playlist' ? 'playlist' : detectedType;

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchInput,
          type: finalSearchType,
          userId: user?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      
      setSearchResults(data.results || []);
      setSearchType(data.type);
      setPlaylistInfo(data.playlistInfo);
      setHasSearched(true);
      
    } catch (error) {
      console.error('Search error:', error);
      // TODO: Show error toast/message to user
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceholderText = () => {
    switch (searchMethod) {
      case 'url':
        return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      case 'playlist':
        return 'https://www.youtube.com/playlist?list=PLExample123';
      case 'text':
        return 'Search for songs, artists, or keywords...';
      default:
        return 'Enter your search...';
    }
  };

  const getSearchButtonText = () => {
    switch (searchMethod) {
      case 'url':
        return 'Get Video';
      case 'playlist':
        return 'Get Playlist';
      case 'text':
        return 'Search';
      default:
        return 'Search';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search YouTube Music
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and save your favorite songs with ninja-like precision. 
            Search by video URL, playlist URL, or keywords.
          </p>
        </div>

        {/* Search Method Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setSearchMethod('text')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                searchMethod === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Text Search
            </button>
            <button
              onClick={() => setSearchMethod('url')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                searchMethod === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎵 Video URL
            </button>
            <button
              onClick={() => setSearchMethod('playlist')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                searchMethod === 'playlist'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Playlist URL
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={getPlaceholderText()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  getSearchButtonText()
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Search Method Description */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            {searchMethod === 'text' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🔍 Text Search
                </h3>
                <p className="text-gray-600">
                  Search YouTube by keywords, artist names, or song titles. 
                  Use quotes for exact phrases or add filters like &quot;official music video&quot; 
                  for better results.
                </p>
              </div>
            )}
            
            {searchMethod === 'url' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎵 Video URL Search
                </h3>
                <p className="text-gray-600">
                  Paste any YouTube video URL to get the song details. 
                  Supports youtube.com, youtu.be, and m.youtube.com formats. 
                  Perfect for saving specific videos you found elsewhere.
                </p>
              </div>
            )}
            
            {searchMethod === 'playlist' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📋 Playlist URL Search
                </h3>
                <p className="text-gray-600">
                  Import entire YouTube playlists with a single URL. 
                  Great for music collections, albums, or curated playlists. 
                  You can then select which songs to add to your library.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Check */}
        {!user && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 mb-4">
                <strong>Sign in to save songs to your library!</strong>
              </p>
              <p className="text-yellow-700 mb-4">
                You can search without signing in, but you&apos;ll need an account to save songs for later.
              </p>
              <a
                href="/login"
                className="inline-block bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In with Google
              </a>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="max-w-4xl mx-auto">
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              searchType={searchType}
              playlistInfo={playlistInfo}
            />
            
            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥷</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or check the URL format.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}