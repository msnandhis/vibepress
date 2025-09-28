import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

interface ThemeContextType {
  activeTheme: any;
  themes: any[];
  loading: boolean;
  error: string | null;
  switchTheme: (themeId: number) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const defaultTheme = {
  id: 1,
  name: "Default",
  colors: {
    primary: "#6366F1",
    background: "#ffffff",
    foreground: "#111827",
    card: "#ffffff",
    popover: "#ffffff",
    muted: "#f5f5f5",
    accent: "#f5f5f5",
    border: "#E5E7EB",
    input: "#E5E7EB",
    ring: "#6366F1",
    destructive: "#ef4444",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState(defaultTheme);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  const fetchThemes = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/themes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setThemes(data);
        const active = data.find((t: any) => t.active);
        if (active) {
          setActiveTheme(active);
          // Apply CSS vars
          const root = document.documentElement;
          Object.entries(active.config.colors || {}).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, String(value));
          });
        }
      }
    } catch (err) {
      setError("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const switchTheme = async (themeId: number) => {
    if (!session?.user) {
      setError("Authentication required");
      return;
    }

    try {
      const response = await fetch(`/api/themes?id=${themeId}&action=activate`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchThemes(); // Refresh themes
      } else {
        const data = await response.json();
        setError(data.error || "Failed to switch theme");
      }
    } catch (err) {
      setError("Failed to switch theme");
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, themes, loading, error, switchTheme }}>
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