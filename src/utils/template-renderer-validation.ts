// Modern Flyer Design System - Template Renderer Validation

import type { 
  ModernTemplate, 
  ModernFlyer, 
  ValidationResult, 
  ValidationError,
  DesignElement 
} from '../types/modern-flyer';

/**
 * Validate template for rendering
 */
export function validateTemplateForRendering(template: ModernTemplate): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic template validation
  if (!template) {
    errors.push({
      field: 'template',
      message: 'Template is required for rendering',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Validate template structure
  if (!template.elements || template.elements.length === 0) {
    warnings.push({
      field: 'elements',
      message: 'Template has no elements to render',
      severity: 'warning',
      suggestions: ['Add at least one element to the template'],
    });
  }

  // Validate each element
  template.elements.forEach((element, index) => {
    const elementValidation = validateElementForRendering(element);
    elementValidation.errors.forEach(error => {
      errors.push({
        ...error,
        field: `elements[${index}].${error.field}`,
      });
    });
    elementValidation.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        field: `elements[${index}].${warning.field}`,
      });
    });
  });

  // Validate color scheme
  if (!template.colorScheme) {
    errors.push({
      field: 'colorScheme',
      message: 'Template color scheme is required',
      severity: 'error',
    });
  } else {
    const colorValidation = validateColorScheme(template.colorScheme);
    colorValidation.errors.forEach(error => {
      errors.push({
        ...error,
        field: `colorScheme.${error.field}`,
      });
    });
  }

  // Validate typography
  if (!template.typography) {
    warnings.push({
      field: 'typography',
      message: 'Template typography configuration is missing',
      severity: 'warning',
    });
  }

  // Validate layout
  if (!template.layout) {
    warnings.push({
      field: 'layout',
      message: 'Template layout configuration is missing',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate design element for rendering
 */
export function validateElementForRendering(element: DesignElement): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!element.id) {
    errors.push({
      field: 'id',
      message: 'Element ID is required',
      severity: 'error',
    });
  }

  if (!element.type) {
    errors.push({
      field: 'type',
      message: 'Element type is required',
      severity: 'error',
    });
  }

  // Validate position
  if (!element.position) {
    errors.push({
      field: 'position',
      message: 'Element position is required',
      severity: 'error',
    });
  } else {
    const positionValidation = validateElementPosition(element.position);
    positionValidation.errors.forEach(error => {
      errors.push({
        ...error,
        field: `position.${error.field}`,
      });
    });
    positionValidation.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        field: `position.${warning.field}`,
      });
    });
  }

  // Type-specific validation
  switch (element.type) {
    case 'text':
      if (!element.content && !element.style?.fontSize) {
        warnings.push({
          field: 'content',
          message: 'Text element has no content or font size',
          severity: 'warning',
        });
      }
      break;
    case 'image':
      if (!element.content) {
        warnings.push({
          field: 'content',
          message: 'Image element has no source URL',
          severity: 'warning',
        });
      }
      break;
    case 'qr-code':
      if (!element.content) {
        warnings.push({
          field: 'content',
          message: 'QR code element has no data',
          severity: 'warning',
        });
      }
      break;
  }

  // Validate styles
  if (element.style) {
    const styleValidation = validateElementStyles(element.style);
    styleValidation.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        field: `style.${warning.field}`,
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate element position
 */
export function validateElementPosition(position: DesignElement['position']): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check required properties
  if (typeof position.x !== 'number') {
    errors.push({
      field: 'x',
      message: 'Position x must be a number',
      severity: 'error',
    });
  }

  if (typeof position.y !== 'number') {
    errors.push({
      field: 'y',
      message: 'Position y must be a number',
      severity: 'error',
    });
  }

  if (typeof position.width !== 'number') {
    errors.push({
      field: 'width',
      message: 'Position width must be a number',
      severity: 'error',
    });
  }

  if (typeof position.height !== 'number') {
    errors.push({
      field: 'height',
      message: 'Position height must be a number',
      severity: 'error',
    });
  }

  // Check valid ranges
  if (position.x < 0 || position.x > 100) {
    warnings.push({
      field: 'x',
      message: 'Position x should be between 0 and 100 (percentage)',
      severity: 'warning',
    });
  }

  if (position.y < 0 || position.y > 100) {
    warnings.push({
      field: 'y',
      message: 'Position y should be between 0 and 100 (percentage)',
      severity: 'warning',
    });
  }

  if (position.width <= 0 || position.width > 100) {
    warnings.push({
      field: 'width',
      message: 'Position width should be between 0 and 100 (percentage)',
      severity: 'warning',
    });
  }

  if (position.height <= 0 || position.height > 100) {
    warnings.push({
      field: 'height',
      message: 'Position height should be between 0 and 100 (percentage)',
      severity: 'warning',
    });
  }

  // Check if element goes outside bounds
  if (position.x + position.width > 100) {
    warnings.push({
      field: 'width',
      message: 'Element extends beyond right boundary',
      severity: 'warning',
      suggestions: ['Reduce width or adjust x position'],
    });
  }

  if (position.y + position.height > 100) {
    warnings.push({
      field: 'height',
      message: 'Element extends beyond bottom boundary',
      severity: 'warning',
      suggestions: ['Reduce height or adjust y position'],
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate element styles
 */
export function validateElementStyles(styles: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate colors
  Object.entries(styles).forEach(([property, value]) => {
    if (property.includes('color') || property.includes('Color')) {
      if (typeof value === 'string' && !isValidColor(value)) {
        warnings.push({
          field: property,
          message: `Invalid color value: ${value}`,
          severity: 'warning',
          suggestions: ['Use valid CSS color values (hex, rgb, hsl, named colors)'],
        });
      }
    }

    // Validate font sizes
    if (property === 'fontSize') {
      if (typeof value === 'string' && !isValidFontSize(value)) {
        warnings.push({
          field: property,
          message: `Invalid font size: ${value}`,
          severity: 'warning',
          suggestions: ['Use valid CSS font size values (px, rem, em, %)'],
        });
      }
    }

    // Validate z-index
    if (property === 'zIndex') {
      if (typeof value !== 'number' || value < 0) {
        warnings.push({
          field: property,
          message: 'z-index should be a positive number',
          severity: 'warning',
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate color scheme
 */
export function validateColorScheme(colorScheme: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface'];
  
  requiredColors.forEach(colorKey => {
    if (!colorScheme[colorKey]) {
      errors.push({
        field: colorKey,
        message: `Missing required color: ${colorKey}`,
        severity: 'error',
      });
    } else if (!isValidColor(colorScheme[colorKey])) {
      errors.push({
        field: colorKey,
        message: `Invalid color value for ${colorKey}: ${colorScheme[colorKey]}`,
        severity: 'error',
        suggestions: ['Use valid hex color format (#RRGGBB)'],
      });
    }
  });

  // Validate text colors
  if (colorScheme.text) {
    const textColors = ['primary', 'secondary', 'muted', 'inverse'];
    textColors.forEach(textColorKey => {
      if (colorScheme.text[textColorKey] && !isValidColor(colorScheme.text[textColorKey])) {
        warnings.push({
          field: `text.${textColorKey}`,
          message: `Invalid text color: ${colorScheme.text[textColorKey]}`,
          severity: 'warning',
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate flyer content for rendering
 */
export function validateFlyerContentForRendering(flyer: ModernFlyer): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate template
  const templateValidation = validateTemplateForRendering(flyer.template);
  templateValidation.errors.forEach(error => {
    errors.push({
      ...error,
      field: `template.${error.field}`,
    });
  });
  templateValidation.warnings.forEach(warning => {
    warnings.push({
      ...warning,
      field: `template.${warning.field}`,
    });
  });

  // Validate content mapping
  if (flyer.content) {
    // Check if required content is present for template elements
    flyer.template.elements.forEach(element => {
      if (element.type === 'text' && !element.content) {
        const hasContentMapping = hasContentForElement(element.id, flyer.content);
        if (!hasContentMapping) {
          warnings.push({
            field: `content.${element.id}`,
            message: `No content available for text element: ${element.id}`,
            severity: 'warning',
            suggestions: ['Provide content for this element or set default text'],
          });
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if content exists for a specific element
 */
function hasContentForElement(elementId: string, content: ModernFlyer['content']): boolean {
  const contentMap = {
    'header-title': content.header?.title,
    'header-subtitle': content.header?.subtitle,
    'header-date': content.header?.date,
    'course-title': content.courses?.[0]?.name,
    'course-description': content.courses?.[0]?.description,
    'contact-address': content.contact?.address,
    'contact-phone': content.contact?.phone?.[0],
    'contact-email': content.contact?.email,
    'contact-website': content.contact?.website,
  };
  
  return !!(contentMap as any)[elementId];
}

/**
 * Validate color value
 */
function isValidColor(color: string): boolean {
  // Check hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check rgb/rgba colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check hsl/hsla colors
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check named colors (basic check)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'transparent', 'currentColor'
  ];
  
  return namedColors.includes(color.toLowerCase());
}

/**
 * Validate font size value
 */
function isValidFontSize(fontSize: string): boolean {
  // Check pixel values
  if (/^\d+(\.\d+)?px$/.test(fontSize)) {
    return true;
  }
  
  // Check rem values
  if (/^\d+(\.\d+)?rem$/.test(fontSize)) {
    return true;
  }
  
  // Check em values
  if (/^\d+(\.\d+)?em$/.test(fontSize)) {
    return true;
  }
  
  // Check percentage values
  if (/^\d+(\.\d+)?%$/.test(fontSize)) {
    return true;
  }
  
  // Check named sizes
  const namedSizes = [
    'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large',
    'smaller', 'larger'
  ];
  
  return namedSizes.includes(fontSize);
}

/**
 * Get rendering performance metrics
 */
export function getRenderingMetrics(template: ModernTemplate): {
  complexity: number;
  estimatedRenderTime: number;
  memoryUsage: number;
  recommendations: string[];
} {
  const elementCount = template.elements.length;
  const hasImages = template.elements.some(el => el.type === 'image');
  const hasComplexStyles = template.elements.some(el => 
    el.style && Object.keys(el.style).length > 5
  );
  
  // Calculate complexity score (1-10)
  let complexity = Math.min(10, Math.max(1, 
    elementCount * 0.5 + 
    (hasImages ? 2 : 0) + 
    (hasComplexStyles ? 1 : 0)
  ));
  
  // Estimate render time in milliseconds
  const estimatedRenderTime = elementCount * 10 + (hasImages ? 100 : 0);
  
  // Estimate memory usage in KB
  const memoryUsage = elementCount * 5 + (hasImages ? 50 : 0);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (elementCount > 20) {
    recommendations.push('Consider reducing the number of elements for better performance');
  }
  
  if (hasImages) {
    recommendations.push('Optimize images for web to improve loading times');
  }
  
  if (hasComplexStyles) {
    recommendations.push('Simplify element styles to reduce rendering complexity');
  }
  
  if (complexity > 7) {
    recommendations.push('Template complexity is high - consider breaking into smaller components');
  }
  
  return {
    complexity,
    estimatedRenderTime,
    memoryUsage,
    recommendations,
  };
}