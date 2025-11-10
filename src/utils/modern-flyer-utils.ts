// Modern Flyer Design System - Utility Functions

import type { 
  ColorPalette, 
  ValidationResult, 
  ValidationError,
  ModernFlyer,
  CourseInfo,
  ContactInfo,
  ExportFormat,
  TemplateCategory 
} from '../types/modern-flyer';

/* === COLOR UTILITIES === */

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calculate color contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG accessibility standards
 */
export function isAccessibleColorCombination(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate color variations (lighter/darker) from a base color
 */
export function generateColorVariations(baseColor: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) throw new Error('Invalid color format');

  const variations = {} as any;
  const steps = [0.95, 0.9, 0.8, 0.6, 0.4, 0, -0.1, -0.2, -0.3, -0.4];
  const keys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  steps.forEach((step, index) => {
    const factor = step >= 0 ? 1 - step : Math.abs(step);
    const r = step >= 0 ? 
      Math.round(rgb.r + (255 - rgb.r) * step) : 
      Math.round(rgb.r * factor);
    const g = step >= 0 ? 
      Math.round(rgb.g + (255 - rgb.g) * step) : 
      Math.round(rgb.g * factor);
    const b = step >= 0 ? 
      Math.round(rgb.b + (255 - rgb.b) * step) : 
      Math.round(rgb.b * factor);
    
    variations[keys[index]] = rgbToHex(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );
  });

  return variations;
}

/* === VALIDATION UTILITIES === */

/**
 * Validate course information
 */
