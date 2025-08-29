# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is MP3Ninja, a Next.js 15 project with App Router using TypeScript and Tailwind CSS v4. MP3Ninja allows users to search and download YouTube videos by name, video URL, or playlist URL.

### Key Technologies

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** with new `@import "tailwindcss"` syntax
- **PostCSS** with `@tailwindcss/postcss` plugin

### Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with font configuration
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles and Tailwind imports
├── components/
│   ├── Navbar.tsx       # Navigation with MP3Ninja logo and theme toggle
│   └── Footer.tsx       # Footer component
├── hooks/
│   └── useTheme.ts      # Theme management hook
public/
├── logo-black.png       # MP3Ninja logo for light theme
└── logo-white.png       # MP3Ninja logo for dark theme
docs/                    # Project documentation and original logos
```

### Styling System

This project uses Tailwind CSS v4's new configuration approach:

1. **CSS Import**: Uses `@import "tailwindcss"` in `globals.css`
2. **Theme Configuration**: Inline theme configuration with `@theme` directive
3. **PostCSS**: Configured with `@tailwindcss/postcss` plugin
4. **CSS Variables**: Basic CSS custom properties for theming

### Theme System Reference

- CSS custom properties with semantic tokens
- React hook (`useTheme`) for theme state management
- CSS class toggling on document root (`:root.dark`)
- Component integration patterns

See `docs/theme-implementation.md` for detailed implementation guide.

### Font Configuration

Uses Geist font family from Google Fonts:

- `--font-geist-sans` for sans-serif text
- `--font-geist-mono` for monospace text

Both fonts are loaded in `layout.tsx` and available as CSS variables.

### Development Notes

- This is a fresh Next.js installation in the root directory
- Uses Tailwind v4 syntax - avoid traditional `tailwind.config.js` files
- Theme variables are defined directly in `globals.css` using the `@theme` directive

