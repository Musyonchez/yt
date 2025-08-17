'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';

interface LibrarySong {
  id: string;
  user_id: string;
  youtube_id: string;
  youtube_url: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail_url: string;
  view_count: number;
  upload_date: string;
  channel_name: string;
  group_type: string;
  status: string;
  added_at: string;
}

interface LibraryResponse {
  songs: LibrarySong[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<LibrarySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState<Set<string>>(new Set());

  const itemsPerPage = 20;

  // Fetch library data
  const fetchLibrary = async (page: number = 1, search: string = '') => {
    if (!user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/library/add?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const data: LibraryResponse = await response.json();
      setSongs(data.songs);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
      setTotalSongs(data.pagination.total);
    } catch (error) {
      console.error('Error fetching library:', error);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when user changes
  useEffect(() => {
    if (user) {
      fetchLibrary(1, searchQuery);
    }
  }, [user]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLibrary(1, searchQuery);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLibrary(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle song selection
  const handleSelectSong = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    if (selectedSongs.size === songs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(songs.map(song => song.id)));
    }
  };

  // Handle delete song
  const handleDeleteSong = async (songId: string) => {
    if (!user) return;

    setIsDeleting(prev => new Set(prev).add(songId));
    
    try {
      const response = await fetch('/api/library/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songIds: [songId],
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete song');
      }

      console.log('Song deleted:', data.message);
      
      // Refresh library to show updated list
      await fetchLibrary(currentPage, searchQuery);
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error deleting song:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to delete song');
    } finally {
      setIsDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!user || selectedSongs.size === 0) return;

    const songIdsToDelete = Array.from(selectedSongs);
    
    try {
      const response = await fetch('/api/library/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songIds: songIdsToDelete,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete songs');
      }

      console.log('Bulk delete completed:', data.message);
      
      // Clear selection
      setSelectedSongs(new Set());
      
      // Refresh library to show updated list
      await fetchLibrary(currentPage, searchQuery);
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error bulk deleting songs:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to delete songs');
    }
  };

  // Handle download song
  const handleDownloadSong = async (songId: string) => {
    if (!user) return;

    setIsDownloading(prev => new Set(prev).add(songId));
    
    try {
      const response = await fetch('/api/library/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songIds: [songId],
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to download song');
      }

      console.log('Song downloaded:', data.message);
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error downloading song:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to download song');
    } finally {
      setIsDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (!user || selectedSongs.size === 0) return;

    const songIdsToDownload = Array.from(selectedSongs);
    
    try {
      const response = await fetch('/api/library/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songIds: songIdsToDownload,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to download songs');
      }

      console.log('Bulk download completed:', data.message);
      
      // Clear selection
      setSelectedSongs(new Set());
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error bulk downloading songs:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to download songs');
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🥷</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to sign in to view your music library.
          </p>
          <a
            href="/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎵 My Music Library
          </h1>
          <p className="text-xl text-gray-600">
            Your personal collection of saved songs and playlists
          </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your library..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  🔍 Search
                </button>
              </div>
            </form>

            {/* Actions */}
            {songs.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {selectedSongs.size === songs.length ? 'Deselect All' : 'Select All'}
                </button>
                
                {selectedSongs.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkDownload}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ⬇️ Download {selectedSongs.size}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Delete {selectedSongs.size}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {totalSongs > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {totalSongs} song{totalSongs === 1 ? '' : 's'} in your library
                {searchQuery && ` • Searching for "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          // Loading State
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex space-x-4">
                  <div className="w-24 h-18 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchQuery ? 'No results found' : 'Your library is empty'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No songs found matching "${searchQuery}". Try adjusting your search terms.`
                : 'Start building your music collection by searching for songs and adding them to your library.'
              }
            </p>
            {!searchQuery && (
              <a
                href="/search"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                🔍 Start Searching
              </a>
            )}
          </div>
        ) : (
          // Songs List
          <div className="space-y-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`bg-white rounded-lg p-6 shadow-sm border transition-all ${
                  selectedSongs.has(song.id)
                    ? 'border-black ring-2 ring-black ring-opacity-20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex space-x-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-2">
                    <input
                      type="checkbox"
                      checked={selectedSongs.has(song.id)}
                      onChange={() => handleSelectSong(song.id)}
                      className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-18 bg-gray-100 rounded overflow-hidden">
                      {song.thumbnail_url ? (
                        <Image
                          src={song.thumbnail_url}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          🎵
                        </div>
                      )}
                      
                      {/* Duration overlay */}
                      {song.duration && (
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {song.duration}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {song.title}
                    </h3>
                    
                    {song.artist && (
                      <p className="text-gray-600 mb-2">
                        {song.artist}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      {song.view_count && (
                        <span>{song.view_count.toLocaleString()} views</span>
                      )}
                      {song.channel_name && (
                        <span>{song.channel_name}</span>
                      )}
                      <span>Added {new Date(song.added_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {/* Preview Button */}
                      <a
                        href={song.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        👀 Preview
                      </a>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownloadSong(song.id)}
                        disabled={isDownloading.has(song.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading.has(song.id) ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Downloading...</span>
                          </div>
                        ) : (
                          '⬇️ Download'
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        disabled={isDeleting.has(song.id)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isDeleting.has(song.id) ? 'Deleting...' : '🗑️ Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col justify-center items-center gap-6 py-8 pb-12">
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-8 mb-4">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 rounded-lg font-semibold transition-all duration-200 border-2 ${
                      page === currentPage
                        ? 'bg-black text-white border-black shadow-lg transform scale-105'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Page Info */}
            <div className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {totalPages} • {totalSongs} total songs
            </div>
          </div>
        )}
      </div>
    </div>
  );
}