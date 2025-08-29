# MP3Ninja 🎵

A modern YouTube video search and download application built with **Next.js 15**. Search YouTube content by video name, direct video URL, or playlist URL with a professional SaaS-level UI/UX.

![MP3Ninja](https://img.shields.io/badge/MP3Ninja-YouTube%20Search-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔍 Three Search Methods
- **Search by Name** - Find videos using keywords or titles (50 results with pagination)
- **Search by Video URL** - Get detailed information from direct YouTube video URLs
- **Search by Playlist URL** - Extract all videos from YouTube playlists

### 🎨 Modern UI/UX
- **SaaS-level Design** - Professional, responsive interface
- **Light/Dark Themes** - Complete theme system with CSS variables
- **Mobile-First** - Fully responsive design (640px, 768px, 1024px breakpoints)
- **YouTube-like Cards** - Thumbnails, metadata, and action buttons
- **Smart Pagination** - Client-side pagination with numbered navigation

### 🛠️ Technical Features
- **yt-dlp Integration** - Powerful YouTube video processing
- **Localhost Detection** - Automatic environment detection
- **GitHub Integration** - Comprehensive setup instructions modal
- **Custom 404 Page** - Branded error page with navigation
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS v4** - Modern CSS framework with variables

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.7+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Musyonchez/yt.git
   cd yt
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install yt-dlp**
   ```bash
   pip install yt-dlp
   ```

4. **Install Node.js dependencies**
   ```bash
   npm install
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see MP3Ninja in action!

## 📖 Usage

### Search by Name
1. Go to `/search-name` or click "Search by Name" in the navigation
2. Enter video keywords or titles
3. Browse through paginated results (10 videos per page)
4. Click "Watch on YouTube" or "Add to Library"

### Search by Video URL
1. Go to `/search-video` or click "Video Search" in the navigation
2. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=...`)
3. View detailed video information including description
4. Access video metadata, thumbnails, and direct YouTube link

### Search by Playlist URL
1. Go to `/search-playlist` or click "Playlist Search" in the navigation  
2. Paste a YouTube playlist URL (e.g., `https://www.youtube.com/playlist?list=...`)
3. Browse all playlist videos with pagination
4. Each video shows title, channel, and duration

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Navbar/Footer
│   ├── page.tsx                # Homepage with hero and features
│   ├── globals.css             # Global styles and theme system
│   ├── not-found.tsx           # Custom 404 page
│   ├── search-name/            # Search by keywords
│   ├── search-video/           # Search by video URL
│   ├── search-playlist/        # Search by playlist URL
│   └── api/                    # API routes for yt-dlp integration
├── components/
│   ├── Navbar.tsx              # Navigation with theme toggle
│   ├── Footer.tsx              # Footer with links and social
│   └── HostingInfoModal.tsx    # GitHub setup instructions
├── hooks/
│   └── useTheme.ts             # Theme management hook
└── utils/
    └── localhost.ts            # Localhost detection utility
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment

The application automatically detects if you're running locally. When not on localhost, it shows a setup modal instead of making API calls.

**Supported local environments:**
- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- Local network IPs (`192.168.x.x`, `10.x.x.x`, `172.16.x.x`)
- `.local` domains

## ⚠️ Important Notes

### Hosting Limitations

**MP3Ninja cannot be deployed to serverless platforms** like Vercel, Netlify, or Heroku because:

- **yt-dlp requires system-level Python dependencies**
- **Binary execution permissions** not available on serverless
- **Process spawning** not supported in serverless environments

### Local Development Only

For full functionality, MP3Ninja must be run locally with:
- Python virtual environment with yt-dlp installed
- Node.js development server
- System PATH access for yt-dlp binary

## 🎨 Theme System

MP3Ninja features a comprehensive light/dark theme system:

- **CSS Variables** - Semantic color tokens (`--primary`, `--background`, etc.)
- **localStorage Persistence** - Remembers user preference
- **System Detection** - Automatically detects OS theme preference  
- **Theme Toggle** - Easy switching in navigation bar
- **Component Integration** - All components fully themed

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Breakpoints** - 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Grid Layouts** - 1-4 columns based on screen size
- **Touch-Friendly** - Optimized buttons and interactions
- **Accessibility** - Proper ARIA attributes and keyboard navigation

## 🔌 API Integration

### yt-dlp Integration

MP3Ninja uses `yt-dlp` via Node.js child processes:

- **Search**: `yt-dlp "ytsearch50:term" --dump-json --flat-playlist`
- **Video**: `yt-dlp [URL] --dump-json --skip-download`
- **Playlist**: `yt-dlp [URL] --dump-json --flat-playlist --skip-download`

### Error Handling

- **Process Failures** - Graceful error messages
- **Timeouts** - 30s-90s depending on operation
- **Validation** - URL and input validation
- **User Feedback** - Clear error states and loading indicators

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - Powerful YouTube video processing
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vercel](https://vercel.com/)** - Deployment platform and font (Geist)

## 📞 Support

If you encounter any issues or have questions:

1. Check the **GitHub Issues** for existing solutions
2. Create a **New Issue** with detailed description
3. Join our **Discussions** for community support

---

**Made with ❤️ by Musyonchez**

[⭐ Star this repo](https://github.com/Musyonchez/yt) if you find it useful!