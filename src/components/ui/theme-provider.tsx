"use client";

import { useEffect } from "react";
import { ThemeProvider as ThemeContextProvider } from "@/context/theme-provider";
import { SettingsProvider } from "@/context/settings-provider";
import { Toaster } from "@/components/ui/sonner";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply theme classes to body for better global styling
    const body = document.body;

    // Remove any existing theme classes
    body.classList.remove('light', 'dark');

    // Apply current theme
    const savedMode = localStorage.getItem('theme-mode') || 'system';
    if (savedMode === 'dark') {
      body.classList.add('dark');
    } else if (savedMode === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        body.classList.add('dark');
      }
    }
  }, []);

  return (
    <SettingsProvider>
      <ThemeContextProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          className="z-toast"
        />
      </ThemeContextProvider>
    </SettingsProvider>
  );
}