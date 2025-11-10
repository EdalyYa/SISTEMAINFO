# Requirements Document

## Introduction

This feature involves removing the category filter section from the CursosLibres component. The category filter section currently displays buttons for different course categories (like "Todos los Cursos", "Programación", "Diseño", etc.) with course counts, and includes carousel navigation for the categories. The user wants to simplify the interface by removing this filtering functionality while keeping all other elements intact.

## Requirements

### Requirement 1

**User Story:** As a user viewing the free courses page, I want a simplified interface without category filters, so that I can focus on browsing all courses without the complexity of category selection.

#### Acceptance Criteria

1. WHEN I visit the free courses page THEN the category filter buttons SHALL be completely removed from the interface
2. WHEN I visit the free courses page THEN the category carousel navigation (previous/next buttons and indicators) SHALL be removed
3. WHEN I visit the free courses page THEN all courses SHALL be displayed by default without category filtering
4. WHEN I visit the free courses page THEN the search functionality SHALL remain intact and functional
5. WHEN I visit the free courses page THEN all course carousels SHALL continue to display all available courses
6. WHEN I visit the free courses page THEN the layout SHALL adjust properly without the removed category section

### Requirement 2

**User Story:** As a user, I want the search functionality to work across all courses, so that I can still find specific courses without needing category filters.

#### Acceptance Criteria

1. WHEN I use the search bar THEN it SHALL search across all courses regardless of category
2. WHEN I search for a course THEN the results SHALL be filtered based on course name matching the search term
3. WHEN I clear the search THEN all courses SHALL be displayed again
4. WHEN I search THEN the course carousels SHALL update to show only matching courses

### Requirement 3

**User Story:** As a developer, I want clean code after removing the category filters, so that the component is maintainable and doesn't contain unused code.

#### Acceptance Criteria

1. WHEN the category filter is removed THEN all related state variables SHALL be cleaned up
2. WHEN the category filter is removed THEN all related functions SHALL be removed
3. WHEN the category filter is removed THEN all related useEffect hooks SHALL be cleaned up
4. WHEN the category filter is removed THEN the component SHALL not contain any unused imports or variables
5. WHEN the category filter is removed THEN the filtering logic SHALL be simplified to only handle search terms