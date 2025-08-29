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
│   ├── search-video/
│   │   └── page.tsx         # Direct video URL processing
│   ├── search-playlist/
│   │   └── page.tsx         # Playlist URL processing
│   ├── not-found.tsx        # Custom 404 page with MP3Ninja branding
│   └── api/
│       ├── search-name/
│       │   └── route.ts     # API endpoint for yt-dlp video search
│       ├── search-video/
│       │   └── route.ts     # API endpoint for single video processing
│       └── search-playlist/
│           └── route.ts     # API endpoint for playlist processing
├── components/
│   ├── Navbar.tsx           # Professional navigation with theme toggle
│   ├── Footer.tsx           # Comprehensive footer with links and social
│   └── HostingInfoModal.tsx # GitHub hosting instructions modal
├── utils/
│   └── localhost.ts         # Localhost detection utility
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

#### 2. Search by Video URL (`/search-video`)
- **Input**: Direct YouTube video URL with validation
- **Process**: Single video metadata extraction via yt-dlp
- **Results**: Detailed video information with thumbnail, metadata, description
- **UI**: Large card layout optimized for single video display

#### 3. Search by Playlist URL (`/search-playlist`)
- **Input**: YouTube playlist URL with validation
- **Process**: Extract all videos from playlist using yt-dlp
- **Results**: Grid of playlist videos with pagination (10 per page)
- **Display**: Simplified cards showing title, channel, duration (no view counts due to flat-playlist format)

#### 4. Custom 404 Page (`/not-found`)
- **Design**: Clean, viewport-optimized layout without logo
- **Features**: Navigation to all search pages, "Go Home" CTA
- **Branding**: Music-themed message maintaining MP3Ninja personality

### API Architecture

#### `/api/search-name` (POST)
- **Purpose**: YouTube video search via yt-dlp
- **Input**: `{ searchTerm: string }`
- **Process**: 
  - Uses `ytsearch50:term` with `--flat-playlist` for performance
  - Spawns yt-dlp child process with 60s timeout
  - Parses JSON output line by line
- **Output**: Array of VideoResult objects (50 results)
- **Error Handling**: Process failures, parsing errors, timeouts

#### `/api/search-video` (POST)
- **Purpose**: Single video metadata extraction
- **Input**: `{ videoUrl: string }` with YouTube URL validation
- **Process**: 
  - Direct video processing without flat-playlist
  - 30s timeout for single video processing
- **Output**: Single VideoResult object with full metadata
- **Features**: Complete video information including views and description

#### `/api/search-playlist` (POST)
- **Purpose**: Playlist video extraction
- **Input**: `{ playlistUrl: string }` with playlist URL validation
- **Process**: 
  - Uses `--flat-playlist` for performance optimization
  - 90s timeout for large playlist processing
- **Output**: Array of VideoResult objects from playlist
- **Limitations**: View counts not available in flat-playlist format

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

#### HostingInfoModal Component
- **Purpose**: Educates users about localhost-only functionality
- **Trigger**: Automatically shown when search is attempted on non-localhost
- **Content**: Step-by-step GitHub setup instructions with code blocks
- **Features**: GitHub repository link, comprehensive setup guide, professional design
- **Responsive**: Works on all screen sizes with backdrop blur and proper spacing
- **Theme Integration**: Fully themed with CSS variables for light/dark modes

### Search Page Architecture

#### Search-Name Page
- **Search Form**: Text input with validation and loading states
- **Results Display**: Responsive grid layout (1-4 columns based on screen size)
- **Video Cards**: Thumbnail, title, channel, views, duration overlay
- **Pagination**: Client-side pagination (10 results per page) with numbered buttons
- **Dual Actions**: "Watch on YouTube" and "Add to Library" buttons
- **Error Handling**: User-friendly error messages and empty states
- **Loading States**: Spinners during API calls
- **Responsive Design**: Mobile-first with breakpoints at 640px, 768px, 1024px

#### Search-Video Page
- **URL Input**: YouTube URL validation with regex pattern matching
- **Single Video Display**: Large card layout optimized for detailed view
- **Metadata**: Channel, views, upload date, duration prominently displayed
- **Description**: Expandable description section with truncation
- **Action Buttons**: Prominent "Watch on YouTube" and "Add to Library" CTAs
- **Error Handling**: URL validation errors and video processing failures
- **Responsive Layout**: Grid layout that adapts to screen size

#### Search-Playlist Page
- **Playlist URL Input**: YouTube playlist URL validation
- **Grid Display**: Same responsive grid as search-name (1-4 columns)
- **Simplified Cards**: Title, channel, duration (no view counts)
- **Pagination**: Client-side pagination for large playlists
- **Batch Processing**: Handles playlists with many videos efficiently
- **Error Handling**: Playlist URL validation and processing errors
- **Performance**: Optimized with flat-playlist format for speed

