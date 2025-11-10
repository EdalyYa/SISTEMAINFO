# Requirements Document

## Introduction

This feature involves modifying the course display logic in the CursosLibres component to split the courses between the two existing carousels. Currently, both carousels show all available courses. The user wants to divide the courses so that the first carousel shows the first 31 courses and the second carousel shows the remaining 31 courses, creating a more organized and balanced distribution.

## Requirements

### Requirement 1

**User Story:** As a user viewing the free courses page, I want the courses to be evenly distributed between the two carousels, so that I can see different courses in each carousel without repetition.

#### Acceptance Criteria

1. WHEN I visit the free courses page THEN the first carousel SHALL display the first 31 courses from the filtered course list
2. WHEN I visit the free courses page THEN the second carousel SHALL display the remaining courses (starting from course 32)
3. WHEN I search for courses THEN the first carousel SHALL show the first 31 results from the filtered search
4. WHEN I search for courses THEN the second carousel SHALL show the remaining search results (from result 32 onwards)
5. WHEN there are fewer than 32 courses total THEN the first carousel SHALL show all available courses and the second carousel SHALL be empty or hidden

### Requirement 2

**User Story:** As a user, I want the search functionality to work seamlessly with the split carousel display, so that I can find courses across both carousels when searching.

#### Acceptance Criteria

1. WHEN I search for courses THEN the results SHALL be split between carousels based on the 31-course division
2. WHEN search results are less than 32 courses THEN only the first carousel SHALL display results
3. WHEN search results are 32 or more courses THEN both carousels SHALL display their respective portions
4. WHEN I clear the search THEN both carousels SHALL return to showing their original course divisions

### Requirement 3

**User Story:** As a user, I want clear visual indication of the content in each carousel, so that I understand what courses are being displayed in each section.

#### Acceptance Criteria

1. WHEN I view the carousels THEN each carousel SHALL have an updated title indicating its content
2. WHEN I view the carousels THEN the course count indicators SHALL reflect the actual number of courses in each carousel
3. WHEN courses are split THEN the visual styling and animations SHALL remain consistent across both carousels
4. WHEN one carousel is empty THEN it SHALL either be hidden or show an appropriate empty state message

### Requirement 4

**User Story:** As a developer, I want clean and maintainable code for the course splitting logic, so that the component remains easy to understand and modify.

#### Acceptance Criteria

1. WHEN the course splitting is implemented THEN the logic SHALL be clear and well-documented
2. WHEN the course splitting is implemented THEN the existing search and filtering functionality SHALL remain intact
3. WHEN the course splitting is implemented THEN the component SHALL not contain duplicate or redundant code
4. WHEN the course splitting is implemented THEN the carousel animations and interactions SHALL continue to work properly