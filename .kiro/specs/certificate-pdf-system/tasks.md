# Implementation Plan

- [ ] 1. Set up database schema extensions and core services
  - Create database migration script for PDF storage columns
  - Implement PDFGeneratorService class with core PDF generation logic
  - Create StorageService class for PDF database operations
  - _Requirements: 1.3, 1.4, 7.4_

- [ ] 1.1 Create database migration for PDF storage
  - Write SQL migration script to add pdf_content, pdf_generated_at, pdf_size columns to certificados table
  - Create pdf_download_logs table for audit tracking
  - Add necessary indexes for performance optimization
  - _Requirements: 1.3, 6.6, 7.1_

- [ ] 1.2 Implement PDFGeneratorService core functionality





  - Create PDFGeneratorService class with generateCertificatePDF method
  - Implement PDF generation using existing PDFKit logic from routes
  - Add validateCertificateData method for input validation
  - Create generatePreview method for PDF preview without storage
  - _Requirements: 1.2, 5.1, 5.3_

- [ ] 1.3 Implement StorageService for PDF management
  - Create StorageService class with storePDF and retrievePDF methods
  - Implement PDF compression before database storage
  - Add getStorageStats method for storage analytics
  - Create cleanupOldPDFs method for maintenance
  - _Requirements: 1.4, 7.1, 7.2, 7.5_

- [ ] 2. Enhance admin certificate management with PDF generation
  - Add individual PDF generation endpoint to admin routes
  - Implement PDF preview functionality for administrators
  - Create batch PDF generation endpoint with progress tracking
  - _Requirements: 1.1, 1.2, 4.1, 5.1_

- [ ] 2.1 Add individual PDF generation to admin panel
  - Create POST /admin/certificados/:id/generate-pdf endpoint
  - Integrate PDFGeneratorService to generate and store PDF
  - Update certificate status to indicate PDF generation
  - Return success response with PDF metadata
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 2.2 Implement PDF preview functionality
  - Create GET /admin/certificados/:id/preview-pdf endpoint
  - Generate PDF in memory without storing to database
  - Stream PDF directly to browser for inline viewing
  - Add error handling for preview generation failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2.3 Create batch PDF generation system
  - Implement POST /admin/certificados/batch-generate-pdf endpoint
  - Add progress tracking for batch operations using WebSocket or polling
  - Process certificates sequentially with error handling per certificate
  - Return detailed summary of successful and failed generations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. Implement template management system
  - Create TemplateService for managing certificate templates
  - Add template CRUD endpoints to admin routes
  - Implement template activation and assignment logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.1 Create TemplateService for template operations
  - Implement TemplateService class with getActiveTemplate method
  - Add createTemplate and updateTemplate methods with validation
  - Create setActiveTemplate method for template activation
  - Implement template assignment to certificate types
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 3.2 Add template management endpoints
  - Create GET /admin/certificados/templates endpoint for listing templates
  - Implement POST /admin/certificados/templates for template creation
  - Add PUT /admin/certificados/templates/:id for template updates
  - Create PUT /admin/certificados/templates/:id/activate for activation
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Enhance public certificate access and download
  - Improve DNI-based certificate search functionality
  - Add bulk download capability for multiple certificates
  - Implement download logging and audit trail
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4.1 Enhance certificate search by DNI
  - Modify existing POST /api/certificados/search-by-dni endpoint
  - Add filtering for certificates with generated PDFs
  - Include certificate metadata in search results
  - Implement proper error handling for no results found
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 4.2 Implement individual certificate download
  - Create GET /api/certificados/:id/download-pdf endpoint
  - Retrieve PDF from database using StorageService
  - Set proper headers for PDF download with filename
  - Add download logging to pdf_download_logs table
  - _Requirements: 3.4, 3.6, 6.4_

