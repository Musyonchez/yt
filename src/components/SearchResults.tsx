'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from './AuthProvider';
import { VideoInfo } from '@/lib/youtube';

interface SearchResultsProps {
  results: VideoInfo[];
  isLoading?: boolean;
  searchType: 'video' | 'playlist' | 'text';
  playlistInfo?: {
    title: string;
    video_count: number;
  };
}

export default function SearchResults({ 
  results, 
  isLoading = false, 
  searchType,
  playlistInfo 
}: SearchResultsProps) {
  const { user } = useAuth();
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [addingToLibrary, setAddingToLibrary] = useState<Set<string>>(new Set());

  const handleSelectVideo = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === results.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(results.map(r => r.youtube_id)));
    }
  };

  const handleAddToLibrary = async (videoId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    const video = results.find(v => v.youtube_id === videoId);
    if (!video) return;

    setAddingToLibrary(prev => new Set(prev).add(videoId));
    
    try {
      const response = await fetch('/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songs: [video],
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to library');
      }

      // Show success message
      console.log('Added to library:', data.message);
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error adding to library:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to add to library');
    } finally {
      setAddingToLibrary(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  const handleBulkAddToLibrary = async () => {
    if (!user || selectedVideos.size === 0) return;

    const selectedSongs = results.filter(video => selectedVideos.has(video.youtube_id));
    
    try {
      const response = await fetch('/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songs: selectedSongs,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add songs to library');
      }

      console.log('Bulk added to library:', data.message);
      
      // Clear selection after successful bulk add
      setSelectedVideos(new Set());
      
      // TODO: Show toast notification
      // toast.success(data.message);
      
    } catch (error) {
      console.error('Error bulk adding to library:', error);
      // TODO: Show error toast
      // toast.error(error.message || 'Failed to add songs to library');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex space-x-4">
              <div className="w-32 h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Playlist Header */}
      {searchType === 'playlist' && playlistInfo && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📋 {playlistInfo.title}
          </h2>
          <p className="text-gray-600 mb-4">
            {playlistInfo.video_count} videos found
          </p>
          
          {user && results.length > 1 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {selectedVideos.size === results.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedVideos.size > 0 && (
                <button
                  onClick={handleBulkAddToLibrary}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add {selectedVideos.size} to Library
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {searchType === 'video' ? 'Video Details' : 
           searchType === 'playlist' ? 'Playlist Videos' : 
           `Search Results (${results.length})`}
        </h2>
        
        {user && searchType === 'text' && results.length > 1 && (
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {selectedVideos.size === results.length ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedVideos.size > 0 && (
              <button
                onClick={handleBulkAddToLibrary}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add {selectedVideos.size} to Library
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((video) => (
          <div
            key={video.youtube_id}
            className={`bg-white rounded-lg p-6 shadow-sm border transition-all ${
              selectedVideos.has(video.youtube_id) 
                ? 'border-black ring-2 ring-black ring-opacity-20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex space-x-4">
              {/* Checkbox for multi-select */}
              {user && results.length > 1 && (
                <div className="flex-shrink-0 pt-2">
                  <input
                    type="checkbox"
                    checked={selectedVideos.has(video.youtube_id)}
                    onChange={() => handleSelectVideo(video.youtube_id)}
                    className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-24 bg-gray-100 rounded overflow-hidden">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title || 'Video thumbnail'}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-thumbnail.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🎵
                    </div>
                  )}
                  
                  {/* Duration overlay */}
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {video.title || 'Untitled Video'}
                </h3>
                
                {video.artist && (
                  <p className="text-gray-600 mb-2">
                    {video.artist}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  {video.view_count && (
                    <span>{video.view_count.toLocaleString()} views</span>
                  )}
                  {video.upload_date && (
                    <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                  )}
                  {video.channel_name && (
                    <span>{video.channel_name}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Preview Button */}
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    👀 Preview
                  </a>

                  {/* Add to Library Button */}
                  {user ? (
                    <button
                      onClick={() => handleAddToLibrary(video.youtube_id)}
                      disabled={addingToLibrary.has(video.youtube_id)}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToLibrary.has(video.youtube_id) ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        '➕ Add to Library'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors"
                    >
                      🔑 Sign In to Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Footer */}
      {results.length > 5 && (
        <div className="text-center py-4">
          <p className="text-gray-600">
            Showing {results.length} results
          </p>
        </div>
      )}
    </div>
  );
}