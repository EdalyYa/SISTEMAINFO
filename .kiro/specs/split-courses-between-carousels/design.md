# Design Document

## Overview

This design outlines the modification of the course display logic in the CursosLibres component to split courses between two carousels. Instead of both carousels showing all courses, the first carousel will display the first 31 courses and the second carousel will display the remaining courses. This creates a more organized distribution and reduces redundancy while maintaining all existing functionality.

## Architecture

The current component architecture includes:
- Two identical carousels showing all `cursosVisibles`
- Both carousels use the same data source
- Search filtering affects both carousels equally

The new architecture will:
- Split `cursosVisibles` into two separate arrays
- First carousel shows courses 0-30 (first 31 courses)
- Second carousel shows courses 31+ (remaining courses)
- Maintain search functionality across both splits
- Handle edge cases when there are fewer courses

## Components and Interfaces

### Data Splitting Logic
```javascript
// Split courses into two groups
const firstCarouselCourses = cursosVisibles.slice(0, 31);
const secondCarouselCourses = cursosVisibles.slice(31);
```

### Carousel Display Logic
- **First Carousel**: Always shows `firstCarouselCourses`
- **Second Carousel**: Shows `secondCarouselCourses` if it has content, otherwise hidden/empty state

### Course Count Updates
- First carousel count: `firstCarouselCourses.length`
- Second carousel count: `secondCarouselCourses.length`
- Total available: `cursosVisibles.length`

### Search Integration
- Search filtering happens before the split
- `cursosFiltrados` gets split into two arrays after filtering
- Both carousels update dynamically based on search results

## Data Models

### Course Arrays (New)
```javascript
// Derived from existing cursosVisibles
const firstCarouselCourses = cursosVisibles.slice(0, 31);
const secondCarouselCourses = cursosVisibles.slice(31);
```

### Existing Data (Unchanged)
- `cursosLibres` - Original course data
- `cursosFiltrados` - Filtered by search
- `cursosVisibles` - Paginated results (now gets split)

## Error Handling

### Edge Cases
1. **Less than 32 courses total**: Second carousel shows empty state or is hidden
2. **Search results less than 32**: Only first carousel shows results
3. **No search results**: Both carousels show appropriate empty states
4. **Exactly 31 courses**: Second carousel is empty

### Mitigation Strategies
1. Conditional rendering for second carousel when empty
2. Appropriate empty state messages
3. Dynamic course count updates
4. Graceful handling of array slicing edge cases

## Testing Strategy

### Functional Testing
1. **Course Distribution**
   - Test with 62 courses (31 + 31 split)
   - Test with less than 31 courses (only first carousel)
   - Test with exactly 31 courses (second carousel empty)
   - Test with more than 62 courses

2. **Search Functionality**
   - Search results less than 31 courses
   - Search results between 31-62 courses
   - Search results more than 62 courses
   - Empty search results

3. **Interactive Elements**
   - Modal functionality from both carousels
   - Hover effects and animations
   - Course count indicators accuracy

### Visual Testing
1. **Layout Verification**
   - Both carousels display correctly with different content
   - Course count badges show correct numbers
   - Empty states display appropriately

2. **Responsive Design**
   - Mobile layout with split courses
   - Tablet and desktop layouts
   - Animation performance with different course counts

## Implementation Notes

### Code Changes Required
1. **Create split arrays**: Add logic to split `cursosVisibles`
2. **Update first carousel**: Use `firstCarouselCourses` instead of `cursosVisibles`
3. **Update second carousel**: Use `secondCarouselCourses` instead of `cursosVisibles`
4. **Update course counts**: Display accurate counts for each carousel
5. **Handle empty states**: Conditional rendering for empty second carousel

### Preservation Priority
1. Keep all existing search functionality
2. Maintain modal and interaction behavior
3. Preserve animations and styling
4. Keep responsive design intact
5. Maintain carousel auto-scroll behavior

### Performance Considerations
- Array slicing is efficient for the course count (62 total)
- No significant performance impact expected
- Existing animations and interactions remain unchanged

### Visual Updates
- Update carousel titles to reflect their content
- Update course count indicators
- Consider adding labels like "Parte 1" and "Parte 2" or similar
- Maintain consistent styling between carousels

### Empty State Handling
When second carousel is empty:
- Option 1: Hide the entire second carousel section
- Option 2: Show empty state with message like "No hay más cursos disponibles"
- Option 3: Show placeholder content

Recommended: Hide empty second carousel to maintain clean layout.