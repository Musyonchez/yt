# Theme System Implementation Guide

This document explains how the light/dark theme switching system works in this Next.js application using CSS variables and a custom hook.

## Overview

The theme system uses:
- CSS custom properties (CSS variables) for colors
- A React hook (`useTheme`) for state management
- CSS class toggling on the document root
- Tailwind CSS v4 for styling framework

## Architecture

### 1. CSS Variables System

The theme system is built around CSS custom properties defined in `src/app/globals.css`:

```css
/* Light theme (default) */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #3b82f6;
}

/* Dark theme */
:root.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card: #1e293b;
  --card-foreground: #f8fafc;
  --primary: #60a5fa;
  --primary-foreground: #0f172a;
  --secondary: #334155;
  --secondary-foreground: #f8fafc;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #334155;
  --accent-foreground: #f8fafc;
  --destructive: #ef4444;
  --destructive-foreground: #f8fafc;
  --border: #334155;
  --input: #334155;
  --ring: #60a5fa;
}
```

### 2. Tailwind CSS v4 Integration

The CSS variables are exposed to Tailwind through the `@theme` directive:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... additional color mappings */
}
```

This allows both direct CSS variable usage and Tailwind classes to work together.

### 3. Theme Hook

The `useTheme` hook (`src/hooks/useTheme.ts`) manages theme state:

```typescript
'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    updateDocumentClass(initialTheme);
  }, []);

  const updateDocumentClass = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateDocumentClass(newTheme);
  };

  return { theme, toggleTheme };
}
```

**Key Features:**
- Persists theme preference in `localStorage`
- Respects system preference (`prefers-color-scheme`)
- Toggles CSS classes on document root
- Provides current theme state and toggle function

## Implementation in Components

### Method 1: Direct CSS Variables (Recommended)

Use CSS variables directly in inline styles for maximum control:

```tsx
// Example from Navbar component
<nav style={{ 
  backgroundColor: 'var(--card)', 
  borderBottomWidth: '1px', 
  borderBottomColor: 'var(--border)'
}}>
  <h1 style={{ color: 'var(--primary)' }}>
    MyApp
  </h1>
  <button 
    style={{ color: 'var(--muted-foreground)' }}
    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
  >
    Contact
  </button>
</nav>
```

### Method 2: Tailwind Classes (Alternative)

Since CSS variables are mapped to Tailwind, you can also use classes:

```tsx
<div className="bg-card text-card-foreground border-border">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>
```

## Color Token System

### Semantic Color Tokens

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|--------|
| `--background` | #ffffff | #0f172a | Main page background |
| `--foreground` | #171717 | #f8fafc | Main text color |
| `--card` | #ffffff | #1e293b | Card backgrounds |
| `--card-foreground` | #0f172a | #f8fafc | Text on cards |
| `--primary` | #3b82f6 | #60a5fa | Primary actions, links |
| `--primary-foreground` | #ffffff | #0f172a | Text on primary elements |
| `--muted` | #f8fafc | #1e293b | Muted backgrounds |
| `--muted-foreground` | #64748b | #94a3b8 | Secondary text |
| `--border` | #e2e8f0 | #334155 | Borders, dividers |
| `--input` | #e2e8f0 | #334155 | Form input backgrounds |

## Adding Theme Support to New Components

### Step 1: Use Semantic Tokens

Always use semantic color tokens instead of hardcoded colors:

```tsx
// ❌ Don't do this
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">

// ✅ Do this instead
<div style={{ 
  backgroundColor: 'var(--card)', 
  color: 'var(--card-foreground)' 
}}>
```

### Step 2: Handle Interactive States

For hover/focus states, use JavaScript event handlers:

```tsx
<button
  style={{ color: 'var(--muted-foreground)' }}
  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
>
  Hover me
</button>
```

### Step 3: Add Transitions

Include smooth transitions for better UX:

```tsx
<div 
  className="transition-colors duration-200"
  style={{ backgroundColor: 'var(--card)' }}
>
  Content
</div>
```

## Theme Toggle Implementation

### Basic Toggle Button

```tsx
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Advanced Toggle with Icons

```tsx
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md transition-colors"
      style={{ 
        color: 'var(--muted-foreground)'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
```

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Theme CSS variables
│   ├── layout.tsx           # Root layout with SearchProvider
│   └── page.tsx             # Home page with theme-aware styles
├── components/
│   ├── Navbar.tsx           # Navigation with theme toggle
│   └── Footer.tsx           # Footer with theme-aware styles
├── contexts/
│   └── SearchContext.tsx    # Search state management
└── hooks/
    └── useTheme.ts          # Theme hook
```

## Best Practices

### 1. Semantic Naming
Use semantic color names that describe purpose, not appearance:
- ✅ `--primary`, `--muted-foreground`
- ❌ `--blue-500`, `--gray-400`

### 2. Consistent Patterns
Always follow the same pattern for theme-aware components:
1. Use CSS variables for colors
2. Add smooth transitions
3. Handle interactive states with JavaScript
4. Test both light and dark modes

### 3. Accessibility
- Ensure sufficient contrast in both themes
- Respect user's system preference
- Provide clear visual feedback for theme toggle

### 4. Performance
- CSS variables are more performant than CSS-in-JS
- Avoid inline calculations
- Use transitions sparingly on large elements

## Troubleshooting

### Common Issues

1. **Theme not switching**: Check if `dark` class is being added to `:root`
2. **Colors not updating**: Ensure CSS variables are defined in both `:root` and `:root.dark`
3. **Build errors**: Make sure Tailwind config includes all necessary files
4. **Flash of unstyled content**: Initialize theme before component renders

### Debugging Tips

```javascript
// Check current theme class
console.log(document.documentElement.classList);

// Check CSS variable values
console.log(getComputedStyle(document.documentElement).getPropertyValue('--background'));

// Check localStorage
console.log(localStorage.getItem('theme'));
```

## Extending the Theme System

### Adding New Colors

1. Define in CSS variables:
```css
:root {
  --success: #22c55e;
  --success-foreground: #ffffff;
}

:root.dark {
  --success: #16a34a;
  --success-foreground: #ffffff;
}
```

2. Add to Tailwind theme:
```css
@theme {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

3. Use in components:
```tsx
<div style={{ backgroundColor: 'var(--success)' }}>
  Success message
</div>
```

## Migration Guide

### From Tailwind dark: Classes

**Before:**
```tsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
```

**After:**
```tsx
<div style={{ 
  backgroundColor: 'var(--card)', 
  color: 'var(--card-foreground)' 
}}>
```

### From CSS-in-JS Solutions

**Before:**
```tsx
const theme = useTheme();
<div style={{ 
  backgroundColor: theme.colors.background,
  color: theme.colors.foreground 
}}>
```

**After:**
```tsx
<div style={{ 
  backgroundColor: 'var(--background)', 
  color: 'var(--foreground)' 
}}>
```

This approach provides better performance and simpler maintenance while maintaining full theme functionality.