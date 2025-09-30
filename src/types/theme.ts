export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  sidebar: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  tag: {
    tech: string;
    business: string;
    active: string;
    social: string;
    health: string;
    inspiration: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    display: string;
    body: string;
    brand: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  breakpoints: ThemeBreakpoints;
  animations: ThemeAnimations;
  shadows: ThemeShadows;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CustomTheme extends Omit<Theme, 'id'> {
  id?: string;
}

export interface ThemeContextType {
  mode: ThemeMode;
  currentTheme: Theme;
  themes: Theme[];
  loading: boolean;
  error: string | null;
  setMode: (mode: ThemeMode) => void;
  updateTheme: (updates: Partial<Theme>) => void;
  resetToDefault: () => void;
  saveTheme: (name: string) => Promise<void>;
  loadTheme: (themeId: string) => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => void;
}