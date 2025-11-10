# Design Document

## Overview

El sistema de generación y descarga de certificados PDF está diseñado como una extensión del sistema INFOUNA existente. La arquitectura se basa en el patrón MVC con Express.js como backend, utilizando MySQL para almacenamiento de datos y PDFKit para generación de documentos PDF. El sistema maneja dos flujos principales: generación de PDFs por parte de administradores y descarga pública por parte de usuarios mediante DNI.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  Public Website │    │   Database      │
│                 │    │                 │    │                 │
│ - PDF Generation│    │ - Certificate   │    │ - certificados  │
│ - Batch Process │    │   Search by DNI │    │ - disenos_cert  │
│ - Preview       │    │ - PDF Download  │    │ - pdf_storage   │
│ - Template Mgmt │    │ - Verification  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Express.js API │
                    │                 │
                    │ - Auth Routes   │
                    │ - Admin Routes  │
                    │ - Public Routes │
                    │ - PDF Service   │
                    └─────────────────┘
```

### Component Architecture

```
Backend Services:
├── Routes/
│   ├── adminCertificados.js (existing - enhanced)
│   ├── certificadosPublicos.js (existing - enhanced)
│   ├── disenosCertificados.js (existing)
│   └── pdfBatchService.js (new)
├── Services/
│   ├── PDFGeneratorService.js (new)
│   ├── TemplateService.js (new)
│   └── StorageService.js (new)
├── Middleware/
│   ├── auth.js (existing)
│   ├── adminAuth.js (existing)
│   └── rateLimiter.js (new)
└── Utils/
    ├── pdfUtils.js (new)
    └── validationUtils.js (new)
```

## Components and Interfaces

### 1. PDFGeneratorService

**Purpose**: Centralizar la lógica de generación de PDFs con diferentes plantillas.

**Interface**:
```javascript
class PDFGeneratorService {
  async generateCertificatePDF(certificateData, templateConfig)
  async generatePreview(certificateData, templateConfig)
  async generateBatch(certificatesArray, templateConfig)
  validateCertificateData(certificateData)
}
```

**Key Methods**:
- `generateCertificatePDF()`: Genera PDF individual y retorna buffer
- `generatePreview()`: Genera PDF temporal para previsualización
- `generateBatch()`: Procesa múltiples certificados en lote
- `validateCertificateData()`: Valida datos antes de generar PDF

### 2. TemplateService

**Purpose**: Gestionar plantillas de diseño y configuraciones de certificados.

**Interface**:
```javascript
class TemplateService {
  async getActiveTemplate(certificateType)
  async getAllTemplates()
  async createTemplate(templateData)
  async updateTemplate(id, templateData)
  async deleteTemplate(id)
  async setActiveTemplate(id)
}
```

**Key Methods**:
- `getActiveTemplate()`: Obtiene plantilla activa para tipo de certificado
- `createTemplate()`: Crea nueva plantilla con validación
- `setActiveTemplate()`: Activa plantilla específica

### 3. StorageService

**Purpose**: Manejar almacenamiento y recuperación de PDFs en base de datos.

**Interface**:
```javascript
class StorageService {
  async storePDF(certificateId, pdfBuffer, metadata)
  async retrievePDF(certificateId)
  async deletePDF(certificateId)
  async getStorageStats()
  async cleanupOldPDFs(daysOld)
}
```

**Key Methods**:
- `storePDF()`: Almacena PDF como BLOB en base de datos
- `retrievePDF()`: Recupera PDF por ID de certificado
- `getStorageStats()`: Estadísticas de uso de almacenamiento

### 4. Enhanced Admin Routes

**New Endpoints**:
```javascript
// PDF Generation
POST /admin/certificados/:id/generate-pdf
GET  /admin/certificados/:id/preview-pdf
POST /admin/certificados/batch-generate-pdf

// Template Management
GET    /admin/certificados/templates
POST   /admin/certificados/templates
PUT    /admin/certificados/templates/:id
DELETE /admin/certificados/templates/:id
PUT    /admin/certificados/templates/:id/activate

// Storage Management
GET    /admin/certificados/storage/stats
DELETE /admin/certificados/storage/cleanup
```

### 5. Enhanced Public Routes

**New Endpoints**:
```javascript
// Certificate Search and Download
POST /api/certificados/search-by-dni
GET  /api/certificados/:id/download-pdf
GET  /api/certificados/verify/:codigo

// Batch Download
POST /api/certificados/download-all-by-dni
```

## Data Models

### Enhanced Certificate Model

```sql
-- Extensión de tabla certificados existente
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS pdf_content LONGBLOB;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP NULL;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS pdf_size INT DEFAULT 0;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS template_id INT;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMP NULL;

