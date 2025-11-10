// Modern Flyer Design System - Configuration

import type { 
  ColorPalette, 
  TypographyConfig, 
  ModernTemplate, 
  TemplateCategory,
  TemplateCategoryInfo 
} from '../types/modern-flyer';

/* === COLOR PALETTES === */

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  techBlue: {
    primary: '#0066FF',
    secondary: '#004CCC',
    accent: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#0066FF',
    },
  },
  
  professionalPurple: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    accent: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#6366F1',
    },
  },
  
  modernGreen: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#6366F1',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#0066FF',
    },
  },
  
  elegantGray: {
    primary: '#374151',
    secondary: '#6B7280',
    accent: '#0066FF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#0066FF',
    },
  },
};

/* === TYPOGRAPHY CONFIGURATIONS === */

export const TYPOGRAPHY_CONFIGS: Record<string, TypographyConfig> = {
  modern: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      accent: 'JetBrains Mono, "Fira Code", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.6,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
};

/* === TEMPLATE CATEGORIES === */

export const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Diseños minimalistas con mucho espacio en blanco y elementos limpios',
    preview: '/templates/previews/minimal-preview.jpg',
    templates: ['minimal-basic', 'minimal-elegant', 'minimal-modern'],
    count: 3,
  },
  {
    id: 'tech',
    name: 'Tech Forward',
    description: 'Elementos tecnológicos modernos perfectos para cursos de IA y tecnología',
    preview: '/templates/previews/tech-preview.jpg',
    templates: ['tech-ai', 'tech-coding', 'tech-digital'],
    count: 3,
  },
  {
    id: 'corporate',
    name: 'Professional Corporate',
    description: 'Diseños corporativos elegantes para instituciones profesionales',
    preview: '/templates/previews/corporate-preview.jpg',
    templates: ['corporate-classic', 'corporate-modern', 'corporate-executive'],
    count: 3,
  },
  {
    id: 'creative',
    name: 'Creative Dynamic',
    description: 'Layouts dinámicos con elementos gráficos modernos y creativos',
    preview: '/templates/previews/creative-preview.jpg',
    templates: ['creative-vibrant', 'creative-artistic', 'creative-bold'],
    count: 3,
  },
];

/* === PREDEFINED TEMPLATES === */

