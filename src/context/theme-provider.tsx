"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

type ThemeMode = "light" | "dark" | "system";

interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    accent: string;
    muted: string;
    destructive: string;
  };
  typography: {
    fontFamily: {
      display: string;
      body: string;
      brand: string;
    };
    fontSize: {
      base: string;
      sm: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  themes: CustomTheme[];
  loading: boolean;
  error: string | null;
  setMode: (mode: ThemeMode) => void;
  updateCustomTheme: (theme: Partial<CustomTheme>) => void;
  resetToDefault: () => void;
  saveTheme: (name: string) => Promise<void>;
  loadTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const defaultTheme: CustomTheme = {
  id: "default",
  name: "Default",
  colors: {
    primary: "#6366F1",
    background: "#ffffff",
    foreground: "#111827",
    card: "#ffffff",
    border: "#e2e8f0",
    accent: "#f1f5f9",
    muted: "#f1f5f9",
    destructive: "#ef4444",
  },
  typography: {
    fontFamily: {
      display: "Roboto Slab, serif",
      body: "Roboto, sans-serif",
      brand: "Inter, sans-serif",
    },
    fontSize: {
      base: "1rem",
      sm: "0.875rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
    letterSpacing: {
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultTheme);
  const [themes, setThemes] = useState<CustomTheme[]>([defaultTheme]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  // Apply theme to document
  const applyTheme = (theme: CustomTheme, themeMode: ThemeMode) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Determine if we should use dark mode
    const isDarkMode = themeMode === "dark" ||
      (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Apply mode class
    root.classList.toggle("dark", isDarkMode);

    // Apply custom theme variables (both prefixed and unprefixed for compatibility)
    const colors = theme.colors;
    Object.entries(colors).forEach(([key, value]) => {
      // Set both formats for maximum compatibility
      root.style.setProperty(`--color-${key}`, value);
      root.style.setProperty(`--${key}`, value);
    });

    // Set dark mode colors if in dark mode
    if (isDarkMode) {
      const darkColors = {
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "#1e293b",
        "card-foreground": "#f8fafc",
        popover: "#1e293b",
        "popover-foreground": "#f8fafc",
        primary: theme.colors.primary || "#6366f1",
        "primary-foreground": "#f8fafc",
        secondary: "#1e293b",
        "secondary-foreground": "#f8fafc",
        muted: "#1e293b",
        "muted-foreground": "#94a3b8",
        accent: "#1e293b",
        "accent-foreground": "#f8fafc",
        destructive: "#dc2626",
        "destructive-foreground": "#f8fafc",
        border: "#334155",
        input: "#334155",
        ring: theme.colors.primary || "#6366f1"
      };

      Object.entries(darkColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
        root.style.setProperty(`--color-${key}`, value);
      });
    } else {
      // Light mode colors
      const lightColors = {
        background: theme.colors.background || "#ffffff",
        foreground: theme.colors.foreground || "#111827",
        card: theme.colors.card || "#ffffff",
        "card-foreground": "#111827",
        popover: "#ffffff",
        "popover-foreground": "#111827",
        primary: theme.colors.primary || "#6366f1",
        "primary-foreground": "#ffffff",
        secondary: "#f8fafc",
        "secondary-foreground": "#0f172a",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        accent: "#f1f5f9",
        "accent-foreground": "#0f172a",
        destructive: "#ef4444",
        "destructive-foreground": "#fefefe",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: theme.colors.primary || "#6366f1"
      };

      Object.entries(lightColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Apply typography
    const typography = theme.typography;
    root.style.setProperty("--font-display", typography.fontFamily.display);
    root.style.setProperty("--font-body", typography.fontFamily.body);
    root.style.setProperty("--font-brand", typography.fontFamily.brand);

    Object.entries(typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value.toString());
    });

    Object.entries(typography.letterSpacing).forEach(([key, value]) => {
      root.style.setProperty(`--letter-spacing-${key}`, value);
    });

    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  };

  // Set mode with persistence
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
    applyTheme(customTheme, newMode);
  };

  // Update custom theme
  const updateCustomTheme = (updates: Partial<CustomTheme>) => {
    const updatedTheme = {
      ...customTheme,
      ...updates,
      colors: { ...customTheme.colors, ...(updates.colors || {}) },
      typography: {
        ...customTheme.typography,
        ...(updates.typography || {}),
        fontFamily: { ...customTheme.typography.fontFamily, ...(updates.typography?.fontFamily || {}) },
        fontSize: { ...customTheme.typography.fontSize, ...(updates.typography?.fontSize || {}) },
        lineHeight: { ...customTheme.typography.lineHeight, ...(updates.typography?.lineHeight || {}) },
        letterSpacing: { ...customTheme.typography.letterSpacing, ...(updates.typography?.letterSpacing || {}) },
      },
      spacing: { ...customTheme.spacing, ...(updates.spacing || {}) },
      borderRadius: { ...customTheme.borderRadius, ...(updates.borderRadius || {}) },
    };

    setCustomTheme(updatedTheme);
    applyTheme(updatedTheme, mode);

    // Save to localStorage for persistence
    localStorage.setItem("custom-theme", JSON.stringify(updatedTheme));
  };

  // Reset to default theme
  const resetToDefault = () => {
    setCustomTheme(defaultTheme);
    applyTheme(defaultTheme, mode);
    localStorage.removeItem("custom-theme");
  };

  // Save theme (mock implementation for now)
  const saveTheme = async (name: string) => {
    const themeToSave = {
      ...customTheme,
      id: `custom-${Date.now()}`,
      name,
    };

    setThemes(prev => [...prev, themeToSave]);

    // In a real app, this would save to the backend
    const savedThemes = JSON.parse(localStorage.getItem("saved-themes") || "[]");
    savedThemes.push(themeToSave);
    localStorage.setItem("saved-themes", JSON.stringify(savedThemes));
  };

  // Load theme
  const loadTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCustomTheme(theme);
      applyTheme(theme, mode);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    // Load saved mode
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode) {
      setModeState(savedMode);
    }

    // Load custom theme
    const savedTheme = localStorage.getItem("custom-theme");
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setCustomTheme(parsedTheme);
      } catch (e) {
        console.error("Failed to parse saved theme:", e);
      }
    }

    // Load saved themes
    const savedThemes = localStorage.getItem("saved-themes");
    if (savedThemes) {
      try {
        const parsedThemes = JSON.parse(savedThemes);
        setThemes([defaultTheme, ...parsedThemes]);
      } catch (e) {
        console.error("Failed to parse saved themes:", e);
      }
    }
  }, []);

  // Apply theme when mode or theme changes
  useEffect(() => {
    applyTheme(customTheme, mode);
  }, [customTheme, mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme(customTheme, mode);

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode, customTheme]);

  return (
    <ThemeContext.Provider value={{
      mode,
      customTheme,
      themes,
      loading,
      error,
      setMode,
      updateCustomTheme,
      resetToDefault,
      saveTheme,
      loadTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};