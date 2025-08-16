'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Sign in error:', error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-black.png"
              alt="MP3 Ninja"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, Ninja
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to access your music library and discover new tracks with ninja-like precision.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-gray-700 hover:text-gray-900 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-gray-700 hover:text-gray-900 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            New to MP3 Ninja?{' '}
            <span className="text-gray-700 font-medium">
              Just sign in with Google to get started instantly
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}