export const PREDEFINED_TEMPLATES: ModernTemplate[] = [
  // MINIMAL TEMPLATES
  {
    id: 'minimal-basic',
    name: 'Minimal Básico',
    description: 'Diseño limpio y minimalista con enfoque en la legibilidad',
    category: 'minimal',
    preview: '/templates/previews/minimal-basic.jpg',
    layout: {
      grid: {
        columns: 12,
        gutter: '24px',
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
    },
    colorScheme: COLOR_PALETTES.techBlue,
    typography: TYPOGRAPHY_CONFIGS.modern,
    elements: [
      {
        id: 'header',
        type: 'text',
        position: { x: 0, y: 0, width: 100, height: 20 },
        style: { 
          fontSize: '2.5rem',
          fontWeight: 700,
          textAlign: 'center',
          color: '#111827',
        },
        content: 'HORARIO OCTUBRE-2025',
        editable: true,
      },
      {
        id: 'subtitle',
        type: 'text',
        position: { x: 0, y: 20, width: 100, height: 10 },
        style: {
          fontSize: '1.25rem',
          fontWeight: 500,
          textAlign: 'center',
          color: '#6B7280',
        },
        content: 'MATRÍCULAS HABILITADAS HASTA EL 10 DE OCTUBRE',
        editable: true,
      },
      {
        id: 'course-section',
        type: 'text',
        position: { x: 0, y: 35, width: 100, height: 15 },
        style: {
          fontSize: '1.5rem',
          fontWeight: 600,
          textAlign: 'center',
          backgroundColor: '#0066FF',
          color: '#FFFFFF',
          padding: '1rem',
          borderRadius: '0.75rem',
        },
        content: 'ÁREA: CURSOS ESPECIALES MODALIDAD VIRTUAL',
        editable: true,
      },
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'Modern Flyer System',
      tags: ['minimal', 'clean', 'professional'],
    },
  },
  
  // TECH TEMPLATES
  {
    id: 'tech-ai',
    name: 'Tech AI',
    description: 'Diseño moderno para cursos de Inteligencia Artificial',
    category: 'tech',
    preview: '/templates/previews/tech-ai.jpg',
    layout: {
      grid: {
        columns: 12,
        gutter: '24px',
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
    },
    colorScheme: COLOR_PALETTES.professionalPurple,
    typography: TYPOGRAPHY_CONFIGS.modern,
    elements: [
      {
        id: 'tech-header',
        type: 'text',
        position: { x: 0, y: 0, width: 100, height: 25 },
        style: {
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          color: '#FFFFFF',
          fontSize: '2rem',
          fontWeight: 700,
          textAlign: 'center',
          padding: '2rem',
          borderRadius: '1rem',
        },
        content: 'INTELIGENCIA ARTIFICIAL PARA EDUCACIÓN',
        editable: true,
      },
      {
        id: 'tech-features',
        type: 'text',
        position: { x: 0, y: 30, width: 100, height: 40 },
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          padding: '1.5rem',
        },
        content: 'Características del curso',
        editable: true,
      },
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'Modern Flyer System',
      tags: ['tech', 'ai', 'modern', 'gradient'],
    },
  },
  
  // CORPORATE TEMPLATES
  {
    id: 'corporate-classic',
    name: 'Corporate Clásico',
    description: 'Diseño corporativo elegante y profesional',
    category: 'corporate',
    preview: '/templates/previews/corporate-classic.jpg',
    layout: {
      grid: {
        columns: 12,
        gutter: '24px',
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
    },
    colorScheme: COLOR_PALETTES.elegantGray,
    typography: TYPOGRAPHY_CONFIGS.modern,
    elements: [
      {
        id: 'corporate-header',
        type: 'text',
        position: { x: 0, y: 0, width: 100, height: 20 },
        style: {
          backgroundColor: '#374151',
          color: '#FFFFFF',
          fontSize: '2.25rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '1.5rem',
        },
        content: 'PROGRAMA PROFESIONAL',
        editable: true,
      },
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'Modern Flyer System',
      tags: ['corporate', 'professional', 'elegant'],
    },
  },
  
  // CREATIVE TEMPLATES
  {
    id: 'creative-vibrant',
    name: 'Creative Vibrante',
    description: 'Diseño dinámico con elementos creativos y colores vibrantes',
    category: 'creative',
    preview: '/templates/previews/creative-vibrant.jpg',
    layout: {
      grid: {
        columns: 12,
        gutter: '24px',
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
    },
    colorScheme: COLOR_PALETTES.modernGreen,
    typography: TYPOGRAPHY_CONFIGS.modern,
    elements: [
      {
        id: 'creative-header',
        type: 'text',
        position: { x: 0, y: 0, width: 100, height: 25 },
        style: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          fontSize: '2.5rem',
          fontWeight: 800,
          textAlign: 'center',
          padding: '2rem',
          borderRadius: '1.5rem',
          transform: 'rotate(-1deg)',
        },
        content: 'CURSO CREATIVO',
        editable: true,
      },
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'Modern Flyer System',
      tags: ['creative', 'vibrant', 'dynamic', 'colorful'],
    },
  },
];

/* === DEFAULT CONFIGURATIONS === */

export const DEFAULT_FLYER_CONFIG = {
  colorPalette: COLOR_PALETTES.techBlue,
  typography: TYPOGRAPHY_CONFIGS.modern,
  template: PREDEFINED_TEMPLATES[0],
  exportFormats: ['pdf', 'png'] as const,
  optimizations: {
    quality: 90,
    dpi: 300,
    colorSpace: 'RGB' as const,
    compression: true,
  },
};

/* === VALIDATION RULES === */

export const VALIDATION_RULES = {
  title: {
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  description: {
    minLength: 0,
    maxLength: 500,
    required: false,
  },
  courseName: {
    minLength: 1,
    maxLength: 80,
    required: true,
  },
  courseDescription: {
    minLength: 0,
    maxLength: 200,
    required: false,
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 7,
    maxLength: 20,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  },
  website: {
    pattern: /^https?:\/\/.+/,
    required: false,
  },
};

/* === EXPORT SETTINGS === */

export const EXPORT_SETTINGS = {
  formats: {
    pdf: {
      quality: 100,
      dpi: 300,
      colorSpace: 'RGB',
      compression: false,
    },
    png: {
      quality: 90,
      dpi: 300,
      compression: true,
      transparent: false,
    },
    jpg: {
      quality: 85,
      dpi: 300,
      compression: true,
    },
    webp: {
      quality: 80,
      dpi: 150,
      compression: true,
    },
    svg: {
      minify: true,
      removeComments: true,
    },
  },
  socialMedia: {
    facebook: { width: 1200, height: 630 },
    instagram: { width: 1080, height: 1080 },
    twitter: { width: 1200, height: 675 },
    linkedin: { width: 1200, height: 627 },
  },
  print: {
    a4: { width: 210, height: 297, unit: 'mm' },
    letter: { width: 8.5, height: 11, unit: 'in' },
    tabloid: { width: 11, height: 17, unit: 'in' },
  },
};