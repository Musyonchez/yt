import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center justify-center md:justify-start mb-4">
              <Image
                src="/logo-black.png"
                alt="MP3 Ninja"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 mb-4 max-w-md text-center md:text-left mx-auto md:mx-0">
              Fast, efficient, and stealthy. Download YouTube music with ninja-like precision. 
              Share your discoveries with friends and build your ultimate music collection.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.942 4.556a16.3 16.3 0 0 0-4.126-1.297.068.068 0 0 0-.07.033 11.95 11.95 0 0 0-.496 1.037 15.24 15.24 0 0 0-4.573 0 11.1 11.1 0 0 0-.496-1.037.07.07 0 0 0-.07-.033 16.264 16.264 0 0 0-4.126 1.297.064.064 0 0 0-.028.025C.356 9.24-.213 13.814.066 18.322a.073.073 0 0 0 .027.05 16.428 16.428 0 0 0 4.947 2.511.069.069 0 0 0 .075-.025 11.785 11.785 0 0 0 1.016-1.658.067.067 0 0 0-.037-.094 10.814 10.814 0 0 1-1.549-.745.068.068 0 0 1-.007-.113c.104-.078.208-.16.31-.242a.066.066 0 0 1 .069-.01c3.252 1.487 6.775 1.487 9.99 0a.066.066 0 0 1 .069.01c.102.082.206.164.31.242a.068.068 0 0 1-.006.113 10.15 10.15 0 0 1-1.549.745.067.067 0 0 0-.037.094c.297.567.636 1.101 1.016 1.658a.068.068 0 0 0 .075.025 16.345 16.345 0 0 0 4.947-2.511.068.068 0 0 0 .027-.05c.325-5.217-.548-9.746-2.324-13.766a.054.054 0 0 0-.027-.025z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links container - side by side on mobile, separate columns on md+ */}
          <div className="grid grid-cols-2 md:contents gap-8 justify-items-center md:justify-items-start">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Search Music
                  </Link>
                </li>
                <li>
                  <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Discover
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@mp3ninja.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/Musyonchez/yt" className="text-gray-600 hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 MP3 Ninja. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-4 sm:mt-0">
            Built with ⚡ by ninjas, for music lovers
          </p>
        </div>
      </div>
    </footer>
  );
}