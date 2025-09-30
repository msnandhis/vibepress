"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { settingsService } from "@/lib/settings-service";
import {
  SiteSettings,
  defaultSiteSettings,
  SettingsUpdateAction,
  SettingsValidationResult,
} from "@/types/settings";
import { toast } from "sonner";

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;

  // Setting operations
  getSetting: <T>(path: string) => T;
  updateSetting: (path: string, value: any) => Promise<boolean>;
  updateSettings: (updates: Partial<SiteSettings>) => Promise<boolean>;
  dispatch: (action: SettingsUpdateAction) => Promise<boolean>;

  // Category operations
  getCategorySettings: <T>(category: keyof SiteSettings) => T;
  updateCategorySettings: <T>(category: keyof SiteSettings, updates: Partial<T>) => Promise<boolean>;

  // Utility operations
  resetToDefaults: () => Promise<boolean>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsData: string) => Promise<boolean>;
  validateSettings: () => SettingsValidationResult;

  // Cache management
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  // Load settings on mount and session change
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedSettings = await settingsService.getSettings();
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
      setSettings(defaultSiteSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Listen for settings changes from other tabs/windows
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  // Get setting by path
  const getSetting = useCallback(<T,>(path: string): T => {
    return path.split('.').reduce((obj, key) => obj?.[key], settings) as T;
  }, [settings]);

  // Update single setting
  const updateSetting = useCallback(async (path: string, value: any): Promise<boolean> => {
    try {
      const result = await settingsService.updateSetting(path, value);

      if (result.success) {
        const updatedSettings = await settingsService.getSettings();
        setSettings(updatedSettings);
        toast.success('Setting updated successfully');
        return true;
      } else {
        // Show validation errors
        const errorMessages = Object.values(result.validation.errors).flat();
        errorMessages.forEach(message => toast.error(message));
        return false;
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
      toast.error('Failed to update setting');
      return false;
    }
  }, []);

  // Update multiple settings
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const result = await settingsService.updateSettings(updates);

      if (result.success) {
        const updatedSettings = await settingsService.getSettings();
        setSettings(updatedSettings);
        toast.success('Settings updated successfully');
        return true;
      } else {
        // Show validation errors
        const errorMessages = Object.values(result.validation.errors).flat();
        errorMessages.forEach(message => toast.error(message));
        return false;
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error('Failed to update settings');
      return false;
    }
  }, []);

  // Dispatch action
  const dispatch = useCallback(async (action: SettingsUpdateAction): Promise<boolean> => {
    try {
      const result = await settingsService.dispatch(action);

      if (result.success) {
        const updatedSettings = await settingsService.getSettings();
        setSettings(updatedSettings);

        if (action.type === 'RESET_TO_DEFAULTS') {
          toast.success('Settings reset to defaults');
        } else if (action.type === 'IMPORT_SETTINGS') {
          toast.success('Settings imported successfully');
        } else {
          toast.success('Settings updated successfully');
        }

        return true;
      } else {
        // Show validation errors
        const errorMessages = Object.values(result.validation.errors).flat();
        errorMessages.forEach(message => toast.error(message));
        return false;
      }
    } catch (err) {
      console.error('Failed to dispatch settings action:', err);
      toast.error('Failed to update settings');
      return false;
    }
  }, []);

  // Get category settings
  const getCategorySettings = useCallback(<T,>(category: keyof SiteSettings): T => {
    return settings[category] as T;
  }, [settings]);

  // Update category settings
  const updateCategorySettings = useCallback(async <T,>(
    category: keyof SiteSettings,
    updates: Partial<T>
  ): Promise<boolean> => {
    try {
      const result = await settingsService.updateCategorySettings(category, updates);

      if (result.success) {
        const updatedSettings = await settingsService.getSettings();
        setSettings(updatedSettings);
        toast.success(`${category} settings updated successfully`);
        return true;
      } else {
        // Show validation errors
        const errorMessages = Object.values(result.validation.errors).flat();
        errorMessages.forEach(message => toast.error(message));
        return false;
      }
    } catch (err) {
      console.error(`Failed to update ${category} settings:`, err);
      toast.error(`Failed to update ${category} settings`);
      return false;
    }
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    try {
      await settingsService.resetToDefaults();
      const updatedSettings = await settingsService.getSettings();
      setSettings(updatedSettings);
      toast.success('Settings reset to defaults');
      return true;
    } catch (err) {
      console.error('Failed to reset settings:', err);
      toast.error('Failed to reset settings');
      return false;
    }
  }, []);

  // Export settings
  const exportSettings = useCallback(async (): Promise<string> => {
    try {
      const exportData = await settingsService.exportSettings();
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create and download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibepress-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Settings exported successfully');
      return jsonString;
    } catch (err) {
      console.error('Failed to export settings:', err);
      toast.error('Failed to export settings');
      throw err;
    }
  }, []);

  // Import settings
  const importSettings = useCallback(async (settingsData: string): Promise<boolean> => {
    try {
      const parsedData = JSON.parse(settingsData);
      const result = await settingsService.importSettings(parsedData);

      if (result.success) {
        const updatedSettings = await settingsService.getSettings();
        setSettings(updatedSettings);
        toast.success('Settings imported successfully');
        return true;
      } else {
        // Show validation errors
        const errorMessages = Object.values(result.validation.errors).flat();
        errorMessages.forEach(message => toast.error(message));
        return false;
      }
    } catch (err) {
      console.error('Failed to import settings:', err);
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error('Failed to import settings');
      }
      return false;
    }
  }, []);

  // Validate current settings
  const validateSettings = useCallback((): SettingsValidationResult => {
    return settingsService.validateCurrentSettings ?
      settingsService.validateCurrentSettings() :
      { isValid: true, errors: {}, warnings: {} };
  }, []);

  // Refresh settings from storage
  const refreshSettings = useCallback(async (): Promise<void> => {
    settingsService.clearCache();
    await loadSettings();
  }, [loadSettings]);

  const contextValue: SettingsContextType = {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    updateSettings,
    dispatch,
    getCategorySettings,
    updateCategorySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    validateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Utility hooks for common settings
export const useSiteIdentity = () => {
  const { getCategorySettings, updateCategorySettings } = useSettings();
  const siteIdentity = getCategorySettings('general').siteIdentity;

  const updateSiteIdentity = (updates: Partial<typeof siteIdentity>) => {
    return updateCategorySettings('general', { siteIdentity: { ...siteIdentity, ...updates } });
  };

  return { siteIdentity, updateSiteIdentity };
};

export const useSEOSettings = () => {
  const { getCategorySettings, updateCategorySettings } = useSettings();
  const seoSettings = getCategorySettings('seoAnalytics');

  const updateSEOSettings = (updates: Partial<typeof seoSettings>) => {
    return updateCategorySettings('seoAnalytics', updates);
  };

  return { seoSettings, updateSEOSettings };
};

export const useContentSettings = () => {
  const { getCategorySettings, updateCategorySettings } = useSettings();
  const contentSettings = getCategorySettings('contentPublishing');

  const updateContentSettings = (updates: Partial<typeof contentSettings>) => {
    return updateCategorySettings('contentPublishing', updates);
  };

  return { contentSettings, updateContentSettings };
};

export const useUserManagementSettings = () => {
  const { getCategorySettings, updateCategorySettings } = useSettings();
  const userSettings = getCategorySettings('userManagement');

  const updateUserSettings = (updates: Partial<typeof userSettings>) => {
    return updateCategorySettings('userManagement', updates);
  };

  return { userSettings, updateUserSettings };
};

export const useSecuritySettings = () => {
  const { getCategorySettings, updateCategorySettings } = useSettings();
  const securitySettings = getCategorySettings('securityPrivacy');

  const updateSecuritySettings = (updates: Partial<typeof securitySettings>) => {
    return updateCategorySettings('securityPrivacy', updates);
  };

  return { securitySettings, updateSecuritySettings };
};