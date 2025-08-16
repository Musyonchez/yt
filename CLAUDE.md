# MP3 Ninja - Claude Development Guidelines

## Project Overview
MP3 Ninja - A professional SaaS-grade YouTube MP3 download platform with social features. Multi-user, cloud-based application with Google authentication, friend system, and music discovery features.

## Brand Identity & Design Standards

### Visual Identity
- **Logo**: Black and white MP3 Ninja logo with masked ninja face
- **Logo Placement**: Located in `src/app` directory (logo.png, logo.svg)
- **Brand Colors**: Professional black/white/gray palette with accent colors
- **Typography**: Clean, modern sans-serif fonts (Inter, Roboto, or system fonts)

### SaaS Product Design Requirements
- **Professional Appearance**: Must look like a premium SaaS product (think Spotify, Discord, Notion)
- **Clean Interface**: Minimal, spacious layouts with generous whitespace
- **Consistent Branding**: MP3 Ninja logo and ninja theme throughout
- **Modern UI Patterns**: Card-based layouts, smooth transitions, hover effects
- **Mobile-First**: Responsive design that works flawlessly on all devices

## Code Quality Standards

### 1. Professional Development Practices
- **Code like a senior development team**: Write clean, maintainable, scalable code
- **Follow TypeScript best practices**: Strict type checking, proper interfaces
- **Component Architecture**: Reusable, well-documented React components
- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages
- **Performance**: Optimize for speed - lazy loading, efficient queries, caching
- **Security**: Input validation, sanitization, proper authentication

### 2. SaaS-Grade User Experience
- **Loading States**: Professional skeleton screens, spinners, progress bars
- **Error Feedback**: Clear, actionable error messages with recovery options
- **Success Feedback**: Satisfying confirmations and completion states
- **Empty States**: Engaging empty states with clear calls to action
- **Onboarding**: Smooth user onboarding flow for new users
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 3. Frontend Standards (Next.js + TypeScript + Tailwind)
- **Component Structure**: Organized, reusable components with proper props
- **State Management**: Clean state handling with React hooks
- **API Integration**: Proper error handling for all API calls
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Performance**: Code splitting, lazy loading, optimized images
- **SEO**: Proper meta tags, structured data, semantic HTML

### 4. Backend Standards (Supabase + API Routes)
- **Database Design**: Normalized schema with proper relationships and indexes
- **API Security**: Authentication, authorization, input validation
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Performance**: Optimized queries, caching strategies, pagination
- **Scalability**: Design for growth - efficient data structures and algorithms
- **Real-time**: Proper WebSocket handling for download progress

## UI/UX Design Philosophy

### 1. SaaS Product Standards
- **Visual Hierarchy**: Clear information architecture with proper heading levels
- **Color System**: Consistent color palette with semantic meanings
- **Spacing**: Systematic spacing using Tailwind's spacing scale
- **Typography**: Readable font sizes, proper line heights, consistent weights
- **Shadows & Depth**: Subtle shadows for card elevation and depth perception
- **Animations**: Smooth, purposeful animations that enhance UX

### 2. MP3 Ninja Brand Integration
- **Ninja Theme**: Subtle ninja-themed elements (fast, stealthy, efficient)
- **Professional Tone**: Serious, capable, trustworthy - not playful or casual
- **Dark Mode Ready**: Prepare for dark theme (ninja aesthetic)
- **Logo Integration**: Prominent but tasteful logo placement
- **Brand Consistency**: Consistent voice and visual elements

### 3. Component Design Standards
- **Cards**: Consistent card styles for songs, users, playlists
- **Buttons**: Clear hierarchy (primary, secondary, destructive actions)
- **Forms**: Professional form styling with proper validation states
- **Navigation**: Intuitive navigation with clear active states
- **Icons**: Consistent icon style (outline or filled, not mixed)
- **Imagery**: Proper image optimization and fallback states

### 4. Page Layout Standards
- **Landing Page**: Hero section with MP3 Ninja branding and clear value proposition
- **User Dashboard**: Personal download history with pagination, search, and filters
- **Admin Dashboard**: User management interface with ban/unban capabilities
- **Search**: Powerful search with filters, sorting, and clear results
- **Library**: Organized personal collection with easy browsing
- **Friends**: Social features that feel natural, not forced
- **Profile**: Professional user profiles with privacy controls

## Technical Requirements

