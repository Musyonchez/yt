# Claude Development Guidelines

## Project Overview
YouTube Audio Download Manager - A professional-grade Flask web application for downloading YouTube audio with modern UI/UX standards.

## Code Quality Standards

### 1. Professional Development Practices
- **Code like a senior development team**: Write clean, maintainable, scalable code
- **Follow Python PEP 8**: Consistent formatting, naming conventions, documentation
- **Use type hints**: All functions should have proper type annotations
- **Error handling**: Comprehensive try-catch blocks with meaningful error messages
- **Logging**: Implement proper logging throughout the application
- **Code comments**: Document complex logic, API interactions, and business rules

### 2. User Experience Excellence
- **Responsive design**: Mobile-first approach using Tailwind CSS
- **Loading states**: Show spinners, progress bars, skeleton screens
- **Error feedback**: User-friendly error messages with recovery suggestions
- **Performance**: Optimize for speed - lazy loading, caching, efficient queries
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Professional UI**: Clean, modern interface with consistent spacing and typography

### 3. Frontend Standards
- **Tailwind CSS**: Use utility classes for consistent styling
- **JavaScript**: Modern ES6+ syntax, async/await, proper error handling
- **Progressive enhancement**: Ensure basic functionality without JavaScript
- **Component architecture**: Reusable UI components and functions
- **Performance optimization**: Minimize HTTP requests, optimize images, lazy load content

### 4. Backend Standards
- **Flask best practices**: Use blueprints, proper project structure, configuration management
- **Database/JSON operations**: Thread-safe operations, proper file locking
- **API design**: RESTful endpoints with consistent response formats
- **Security**: Input validation, sanitization, proper error responses
- **Concurrent processing**: Efficient thread management for downloads
- **Resource management**: Proper cleanup of files, connections, threads

### 5. Testing and Validation
- **Input validation**: Validate all user inputs, URLs, file operations
- **Edge case handling**: Empty results, network failures, invalid URLs
- **Performance testing**: Ensure smooth operation under load
- **Cross-browser compatibility**: Test on major browsers
- **Mobile responsiveness**: Test on various screen sizes

## Development Workflow

### 1. Regular Commits
- **Commit frequently**: After each feature, bug fix, or significant change
- **Descriptive messages**: Clear, concise commit messages explaining changes
- **Atomic commits**: Each commit should represent a single logical change
- **Branch strategy**: Use feature branches for major changes

### 2. Code Review Standards
- **Self-review**: Review your own code before committing
- **Documentation updates**: Update README, comments, and docs with changes
- **Testing**: Verify functionality works as expected before committing

### 3. File Organization
- **Clean structure**: Maintain organized directory structure
- **Naming conventions**: Use clear, descriptive file and function names
- **No dead code**: Remove unused imports, functions, or files
- **Consistent formatting**: Use proper indentation and spacing

## Technical Requirements

### 1. Dependencies Management
- **requirements.txt**: Keep updated with exact versions
- **Virtual environment**: Always use isolated Python environment
- **Minimal dependencies**: Only include necessary packages

### 2. Configuration
- **Environment variables**: Use for sensitive data and configuration
- **Config files**: Separate development and production settings
- **Default values**: Provide sensible defaults for all configurations

### 3. Error Handling
- **Graceful degradation**: Application should handle failures gracefully
- **User feedback**: Provide clear feedback for all error states
- **Logging**: Log errors for debugging while showing user-friendly messages
- **Recovery mechanisms**: Provide ways to recover from errors

### 4. Performance Optimization
- **Caching**: Implement appropriate caching strategies
- **Lazy loading**: Load content progressively to improve perceived performance
- **Resource optimization**: Minimize file sizes, optimize images
- **Database efficiency**: Efficient JSON operations and file handling

## UI/UX Guidelines

### 1. Design Principles
- **Consistency**: Consistent spacing, colors, typography throughout
- **Hierarchy**: Clear visual hierarchy with proper heading levels
- **Whitespace**: Generous use of whitespace for better readability
- **Color scheme**: Professional color palette with good contrast ratios

### 2. Interactive Elements
- **Hover states**: Clear hover effects for interactive elements
- **Focus states**: Visible focus indicators for keyboard navigation
- **Disabled states**: Clear visual indication of disabled elements
- **Loading states**: Show progress during long operations

### 3. Content Strategy
- **Clear labels**: Descriptive labels and button text
- **Help text**: Provide context and instructions where needed
- **Empty states**: Design meaningful empty states with calls to action
- **Error states**: Helpful error messages with next steps

## Communication Protocol

### 1. Ask Questions When:
- **Unclear requirements**: Any ambiguity in functionality or design
- **Technical decisions**: When multiple approaches are possible
- **User experience**: When UX patterns or flows are unclear
- **Performance trade-offs**: When optimization choices need clarification
- **Security considerations**: When handling sensitive operations

### 2. Provide Updates:
- **Progress reports**: Regular updates on development progress
- **Blockers**: Immediate notification of any blocking issues
- **Suggestions**: Proactive suggestions for improvements
- **Alternatives**: Present multiple solutions when applicable

### 3. Documentation:
- **Code comments**: Explain complex algorithms and business logic
- **API documentation**: Document all endpoints and their usage
- **Setup instructions**: Clear instructions for local development
- **Deployment notes**: Document deployment requirements and steps

## Quality Checklist

Before each commit, verify:
- [ ] Code follows PEP 8 standards
- [ ] All functions have type hints and docstrings
- [ ] Error handling is comprehensive
- [ ] UI is responsive and accessible
- [ ] Loading states are implemented
- [ ] User feedback is clear and helpful
- [ ] Performance is optimized
- [ ] Security best practices are followed
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated

## Success Metrics

### 1. Code Quality
- Clean, readable code that other developers can easily understand
- Proper separation of concerns and modular architecture
- Comprehensive error handling and logging
- Following Python and web development best practices

### 2. User Experience
- Fast, responsive interface
- Intuitive navigation and workflow
- Clear feedback for all user actions
- Professional, polished appearance
- Accessible to users with disabilities

### 3. Reliability
- Stable operation under normal and edge conditions
- Graceful handling of network issues and failures
- Consistent performance across different devices and browsers
- Proper resource management and cleanup

Remember: The goal is to create a professional-quality application that users will enjoy using and developers will respect. Every line of code and every UI element should reflect the standards of a senior development team.