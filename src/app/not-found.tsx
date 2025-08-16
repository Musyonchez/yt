import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-black.png"
            alt="MP3 Ninja"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </div>

        {/* 404 with ninja styling */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-2">404</h1>
          <div className="relative">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              This Page Vanished Like a Ninja
            </h2>
            <div className="absolute -top-2 -right-4 text-2xl opacity-50">🥷</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for has disappeared with ninja-like stealth. 
          It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            href="/" 
            className="bg-black text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Return Home
          </Link>
          <Link 
            href="/search" 
            className="bg-white text-gray-900 border-2 border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:border-gray-400 transition-colors"
          >
            Search Music
          </Link>
        </div>

        {/* Helpful links */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Or try one of these popular sections:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/discover" 
              className="text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Discover Music
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/help" 
              className="text-gray-600 hover:text-gray-900 underline transition-colors"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Ninja-themed footer message */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Ninja Tip:</span> Use the search above to find any song, 
            or return home to discover new music with ninja-like precision.
          </p>
        </div>
      </div>
    </div>
  );
}