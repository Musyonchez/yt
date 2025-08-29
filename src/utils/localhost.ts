/**
 * Check if the application is running on localhost
 * Used to determine if yt-dlp functionality is available
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side, assume not localhost
  }
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '0.0.0.0' ||
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.') ||
         hostname.startsWith('172.16.') ||
         hostname.endsWith('.local');
}