- [ ] 4.3 Add bulk download functionality
  - Create POST /api/certificados/download-all-by-dni endpoint
  - Generate ZIP file containing all user's certificate PDFs
  - Stream ZIP file to user with proper headers
  - Log bulk download activity for audit purposes
  - _Requirements: 3.3, 3.4_

- [ ] 5. Implement certificate verification system
  - Create public verification endpoint using verification codes
  - Add certificate authenticity validation
  - Implement verification result display with download option
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5.1 Create certificate verification endpoint
  - Implement GET /api/certificados/verify/:codigo endpoint
  - Validate verification code against database
  - Return certificate details for valid codes
  - Handle invalid or inactive certificates appropriately
  - _Requirements: 6.1, 6.2, 6.5, 6.6_

- [ ] 5.2 Add verification result display
  - Return comprehensive certificate information for valid codes
  - Include certificate status, issue date, and validity
  - Provide download link for verified certificates
  - Implement proper error messages for invalid codes
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 6. Add storage management and optimization
  - Implement storage analytics dashboard for administrators
  - Create PDF cleanup functionality for old certificates
  - Add storage optimization and compression features
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6.1 Create storage analytics dashboard
  - Implement GET /admin/certificados/storage/stats endpoint
  - Calculate total PDF storage usage and certificate counts
  - Display storage growth trends and usage patterns
  - Show breakdown by certificate type and date ranges
  - _Requirements: 7.1, 7.2_

- [ ] 6.2 Implement PDF cleanup functionality
  - Create DELETE /admin/certificados/storage/cleanup endpoint
  - Allow selective deletion of PDFs while preserving certificate data
  - Implement bulk cleanup for certificates older than specified days
  - Add confirmation and rollback capabilities for cleanup operations
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 7. Add security and performance enhancements
  - Implement rate limiting for public endpoints
  - Add comprehensive error handling and logging
  - Create performance monitoring and optimization
  - _Requirements: 1.6, 3.5, 4.5_

- [ ] 7.1 Implement rate limiting middleware
  - Create rate limiting middleware for public download endpoints
  - Configure different limits for PDF generation vs downloads
  - Add IP-based tracking and temporary blocking for abuse
  - Implement graceful error responses for rate limit exceeded
  - _Requirements: 3.5, 4.5_

- [ ] 7.2 Add comprehensive error handling
  - Create custom error classes for PDF and certificate operations
  - Implement structured logging for all PDF operations
  - Add error recovery mechanisms for failed PDF generations
  - Create user-friendly error messages for public endpoints
  - _Requirements: 1.6, 4.4, 5.5_

- [ ] 7.3 Implement performance monitoring
  - Add timing metrics for PDF generation operations
  - Monitor database query performance for certificate searches
  - Implement caching for frequently accessed templates
  - Create performance alerts for slow operations
  - _Requirements: 4.3, 7.2_

- [ ] 8. Create comprehensive testing suite
  - Write unit tests for all new services and utilities
  - Implement integration tests for PDF generation workflows
  - Add end-to-end tests for public certificate access
  - _Requirements: All requirements validation_

- [ ] 8.1 Write unit tests for core services
  - Create unit tests for PDFGeneratorService methods
  - Test StorageService PDF operations with mock data
  - Write tests for TemplateService template management
  - Add validation tests for all input sanitization
  - _Requirements: 1.1-1.6, 2.1-2.5_

- [ ] 8.2 Implement integration tests for admin workflows
  - Test complete PDF generation workflow from admin panel
  - Verify batch processing with multiple certificates
  - Test template assignment and PDF generation integration
  - Validate storage and retrieval operations end-to-end
  - _Requirements: 4.1-4.4, 5.1-5.4_

- [ ] 8.3 Create end-to-end tests for public access
  - Test certificate search by DNI with various scenarios
  - Verify PDF download functionality for public users
  - Test certificate verification workflow completely
  - Validate rate limiting and error handling in public endpoints
  - _Requirements: 3.1-3.6, 6.1-6.6_