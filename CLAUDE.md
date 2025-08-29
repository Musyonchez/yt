# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MP3Ninja** is a modern YouTube video search and download application built with Next.js 15. It allows users to search YouTube content by video name, direct video URL, or playlist URL with a professional SaaS-level UI/UX.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## System Requirements

### Required Dependencies
- **Node.js 18+** - Runtime environment
- **yt-dlp** - Python package for YouTube video processing
  - Install via: `pip install yt-dlp` or `pip3 install yt-dlp`
  - Must be available in system PATH for API routes to work
  - Used for video search, metadata extraction, and download functionality

### Package Dependencies
- All Node.js dependencies are managed via `package.json`
- Run `npm install` to install all required packages

## Project Architecture

This is MP3Ninja, a Next.js 15 project with App Router using TypeScript and Tailwind CSS v4. The application provides three main search methods for YouTube content discovery and processing.

### Key Technologies

- **Next.js 15** with App Router and API Routes
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS v4** with new `@import "tailwindcss"` syntax and CSS variables
- **PostCSS** with `@tailwindcss/postcss` plugin
- **yt-dlp** integration via Node.js child processes
- **React Hooks** for state management and theme control

### Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with Navbar/Footer integration
│   ├── page.tsx             # Homepage with SaaS-level hero and features
│   ├── globals.css          # Global styles with comprehensive theme system
│   ├── search-name/
│   │   └── page.tsx         # Video search by title/keywords
│   ├── search-video/        # [Future] Direct video URL processing
│   ├── search-playlist/     # [Future] Playlist URL processing
│   └── api/
│       └── search-name/
│           └── route.ts     # API endpoint for yt-dlp video search
├── components/
│   ├── Navbar.tsx           # Professional navigation with theme toggle
│   └── Footer.tsx           # Comprehensive footer with links and social
├── hooks/
│   └── useTheme.ts          # Theme management with localStorage persistence
public/
├── logo-black.png           # MP3Ninja logo for light theme
├── logo-white.png           # MP3Ninja logo for dark theme
├── next.svg                 # Next.js logo
├── vercel.svg              # Vercel logo
├── file.svg                # File icon
├── window.svg              # Window icon
└── globe.svg               # Globe icon
docs/
├── theme-implementation.md  # Comprehensive theme system documentation
├── logo-black.png          # Original logo files
└── logo-white.png          # Original logo files
```

### Application Features

#### 1. Search by Name (`/search-name`)
- **Input**: Video title or keywords
- **Process**: Uses `yt-dlp "ytsearch50:term" --dump-json`
- **Results**: 50 videos parsed and paginated (10 per page)
- **Display**: Thumbnails, titles, channels, duration, views, upload dates
- **UI**: Loading states, error handling, responsive design

#### 2. Search by Video URL (`/search-video`) [Planned]
- **Input**: Direct YouTube video URL
- **Process**: Video metadata extraction and download options
- **Results**: Single video detailed information

#### 3. Search by Playlist URL (`/search-playlist`) [Planned]
- **Input**: YouTube playlist URL
- **Process**: Extract all videos from playlist
- **Results**: List of all playlist videos with batch operations

### API Architecture

#### `/api/search-name` (POST)
- **Purpose**: YouTube video search via yt-dlp
- **Input**: `{ searchTerm: string }`
- **Process**: 
  - Spawns yt-dlp child process with 30s timeout
  - Parses JSON output line by line
  - Extracts structured metadata
- **Output**: Array of VideoResult objects
- **Error Handling**: Process failures, parsing errors, timeouts

```typescript
interface VideoResult {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  duration_string: string;
  view_count: number;
  upload_date: string;
  thumbnail: string;
  webpage_url: string;
  description: string;
}
```

### Styling System

#### Tailwind CSS v4 Configuration
- **CSS Import**: Uses `@import "tailwindcss"` in `globals.css`
- **Theme Configuration**: Inline theme configuration with `@theme` directive
- **PostCSS**: Configured with `@tailwindcss/postcss` plugin
- **No Config File**: Avoids traditional `tailwind.config.js` files

#### CSS Variables Theme System
Comprehensive theme system with semantic color tokens:

**Light Theme Colors:**
- `--background: #ffffff` - Main page background
- `--foreground: #171717` - Primary text color
- `--card: #ffffff` - Card backgrounds
- `--primary: #3b82f6` - Primary actions, buttons
- `--muted: #f8fafc` - Muted backgrounds
- `--border: #e2e8f0` - Borders, dividers