### Font Configuration

Uses Geist font family from Google Fonts:
- `--font-geist-sans` for sans-serif text
- `--font-geist-mono` for monospace text
- Loaded in `layout.tsx` and available as CSS variables
- Applied to body element with fallbacks

### Utility Functions

#### Localhost Detection (`src/utils/localhost.ts`)
- **Purpose**: Determines if application is running in local development environment
- **Detection Methods**: Checks for localhost, 127.0.0.1, local network IPs, .local domains
- **Integration**: Used across all search pages to prevent API calls on production
- **Server-Side Safe**: Returns false during server-side rendering
- **Network Support**: Detects local network addresses (192.168.x.x, 10.x.x.x, 172.16.x.x)

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
- **Localhost Detection**: Application checks for localhost and shows hosting modal when not local

#### Hosting Limitations
- **Serverless Incompatibility**: yt-dlp cannot run on Vercel, Netlify, or similar platforms
- **System Dependencies**: Requires Python and system-level binary execution
- **Local Development**: Full functionality only available when running locally
- **Production Guidance**: Hosting modal provides GitHub setup instructions

### Documentation References

- **Theme Implementation**: `docs/theme-implementation.md` - Comprehensive theme system guide
- **API Documentation**: Generated from TypeScript interfaces
- **Component Documentation**: In-code comments and prop types

### Development Notes

#### Important Considerations
- **yt-dlp Dependency**: Critical external dependency for core functionality
- **Process Timeouts**: Variable timeouts (30s for single video, 60s for search, 90s for playlists)
- **Error Recovery**: Graceful handling of yt-dlp failures with user-friendly messages
- **Localhost Detection**: Automatic detection prevents API calls on production
- **Hosting Modal**: Comprehensive GitHub setup instructions for local development
- **Rate Limiting**: Consider implementing for production use
- **Caching**: Consider caching search results for better performance

#### Current Implementation Status
- ✅ **Homepage**: Complete with SaaS-level design and responsive layout
- ✅ **Navigation**: Professional navbar with theme toggle, responsive mobile menu with hamburger
- ✅ **Footer**: Comprehensive footer with social links and responsive breakpoints
- ✅ **Theme System**: Complete light/dark theme implementation with mobile accessibility
- ✅ **Search by Name**: Fully functional with modern card-based layout and pagination (50 results)
- ✅ **Search Interface**: Responsive forms with mobile-first design and full-width buttons
- ✅ **Video Cards**: YouTube-like cards with thumbnails, metadata, and dual action buttons
- ✅ **yt-dlp Integration**: Optimized API with flat-playlist format and proper error handling
- ✅ **Image Configuration**: YouTube thumbnail support with wildcard domain patterns
- ✅ **Responsive Design**: Mobile-optimized layouts with proper breakpoints (640px, 768px, 1024px)
- ✅ **Performance Optimization**: Card hover effects, pagination, and optimized search queries
- ✅ **Footer Responsive Layout**: Mobile-centered to desktop-aligned with proper breakpoint transitions
- ✅ **Mobile Navigation**: Theme toggle accessibility and responsive hamburger menu
- ✅ **Card-Based Interface**: Modern YouTube-like video cards with optimized visual hierarchy
- ✅ **Dual Action Buttons**: Watch on YouTube and Add to Library with strategic positioning
- ✅ **Search by Video URL**: Complete with single video processing and detailed display
- ✅ **Search by Playlist URL**: Complete with playlist processing and grid display
- ✅ **Custom 404 Page**: Clean, viewport-optimized design with navigation options
- ✅ **Localhost Detection**: Automatic detection with hosting modal for production
- ✅ **GitHub Integration**: Comprehensive setup instructions with repository link
- ✅ **API Routes**: All three search endpoints with optimized yt-dlp integration
- ✅ **URL Validation**: Regex-based validation for video and playlist URLs
- ✅ **Error Handling**: User-friendly error messages across all search types
- ✅ **Build Optimization**: All pages pass Next.js build with no errors
- 🚧 **Toast Notifications**: Planned for better UX feedback
- 🚧 **Download Functionality**: Future enhancement for actual video downloads

#### Future Enhancements
- Toast notification system for better user feedback
- Search result caching for improved performance
- Download queue management with progress tracking
- User preferences and search history
- Advanced search filters and sorting options
- Video download functionality (audio/video formats)
- Batch operations for playlist videos
- Integration with external storage services

