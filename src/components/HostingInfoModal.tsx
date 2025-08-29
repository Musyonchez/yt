'use client';

interface HostingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HostingInfoModal({ isOpen, onClose }: HostingInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative max-w-2xl mx-4 p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            🚀 Run MP3Ninja Locally
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-200 hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p style={{ color: 'var(--muted-foreground)' }}>
            MP3Ninja uses <strong>yt-dlp</strong> for YouTube video processing, which cannot be hosted on Vercel or similar platforms due to system dependencies. To use all search features, you&apos;ll need to run it locally.
          </p>

          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <h3 
              className="font-semibold mb-3 flex items-center"
              style={{ color: 'var(--foreground)' }}
            >
              📋 Setup Instructions
            </h3>
            
            <div className="space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <div>
                <p className="font-medium mb-1">1. Clone the repository:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  git clone https://github.com/Musyonchez/yt.git
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">2. Navigate to the project:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  cd yt
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">3. Create and activate Python virtual environment:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  python -m venv venv<br />
                  source venv/bin/activate  # On Windows: venv\Scripts\activate
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">4. Install yt-dlp:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  pip install yt-dlp
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">5. Install Node.js dependencies:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  npm install
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">6. Run the development server:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  npm run dev
                </code>
              </div>

              <div>
                <p className="font-medium mb-1">7. Open in your browser:</p>
                <code 
                  className="block p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  http://localhost:3000
                </code>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <p className="text-sm">
              <strong>💡 Why local only?</strong> yt-dlp requires system-level Python dependencies and binary execution permissions that aren&apos;t available on serverless platforms like Vercel, Netlify, or Heroku.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <a
            href="https://github.com/Musyonchez/yt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)' 
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              color: 'var(--muted-foreground)',
              border: '1px solid var(--border)'
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}