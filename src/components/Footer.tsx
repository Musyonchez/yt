export default function Footer() {
  return (
    <footer 
      style={{ 
        backgroundColor: 'var(--card)', 
        borderTopWidth: '1px', 
        borderTopColor: 'var(--border)',
        borderTopStyle: 'solid'
      }}
      className="p-4 mt-auto transition-colors duration-200"
    >
      <div className="container mx-auto text-center">
        <p style={{ color: 'var(--muted-foreground)' }}>
          © 2024 YouTube Search App. Built with Next.js and Tailwind CSS.
        </p>
        <div className="flex justify-center space-x-4 mt-2">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
            className="transition-colors duration-200"
          >
            GitHub
          </a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a 
            href="https://nextjs.org" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
            className="transition-colors duration-200"
          >
            Next.js
          </a>
        </div>
      </div>
    </footer>
  );
}