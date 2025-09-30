import { Theme, ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorderRadius, ThemeBreakpoints, ThemeAnimations, ThemeShadows } from '@/types/theme';

// Default theme configuration
export const defaultThemeColors: ThemeColors = {
  background: '#ffffff',
  foreground: '#111827',
  card: '#ffffff',
  cardForeground: '#111827',
  popover: '#ffffff',
  popoverForeground: '#111827',
  primary: '#6366F1',
  primaryForeground: '#ffffff',
  secondary: '#f8fafc',
  secondaryForeground: '#0f172a',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#f1f5f9',
  accentForeground: '#0f172a',
  destructive: '#ef4444',
  destructiveForeground: '#fefefe',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#6366F1',
  chart: {
    1: '#e67e22',
    2: '#2d8659',
    3: '#1e3a5f',
    4: '#f1c40f',
    5: '#e74c3c',
  },
  sidebar: {
    background: '#f8fafc',
    foreground: '#475569',
    primary: '#0f172a',
    primaryForeground: '#f8fafc',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    border: '#e2e8f0',
    ring: '#6366f1',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
  },
  tag: {
    tech: '#6366f1',
    business: '#f59e0b',
    active: '#10b981',
    social: '#ef4444',
    health: '#f59e0b',
    inspiration: '#ec4899',
  },
};

export const darkThemeColors: Partial<ThemeColors> = {
  background: '#0f172a',
  foreground: '#f8fafc',
  card: '#1e293b',
  cardForeground: '#f8fafc',
  popover: '#1e293b',
  popoverForeground: '#f8fafc',
  secondary: '#1e293b',
  secondaryForeground: '#f8fafc',
  muted: '#1e293b',
  mutedForeground: '#94a3b8',
  accent: '#1e293b',
  accentForeground: '#f8fafc',
  destructive: '#dc2626',
  destructiveForeground: '#f8fafc',
  border: '#334155',
  input: '#334155',
  sidebar: {
    background: '#1e293b',
    foreground: '#cbd5e1',
    primary: '#f8fafc',
    primaryForeground: '#0f172a',
    accent: '#334155',
    accentForeground: '#f8fafc',
    border: '#475569',
    ring: '#6366f1',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
  },
};

export const defaultTypography: ThemeTypography = {
  fontFamily: {
    display: '"Roboto Slab", serif',
    body: '"Roboto", sans-serif',
    brand: '"Inter", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const defaultSpacing: ThemeSpacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

export const defaultBorderRadius: ThemeBorderRadius = {
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  full: '9999px',
};

export const defaultBreakpoints: ThemeBreakpoints = {
  sm: '640px',   // Small screens
  md: '768px',   // Medium screens
  lg: '1024px',  // Large screens
  xl: '1280px',  // Extra large screens
  '2xl': '1536px', // 2X large screens
};

export const defaultAnimations: ThemeAnimations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const defaultShadows: ThemeShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Theme',
  colors: defaultThemeColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  breakpoints: defaultBreakpoints,
  animations: defaultAnimations,
  shadows: defaultShadows,
};

// Color utility functions
export const getColor = (colorName: keyof ThemeColors, alpha?: number): string => {
  const color = defaultThemeColors[colorName];

  // Handle nested objects
  if (typeof color === 'object' && color !== null) {
    // For nested objects, return the first available string value
    const values = Object.values(color);
    return values.find(v => typeof v === 'string') || '#000000';
  }

  if (typeof color !== 'string') {
    return '#000000';
  }

  if (alpha === undefined) return color;

  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getSpacing = (size: keyof ThemeSpacing): string => {
  return defaultSpacing[size];
};

export const getBorderRadius = (size: keyof ThemeBorderRadius): string => {
  return defaultBorderRadius[size];
};

export const getFontSize = (size: keyof ThemeTypography['fontSize']): string => {
  return defaultTypography.fontSize[size];
};

export const getLineHeight = (height: keyof ThemeTypography['lineHeight']): number => {
  return defaultTypography.lineHeight[height];
};

// Theme validation (simplified)
export const validateTheme = (theme: Partial<Theme>): string[] => {
  const errors: string[] = [];

  // Basic validation - check if required top-level properties exist
  if (!theme.colors) {
    errors.push('Missing colors configuration');
  }

  if (!theme.typography) {
    errors.push('Missing typography configuration');
  }

  if (!theme.spacing) {
    errors.push('Missing spacing configuration');
  }

  return errors;
};

// Theme export/import utilities
export const exportTheme = (theme: Theme): string => {
  return JSON.stringify(theme, null, 2);
};

export const importTheme = (themeData: string): Theme | null => {
  try {
    const theme = JSON.parse(themeData);
    const errors = validateTheme(theme);
    if (errors.length > 0) {
      console.warn('Theme validation errors:', errors);
    }
    return theme;
  } catch (error) {
    console.error('Failed to import theme:', error);
    return null;
  }
};

// CSS variable generation
export const generateCSSVariables = (theme: Theme, isDark = false): string => {
  const colors = isDark ? { ...defaultThemeColors, ...darkThemeColors } : theme.colors;

  let css = '';

  // Colors
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        css += `  --color-${key}-${subKey}: ${subValue};\n`;
      });
    } else {
      css += `  --color-${key}: ${value};\n`;
    }
  });

  // Typography
  Object.entries(theme.typography).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        css += `  --${category}-${key}: ${value};\n`;
      });
    } else {
      css += `  --${category}: ${values};\n`;
    }
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });

  // Breakpoints
  Object.entries(theme.breakpoints).forEach(([key, value]) => {
    css += `  --breakpoint-${key}: ${value};\n`;
  });

  // Animations
  Object.entries(theme.animations.duration).forEach(([key, value]) => {
    css += `  --duration-${key}: ${value};\n`;
  });

  Object.entries(theme.animations.easing).forEach(([key, value]) => {
    css += `  --easing-${key}: ${value};\n`;
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    css += `  --shadow-${key}: ${value};\n`;
  });

  return css;
};