export function validateCourseInfo(course: CourseInfo): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!course.name || course.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'El nombre del curso es requerido',
      severity: 'error',
      suggestions: ['Ingrese un nombre descriptivo para el curso'],
    });
  }

  if (course.name && course.name.length > 80) {
    warnings.push({
      field: 'name',
      message: 'El nombre del curso es muy largo',
      severity: 'warning',
      suggestions: ['Considere usar un nombre más corto (máximo 80 caracteres)'],
    });
  }

  // Schedule validation
  if (!course.schedule.days || course.schedule.days.length === 0) {
    errors.push({
      field: 'schedule.days',
      message: 'Debe especificar al menos un día de la semana',
      severity: 'error',
    });
  }

  if (!course.schedule.times || course.schedule.times.trim().length === 0) {
    errors.push({
      field: 'schedule.times',
      message: 'Debe especificar el horario del curso',
      severity: 'error',
    });
  }

  // Price validation
  if (course.price && !/^\$?\d+([.,]\d{2})?$/.test(course.price)) {
    warnings.push({
      field: 'price',
      message: 'Formato de precio inválido',
      severity: 'warning',
      suggestions: ['Use formato: $100.00 o 100.00'],
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate contact information
 */
export function validateContactInfo(contact: ContactInfo): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contact.email || !emailRegex.test(contact.email)) {
    errors.push({
      field: 'email',
      message: 'Email inválido',
      severity: 'error',
      suggestions: ['Ingrese un email válido (ejemplo@dominio.com)'],
    });
  }

  // Phone validation
  if (!contact.phone || contact.phone.length === 0) {
    warnings.push({
      field: 'phone',
      message: 'No se ha especificado ningún teléfono',
      severity: 'warning',
      suggestions: ['Agregue al menos un número de teléfono'],
    });
  }

  contact.phone.forEach((phone, index) => {
    if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
      warnings.push({
        field: `phone.${index}`,
        message: `Formato de teléfono inválido: ${phone}`,
        severity: 'warning',
        suggestions: ['Use solo números, espacios, guiones y paréntesis'],
      });
    }
  });

  // Website validation
  if (contact.website && !/^https?:\/\/.+/.test(contact.website)) {
    warnings.push({
      field: 'website',
      message: 'URL del sitio web inválida',
      severity: 'warning',
      suggestions: ['La URL debe comenzar con http:// o https://'],
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate complete flyer content
 */
export function validateFlyerContent(flyer: ModernFlyer): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  // Validate header
  if (!flyer.content.header.title || flyer.content.header.title.trim().length === 0) {
    allErrors.push({
      field: 'header.title',
      message: 'El título del flyer es requerido',
      severity: 'error',
    });
  }

  // Validate courses
  if (!flyer.content.courses || flyer.content.courses.length === 0) {
    allWarnings.push({
      field: 'courses',
      message: 'No se han agregado cursos al flyer',
      severity: 'warning',
      suggestions: ['Agregue al menos un curso para completar el flyer'],
    });
  }

  flyer.content.courses.forEach((course, index) => {
    const courseValidation = validateCourseInfo(course);
    courseValidation.errors.forEach(error => {
      allErrors.push({
        ...error,
        field: `courses.${index}.${error.field}`,
      });
    });
    courseValidation.warnings.forEach(warning => {
      allWarnings.push({
        ...warning,
        field: `courses.${index}.${warning.field}`,
      });
    });
  });

  // Validate contact info
  const contactValidation = validateContactInfo(flyer.content.contact);
  contactValidation.errors.forEach(error => {
    allErrors.push({
      ...error,
      field: `contact.${error.field}`,
    });
  });
  contactValidation.warnings.forEach(warning => {
    allWarnings.push({
      ...warning,
      field: `contact.${warning.field}`,
    });
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/* === FORMATTING UTILITIES === */

/**
 * Format course schedule for display
 */
export function formatSchedule(schedule: CourseInfo['schedule']): string {
  const daysText = schedule.days.join(', ');
  const timesText = schedule.times;
  const durationText = schedule.duration ? ` (${schedule.duration})` : '';
  
  return `${daysText}: ${timesText}${durationText}`;
}

/**
 * Format price with currency
 */
export function formatPrice(price: string, currency: string = '$'): string {
  if (!price) return '';
  
  // Remove existing currency symbols
  const cleanPrice = price.replace(/[$€£¥]/g, '');
  
  // Add currency symbol if not present
  return price.startsWith(currency) ? price : `${currency}${cleanPrice}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

/* === TEMPLATE UTILITIES === */

/**
 * Get template category display name
 */
export function getTemplateCategoryName(category: TemplateCategory): string {
  const names = {
    minimal: 'Minimal Clean',
    tech: 'Tech Forward',
    corporate: 'Professional Corporate',
    creative: 'Creative Dynamic',
  };
  
  return names[category] || category;
}

/**
 * Get export format display name
 */
export function getExportFormatName(format: ExportFormat): string {
  const names = {
    pdf: 'PDF Document',
    png: 'PNG Image',
    jpg: 'JPEG Image',
    svg: 'SVG Vector',
    webp: 'WebP Image',
  };
  
  return names[format] || format.toUpperCase();
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  return format === 'jpg' ? 'jpeg' : format;
}

/* === RESPONSIVE UTILITIES === */

/**
 * Get responsive breakpoint class
 */
export function getBreakpointClass(breakpoint: 'mobile' | 'tablet' | 'desktop'): string {
  const classes = {
    mobile: 'max-w-sm',
    tablet: 'max-w-md',
    desktop: 'max-w-lg',
  };
  
  return classes[breakpoint];
}

/**
 * Check if device is mobile based on screen width
 */
export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

/**
 * Check if device is tablet based on screen width
 */
export function isTabletDevice(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
}

/* === DATE UTILITIES === */

/**
 * Format date for display in flyers
 */
export function formatFlyerDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get current academic period
 */
export function getCurrentAcademicPeriod(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const year = now.getFullYear();
  
  if (month >= 1 && month <= 6) {
    return `ENERO-JUNIO ${year}`;
  } else {
    return `JULIO-DICIEMBRE ${year}`;
  }
}

/* === ACCESSIBILITY UTILITIES === */

/**
 * Generate accessible color combinations
 */
export function getAccessibleColorPair(
  baseColor: string,
  preferDark: boolean = true
): { foreground: string; background: string } {
  const darkText = '#111827';
  const lightText = '#FFFFFF';
  
  const darkRatio = getContrastRatio(darkText, baseColor);
  const lightRatio = getContrastRatio(lightText, baseColor);
  
  if (preferDark && darkRatio >= 4.5) {
    return { foreground: darkText, background: baseColor };
  } else if (lightRatio >= 4.5) {
    return { foreground: lightText, background: baseColor };
  } else {
    // If neither works, adjust the background color
    const variations = generateColorVariations(baseColor);
    
    // Try darker variations first
    for (const shade of ['600', '700', '800', '900'] as const) {
      const shadeKey = shade as '600' | '700' | '800' | '900';
      if (getContrastRatio(lightText, variations[shadeKey]) >= 4.5) {
        return { foreground: lightText, background: variations[shadeKey] };
      }
    }
    
    // Try lighter variations
    for (const shade of ['400', '300', '200', '100'] as const) {
      const shadeKey = shade as '400' | '300' | '200' | '100';
      if (getContrastRatio(darkText, variations[shadeKey]) >= 4.5) {
        return { foreground: darkText, background: variations[shadeKey] };
      }
    }
    
    // Fallback to high contrast
    return { foreground: darkText, background: '#FFFFFF' };
  }
}

/* === PERFORMANCE UTILITIES === */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}