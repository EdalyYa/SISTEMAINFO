# Implementation Plan

- [x] 1. Create course splitting logic


  - Add logic to split `cursosVisibles` into two arrays using slice method
  - Create `firstCarouselCourses` for courses 0-30 (first 31 courses)
  - Create `secondCarouselCourses` for courses 31+ (remaining courses)
  - _Requirements: 1.1, 1.2, 4.1_



- [ ] 2. Update first carousel to use split data
  - Modify first carousel to use `firstCarouselCourses` instead of `cursosVisibles`
  - Update the course count indicator to show `firstCarouselCourses.length`


  - Update carousel title to indicate it's showing the first part of courses
  - _Requirements: 1.1, 3.2, 4.2_

- [x] 3. Update second carousel to use split data


  - Modify second carousel to use `secondCarouselCourses` instead of `cursosVisibles`
  - Update the course count indicator to show `secondCarouselCourses.length`
  - Update carousel title to indicate it's showing the second part of courses
  - _Requirements: 1.2, 3.2, 4.2_



- [ ] 4. Implement conditional rendering for empty second carousel
  - Add logic to hide second carousel when `secondCarouselCourses` is empty
  - Ensure proper layout when only first carousel is displayed
  - Handle edge cases when there are fewer than 32 total courses



  - _Requirements: 1.5, 3.4, 4.3_

- [ ] 5. Test search functionality with split carousels
  - Verify search results are properly split between carousels
  - Test edge cases: less than 31 results, exactly 31 results, more than 31 results
  - Ensure search clearing works correctly with both carousels
  - Verify modal functionality works from both carousels
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.4_

- [ ] 6. Update course count displays and verify functionality
  - Ensure total course count information is accurate
  - Test responsive design with split carousels
  - Verify animations and hover effects work properly
  - Test carousel auto-scroll behavior with different course counts
  - _Requirements: 3.1, 3.3, 4.4_