### 1. Performance Standards
- **Loading Speed**: Pages load in under 2 seconds
- **Time to Interactive**: Under 3 seconds on 3G networks
- **Core Web Vitals**: Excellent scores for LCP, FID, and CLS
- **Bundle Size**: Optimized JavaScript bundles under 250KB
- **Image Optimization**: WebP format, proper sizing, lazy loading
- **Caching**: Aggressive caching of static assets and API responses

### 2. Security & Privacy
- **Authentication**: Secure Google OAuth implementation
- **Data Protection**: Proper data encryption and secure storage
- **Privacy Controls**: User control over data sharing and visibility
- **HTTPS**: All communications over secure connections
- **Input Validation**: Server-side validation for all user inputs
- **Rate Limiting**: Prevent abuse with proper rate limiting

### 3. Scalability Considerations
- **Database Performance**: Proper indexing and query optimization
- **API Design**: RESTful APIs with proper pagination
- **Caching Strategy**: Multi-layer caching (browser, CDN, database)
- **Error Recovery**: Graceful degradation and retry mechanisms
- **Monitoring**: Proper logging and error tracking
- **Resource Management**: Efficient memory and CPU usage

## Development Workflow

### 1. Component Development
- **Storybook Integration**: Document components with Storybook
- **Testing**: Unit tests for critical components
- **TypeScript**: Strict typing for all components and props
- **Documentation**: Clear JSDoc comments for complex logic
- **Naming**: Descriptive, consistent naming conventions
- **File Organization**: Logical folder structure and file naming

### 2. Feature Implementation
- **Design First**: Create mockups/wireframes before coding
- **Progressive Enhancement**: Basic functionality first, enhancements after
- **Mobile Testing**: Test on actual devices, not just browser dev tools
- **Cross-browser**: Test on Chrome, Safari, Firefox, Edge
- **Performance Testing**: Monitor bundle size and loading times
- **User Testing**: Get feedback on usability and flow

### 3. Dashboard & Admin Implementation
- **User Dashboard**: Paginated download history with search and date filtering
- **Admin Panel**: Secure admin-only access with user management capabilities
- **Data Tables**: Professional table designs with sorting and filtering
- **Action Modals**: Confirmation dialogs for destructive actions (ban/delete)
- **Audit Logging**: Track all admin actions for accountability
- **Role-based Access**: Proper authentication guards for admin routes

### 4. Quality Assurance
- **Code Review**: Self-review before committing
- **Accessibility**: Test with screen readers and keyboard navigation
- **Performance**: Lighthouse audits for every major feature
- **Security**: Review for common vulnerabilities
- **Browser Testing**: Cross-browser compatibility testing
- **Mobile Testing**: Responsive design on various screen sizes

## Success Metrics

### 1. User Experience
- **User Satisfaction**: High user retention and engagement
- **Conversion Rate**: Search-to-download conversion above 15%
- **Load Times**: Average page load under 2 seconds
- **Error Rate**: Less than 1% of user actions result in errors
- **Mobile Usage**: Smooth experience on mobile devices
- **Accessibility**: WCAG 2.1 AA compliance

### 2. Technical Performance
- **Uptime**: 99.9% uptime for core functionality
- **API Response**: Average API response time under 200ms
- **Download Success**: 95%+ successful download completion rate
- **Search Performance**: Search results in under 500ms
- **Database Performance**: Optimized queries under 100ms
- **Security**: Zero security incidents or data breaches

### 3. Business Metrics
- **User Growth**: Steady increase in registered users
- **Engagement**: High daily and monthly active user rates
- **Feature Adoption**: Users engaging with social features
- **Platform Reliability**: Consistent service delivery
- **Brand Recognition**: Professional, trustworthy image
- **Competitive Position**: Feature parity with premium services

## Communication & Feedback

### 1. Development Updates
- **Progress Reports**: Regular updates on feature development
- **Technical Decisions**: Clear reasoning for architectural choices
- **Performance Reports**: Metrics and optimization results
- **Issue Resolution**: Quick identification and resolution of problems
- **User Feedback**: Integration of user suggestions and bug reports

### 2. Quality Standards
- **Code Documentation**: Clear, comprehensive code comments
- **Feature Documentation**: User-facing feature explanations
- **API Documentation**: Complete API endpoint documentation
- **Design System**: Documented component library and design patterns
- **Best Practices**: Adherence to established coding standards

Remember: MP3 Ninja should feel like a premium, professional SaaS product that users would trust with their music discovery and management. Every interaction should reinforce the brand's reliability, speed, and sophistication - true to the ninja ethos of being fast, efficient, and precise.