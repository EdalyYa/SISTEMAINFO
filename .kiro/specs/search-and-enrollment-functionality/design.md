# Design Document

## Overview

This design ensures the search functionality works correctly with the dynamic carousels and adds enrollment buttons to course cards. The implementation will maintain the existing carousel behavior while adding real-time search filtering and clear enrollment call-to-action buttons.

## Architecture

### Search Integration
- **Real-time filtering**: Search updates `cursosFiltrados` which flows through to carousel splits
- **Carousel reset**: Search changes reset both carousels to page 0
- **Dynamic pagination**: Carousel page counts update based on filtered results
- **Empty state handling**: Show appropriate messages when no results found

### Enrollment System
- **Button placement**: Add "Inscribirse" button alongside existing "Ver más" button
- **Action handling**: Create enrollment function with user feedback
- **Visual feedback**: Immediate response to enrollment clicks
- **Consistent styling**: Match existing button design patterns

## Components and Interfaces

### Search Enhancement
```javascript
// Enhanced search effect
useEffect(() => {
  // Reset carousel pages when search changes
  setCarousel1Page(0);
  setCarousel2Page(0);
}, [searchTerm]);

// Search result count
const searchResultCount = cursosFiltrados.length;
const hasSearchResults = searchTerm.length > 0;
```

### Enrollment System
```javascript
// Enrollment handler
const handleEnrollment = (curso) => {
  // Show enrollment confirmation
  alert(`¡Inscripción iniciada para: ${curso.nombre}!`);
  // Future: Could integrate with enrollment API
};
```

### Course Card Enhancement
```jsx
// Updated course card with enrollment button
<div className="course-card-actions">
  <button onClick={() => handleVerMas(curso)}>Ver más</button>
  <button onClick={() => handleEnrollment(curso)}>Inscribirse</button>
</div>
```

## Data Flow

### Search Flow
1. User types in search input
2. `searchTerm` state updates
3. `cursosFiltrados` recalculates automatically
4. `firstCarouselCourses` and `secondCarouselCourses` update
5. Carousel pages reset to 0
6. Carousel pagination recalculates
7. UI updates with filtered results

### Enrollment Flow
1. User clicks "Inscribirse" button
2. `handleEnrollment` function executes
3. Course information is captured
4. User feedback is displayed
5. Future: API call for actual enrollment

## User Interface Design

### Search Results Display
```jsx
// Search results indicator
{hasSearchResults && (
  <div className="search-results-info">
    {searchResultCount > 0 
      ? `${searchResultCount} cursos encontrados`
      : 'No se encontraron cursos'
    }
  </div>
)}
```

### Enhanced Course Card
```jsx
<div className="course-card">
  {/* Existing content */}
  
  <div className="course-actions">
    <button className="btn-secondary" onClick={() => handleVerMas(curso)}>
      Ver más
    </button>
    <button className="btn-primary" onClick={() => handleEnrollment(curso)}>
      Inscribirse
    </button>
  </div>
</div>
```

### Empty Search State
```jsx
{hasSearchResults && searchResultCount === 0 && (
  <div className="empty-search-state">
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3>No se encontraron cursos</h3>
      <p>Intenta con otros términos de búsqueda</p>
    </div>
  </div>
)}
```

## Error Handling

### Search Edge Cases
1. **Empty search results**: Show friendly "no results" message
2. **Very long search terms**: Handle gracefully without breaking layout
3. **Special characters**: Ensure search works with accents and special chars
4. **Rapid typing**: Debounce if needed for performance

### Enrollment Edge Cases
1. **Double clicks**: Prevent multiple enrollment attempts
2. **Network errors**: Handle gracefully with user feedback
3. **Invalid course data**: Validate course information before enrollment

## Testing Strategy

### Search Testing
1. **Basic search**: Test with common course names
2. **Partial matches**: Test with partial course names
3. **Case sensitivity**: Ensure case-insensitive search
4. **Special characters**: Test with accented characters
5. **Empty results**: Test with non-existent terms
6. **Clear search**: Test clearing search input

### Enrollment Testing
1. **Button visibility**: Ensure buttons appear on all course cards
2. **Click handling**: Test enrollment button clicks
3. **Visual feedback**: Verify user feedback appears
4. **Multiple clicks**: Test rapid clicking behavior
5. **Different courses**: Test enrollment with various course types

### Integration Testing
1. **Search + Carousels**: Verify search works with carousel navigation
2. **Search + Enrollment**: Test enrollment from search results
3. **Responsive behavior**: Test on different screen sizes
4. **Performance**: Ensure no lag during search or enrollment

## Implementation Notes

### Search Optimization
- The existing search logic should work correctly
- Need to ensure carousel pages reset on search changes
- Add search result count display
- Handle empty states gracefully

### Enrollment Implementation
- Start with simple alert feedback
- Design for future API integration
- Ensure consistent button styling
- Add hover effects for better UX

### Styling Considerations
- Match existing design system
- Ensure buttons don't overcrowd cards
- Maintain responsive design
- Use consistent color scheme

### Performance Considerations
- Search filtering is already efficient
- Enrollment actions should be lightweight
- No additional API calls initially
- Maintain smooth carousel transitions