-- Índices adicionales
CREATE INDEX idx_template_id ON certificados(template_id);
CREATE INDEX idx_pdf_generated ON certificados(pdf_generated_at);
```

### PDF Download Logs

```sql
CREATE TABLE IF NOT EXISTS pdf_download_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id INT NOT NULL,
  dni VARCHAR(8) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (certificate_id) REFERENCES certificados(id) ON DELETE CASCADE,
  INDEX idx_certificate_id (certificate_id),
  INDEX idx_dni_date (dni, downloaded_at)
);
```

### Template Configuration

```sql
-- Tabla existente disenos_certificados se mantiene
-- Agregar campos adicionales si es necesario
ALTER TABLE disenos_certificados ADD COLUMN IF NOT EXISTS certificate_types JSON;
ALTER TABLE disenos_certificados ADD COLUMN IF NOT EXISTS usage_count INT DEFAULT 0;
```

## Error Handling

### PDF Generation Errors

```javascript
class PDFGenerationError extends Error {
  constructor(message, certificateId, templateId) {
    super(message);
    this.name = 'PDFGenerationError';
    this.certificateId = certificateId;
    this.templateId = templateId;
  }
}
```

**Error Scenarios**:
1. **Template Not Found**: Usar plantilla por defecto
2. **Invalid Certificate Data**: Retornar error de validación
3. **PDF Generation Failure**: Log error y reintentar
4. **Storage Failure**: Mantener PDF en memoria temporalmente
5. **Batch Processing Errors**: Continuar con siguientes certificados

### Public Access Errors

```javascript
class CertificateAccessError extends Error {
  constructor(message, dni, code) {
    super(message);
    this.name = 'CertificateAccessError';
    this.dni = dni;
    this.code = code;
  }
}
```

**Error Scenarios**:
1. **DNI Not Found**: Mensaje amigable "No se encontraron certificados"
2. **PDF Not Available**: "PDF no disponible, contacte administración"
3. **Invalid Verification Code**: "Código de verificación inválido"
4. **Rate Limiting**: "Demasiadas solicitudes, intente más tarde"

## Testing Strategy

### Unit Tests

```javascript
// PDFGeneratorService Tests
describe('PDFGeneratorService', () => {
  test('should generate valid PDF with template')
  test('should handle missing template gracefully')
  test('should validate certificate data')
  test('should generate batch PDFs correctly')
})

// TemplateService Tests
describe('TemplateService', () => {
  test('should retrieve active template')
  test('should create new template')
  test('should handle template conflicts')
})
```

### Integration Tests

```javascript
// Admin PDF Generation Flow
describe('Admin PDF Generation', () => {
  test('should generate PDF and store in database')
  test('should update certificate status after generation')
  test('should handle batch generation')
})

// Public Download Flow
describe('Public Certificate Download', () => {
  test('should find certificates by DNI')
  test('should download PDF successfully')
  test('should log download activity')
})
```

### Performance Tests

```javascript
// Load Testing Scenarios
describe('Performance Tests', () => {
  test('should handle 100 concurrent PDF generations')
  test('should process batch of 1000 certificates')
  test('should maintain response time under 3s for downloads')
})
```

## Security Considerations

### Authentication & Authorization

1. **Admin Routes**: Requieren autenticación JWT + rol admin
2. **Public Routes**: Rate limiting por IP
3. **PDF Access**: Validación de DNI para acceso a certificados
4. **Template Management**: Solo administradores pueden modificar

### Data Protection

1. **PDF Storage**: Encriptación opcional de PDFs sensibles
2. **Access Logs**: Registro de todas las descargas
3. **Input Validation**: Sanitización de todos los inputs
4. **SQL Injection**: Uso de prepared statements

### Rate Limiting

```javascript
// Configuración de rate limiting
const rateLimiter = {
  publicDownload: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 por 15 min
  pdfGeneration: { windowMs: 60 * 1000, max: 5 },        // 5 por minuto
  batchGeneration: { windowMs: 60 * 60 * 1000, max: 1 }  // 1 por hora
}
```

## Performance Optimization

### PDF Generation

1. **Template Caching**: Cache de plantillas activas en memoria
2. **Async Processing**: Generación de PDFs en background para lotes
3. **Resource Pooling**: Pool de conexiones para base de datos
4. **Memory Management**: Liberación de buffers después de almacenar

### Storage Optimization

1. **PDF Compression**: Compresión de PDFs antes de almacenar
2. **Lazy Loading**: Cargar PDFs solo cuando se soliciten
3. **Cleanup Jobs**: Limpieza automática de PDFs antiguos
4. **Index Optimization**: Índices optimizados para búsquedas por DNI

### Caching Strategy

```javascript
// Cache Configuration
const cacheConfig = {
  templates: { ttl: 3600 }, // 1 hora
  certificates: { ttl: 1800 }, // 30 minutos
  pdfs: { ttl: 300 } // 5 minutos para PDFs pequeños
}
```

## Deployment Considerations

### Database Migration

```sql
-- Script de migración para agregar campos PDF
-- Ejecutar en orden:
-- 1. Agregar columnas nuevas
-- 2. Crear tablas de logs
-- 3. Crear índices
-- 4. Migrar datos existentes si es necesario
```

### Environment Variables

```env
# PDF Configuration
PDF_STORAGE_TYPE=database
PDF_MAX_SIZE_MB=10
PDF_COMPRESSION_LEVEL=6

# Template Configuration
TEMPLATE_CACHE_TTL=3600
DEFAULT_TEMPLATE_ID=1

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

### Monitoring

1. **PDF Generation Metrics**: Tiempo de generación, errores, throughput
2. **Storage Metrics**: Uso de espacio, crecimiento de base de datos
3. **Download Metrics**: Descargas por día, certificados más descargados
4. **Error Tracking**: Logs estructurados para debugging