**Dark Theme Colors:**
- `--background: #0f172a` - Dark main background
- `--foreground: #f8fafc` - Light text on dark
- `--card: #1e293b` - Dark card backgrounds
- `--primary: #60a5fa` - Lighter primary for dark mode
- `--muted: #1e293b` - Dark muted backgrounds
- `--border: #334155` - Dark borders

**Theme Management:**
- `useTheme()` hook manages light/dark state
- `localStorage` persistence for user preference
- Automatic system preference detection
- CSS class toggling on document root (`:root.dark`)

### Component Architecture

#### Navbar Component
- **SaaS-level design** with sticky positioning and backdrop blur
- **Responsive navigation** with mobile hamburger menu
- **Logo integration** with theme-aware logo switching
- **Professional animations** and hover effects
- **Theme toggle** with rotating icon animations
- **CTA button** with gradient hover effects

#### Footer Component
- **Multi-column layout** with brand, product, and company sections
- **Social media integration** (GitHub, Twitter, Discord)
- **Professional link organization** with hover effects
- **Bottom attribution bar** with framework credits
- **Responsive design** for all screen sizes

#### Homepage Design
- **Hero section** with large typography and gradient text effects
- **Feature showcase** with three main search methods
- **Stats section** with impressive metrics
- **Why Choose Us** section with benefits
- **Multiple CTAs** for conversion optimization
- **Professional spacing** and visual hierarchy

### Search Page Architecture

#### Search-Name Page
- **Search Form**: Input with validation and loading states
- **Results Display**: Grid layout with video metadata
- **Pagination**: Client-side pagination (10 results per page)
- **Error Handling**: User-friendly error messages
- **Loading States**: Spinners during API calls
- **Responsive Design**: Works on all screen sizes

### Font Configuration

Uses Geist font family from Google Fonts:
- `--font-geist-sans` for sans-serif text
- `--font-geist-mono` for monospace text
- Loaded in `layout.tsx` and available as CSS variables
- Applied to body element with fallbacks

### Development Guidelines

#### Code Standards
- **TypeScript**: Strict typing with interfaces for all data structures
- **ESLint**: Configured with Next.js recommended rules
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Image optimization, lazy loading, efficient pagination
- **Accessibility**: Semantic HTML, proper ARIA attributes, keyboard navigation

#### Theme Integration
- **Always use CSS variables** for colors instead of hardcoded values
- **Follow semantic naming** (primary, secondary, muted, etc.)
- **Test both themes** during development
- **Use theme-aware components** for images and icons

#### API Development
- **Child Process Pattern**: Use Node.js spawn for external tools
- **Proper Error Handling**: Catch process failures, timeouts, parsing errors
- **Type Safety**: Define interfaces for all API responses
- **Timeout Management**: Set reasonable timeouts for external processes

#### UI/UX Standards
- **Loading States**: Always show loading indicators for async operations
- **Error Feedback**: Clear, actionable error messages
- **Empty States**: Helpful messages when no results found
- **Responsive Design**: Mobile-first approach with breakpoints
- **Micro-interactions**: Subtle animations for better user experience

### Build and Deployment

#### Build Process
- Next.js static generation where possible
- API routes are server-rendered on demand
- Image optimization for logos and thumbnails
- CSS optimization with Tailwind purging

#### Production Requirements
- **yt-dlp** must be installed and available in PATH
- **Node.js 18+** runtime environment
- **Environment variables** for any configuration
- **Process permissions** for spawning child processes

### Documentation References

- **Theme Implementation**: `docs/theme-implementation.md` - Comprehensive theme system guide
- **API Documentation**: Generated from TypeScript interfaces
- **Component Documentation**: In-code comments and prop types

### Development Notes

#### Important Considerations
- **yt-dlp Dependency**: Critical external dependency for core functionality
- **Process Timeouts**: 30-second timeout for search operations
- **Error Recovery**: Graceful handling of yt-dlp failures
- **Rate Limiting**: Consider implementing for production use
- **Caching**: Consider caching search results for better performance

#### Current Implementation Status
- ✅ **Homepage**: Complete with SaaS-level design
- ✅ **Navigation**: Professional navbar with theme toggle
- ✅ **Footer**: Comprehensive footer with social links
- ✅ **Theme System**: Complete light/dark theme implementation
- ✅ **Search by Name**: Fully functional with pagination
- 🚧 **Search by Video URL**: Planned for next iteration
- 🚧 **Search by Playlist URL**: Planned for future development
- 🚧 **Download Functionality**: Future enhancement
- 🚧 **Toast Notifications**: Planned for better UX

#### Future Enhancements
- Toast notification system for better user feedback
- Search result caching for improved performance
- Download queue management
- User preferences and history
- Advanced search filters and sorting options

