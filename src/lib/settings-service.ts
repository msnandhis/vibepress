import {
  SiteSettings,
  defaultSiteSettings,
  SettingsUpdateAction,
  validateSettings,
  SettingsValidationResult,
  SettingsExport,
  getSettingByPath,
  setSettingByPath,
} from '@/types/settings';
import { indexedDB, localStorage } from './storage';

class SettingsService {
  private readonly storeName = 'settings';
  private readonly localStorageKey = 'vibepress_settings';
  private cache: SiteSettings | null = null;

  // Get all settings with fallback to defaults
  async getSettings(): Promise<SiteSettings> {
    try {
      // Return cache if available
      if (this.cache) {
        return this.cache;
      }

      // Try to get from IndexedDB first
      let settings = await indexedDB.get(this.storeName, 'site_settings');

      // Fallback to localStorage
      if (!settings) {
        const localSettings = localStorage.get<SiteSettings>(this.localStorageKey);
        if (localSettings) {
          settings = localSettings;
          // Migrate to IndexedDB
          await this.saveSettings(settings);
        }
      }

      // Fallback to defaults
      if (!settings) {
        settings = defaultSiteSettings;
        await this.saveSettings(settings);
      }

      // Merge with defaults to ensure all fields exist (for backward compatibility)
      settings = this.mergeWithDefaults(settings);

      // Cache the settings
      this.cache = settings;

      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      // Return defaults on any error
      return defaultSiteSettings;
    }
  }

  // Get specific setting by path
  async getSetting<T>(path: string): Promise<T> {
    const settings = await this.getSettings();
    return getSettingByPath(settings, path) as T;
  }

  // Update settings
  async updateSettings(updates: Partial<SiteSettings>): Promise<{ success: boolean; validation: SettingsValidationResult }> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = this.deepMerge(currentSettings, updates);

      // Validate settings
      const validation = validateSettings(newSettings);

      if (!validation.isValid) {
        return { success: false, validation };
      }

      await this.saveSettings(newSettings);

      return { success: true, validation };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        success: false,
        validation: {
          isValid: false,
          errors: { general: ['Failed to update settings'] },
          warnings: {},
        },
      };
    }
  }

  // Update specific setting by path
  async updateSetting(path: string, value: any): Promise<{ success: boolean; validation: SettingsValidationResult }> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = setSettingByPath(currentSettings, path, value);

      const validation = validateSettings(newSettings);

      if (!validation.isValid) {
        return { success: false, validation };
      }

      await this.saveSettings(newSettings);

      return { success: true, validation };
    } catch (error) {
      console.error('Error updating setting:', error);
      return {
        success: false,
        validation: {
          isValid: false,
          errors: { [path]: ['Failed to update setting'] },
          warnings: {},
        },
      };
    }
  }

  // Dispatch settings update action (Redux-style)
  async dispatch(action: SettingsUpdateAction): Promise<{ success: boolean; validation: SettingsValidationResult }> {
    try {
      const currentSettings = await this.getSettings();
      let newSettings: SiteSettings;

      switch (action.type) {
        case 'UPDATE_GENERAL':
          newSettings = {
            ...currentSettings,
            general: this.deepMerge(currentSettings.general, action.payload),
          };
          break;

        case 'UPDATE_SEO_ANALYTICS':
          newSettings = {
            ...currentSettings,
            seoAnalytics: this.deepMerge(currentSettings.seoAnalytics, action.payload),
          };
          break;

        case 'UPDATE_USER_MANAGEMENT':
          newSettings = {
            ...currentSettings,
            userManagement: this.deepMerge(currentSettings.userManagement, action.payload),
          };
          break;

        case 'UPDATE_CONTENT_PUBLISHING':
          newSettings = {
            ...currentSettings,
            contentPublishing: this.deepMerge(currentSettings.contentPublishing, action.payload),
          };
          break;

        case 'UPDATE_SECURITY_PRIVACY':
          newSettings = {
            ...currentSettings,
            securityPrivacy: this.deepMerge(currentSettings.securityPrivacy, action.payload),
          };
          break;

        case 'UPDATE_MARKETING_SEO':
          newSettings = {
            ...currentSettings,
            marketingSEO: this.deepMerge(currentSettings.marketingSEO, action.payload),
          };
          break;

        case 'RESET_TO_DEFAULTS':
          newSettings = defaultSiteSettings;
          break;

        case 'IMPORT_SETTINGS':
          newSettings = this.mergeWithDefaults(action.payload);
          break;

        default:
          throw new Error('Invalid action type');
      }

      const validation = validateSettings(newSettings);

      if (!validation.isValid) {
        return { success: false, validation };
      }

      await this.saveSettings(newSettings);

      return { success: true, validation };
    } catch (error) {
      console.error('Error dispatching settings action:', error);
      return {
        success: false,
        validation: {
          isValid: false,
          errors: { general: ['Failed to update settings'] },
          warnings: {},
        },
      };
    }
  }

  // Reset to defaults
  async resetToDefaults(): Promise<void> {
    await this.saveSettings(defaultSiteSettings);
  }

  // Export settings
  async exportSettings(): Promise<SettingsExport> {
    const settings = await this.getSettings();

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
      metadata: {
        siteName: settings.general.siteIdentity.siteTitle,
        exportedBy: 'admin', // This would come from session in a real app
      },
    };
  }

  // Import settings
  async importSettings(settingsExport: SettingsExport): Promise<{ success: boolean; validation: SettingsValidationResult }> {
    try {
      // Validate the import format
      if (!settingsExport.settings || typeof settingsExport.settings !== 'object') {
        return {
          success: false,
          validation: {
            isValid: false,
            errors: { import: ['Invalid settings format'] },
            warnings: {},
          },
        };
      }

      const mergedSettings = this.mergeWithDefaults(settingsExport.settings);
      const validation = validateSettings(mergedSettings);

      if (!validation.isValid) {
        return { success: false, validation };
      }

      await this.saveSettings(mergedSettings);

      return { success: true, validation };
    } catch (error) {
      console.error('Error importing settings:', error);
      return {
        success: false,
        validation: {
          isValid: false,
          errors: { import: ['Failed to import settings'] },
          warnings: {},
        },
      };
    }
  }

  // Validate current settings
  async validateCurrentSettings(): Promise<SettingsValidationResult> {
    const settings = await this.getSettings();
    return validateSettings(settings);
  }

  // Get settings for specific category
  async getCategorySettings<T>(category: keyof SiteSettings): Promise<T> {
    const settings = await this.getSettings();
    return settings[category] as T;
  }

  // Update settings for specific category
  async updateCategorySettings<T>(category: keyof SiteSettings, updates: Partial<T>): Promise<{ success: boolean; validation: SettingsValidationResult }> {
    const currentSettings = await this.getSettings();
    const newSettings = {
      ...currentSettings,
      [category]: this.deepMerge(currentSettings[category], updates),
    };

    const validation = validateSettings(newSettings);

    if (!validation.isValid) {
      return { success: false, validation };
    }

    await this.saveSettings(newSettings);

    return { success: true, validation };
  }

  // Private methods

  private async saveSettings(settings: SiteSettings): Promise<void> {
    try {
      // Save to IndexedDB
      await indexedDB.set(this.storeName, {
        id: 'site_settings',
        ...settings,
        updatedAt: new Date().toISOString(),
      });

      // Backup to localStorage
      localStorage.set(this.localStorageKey, settings);

      // Update cache
      this.cache = settings;

      // Trigger settings change event
      this.notifySettingsChange(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      // At least try to save to localStorage
      localStorage.set(this.localStorageKey, settings);
      this.cache = settings;
      this.notifySettingsChange(settings);
    }
  }

  private mergeWithDefaults(settings: Partial<SiteSettings>): SiteSettings {
    return this.deepMerge(defaultSiteSettings, settings);
  }

  private deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  private notifySettingsChange(settings: SiteSettings): void {
    // Dispatch custom event for settings change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: settings,
      }));
    }
  }

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    this.cache = null;
  }

  // Check if settings exist (for initial setup)
  async hasSettings(): Promise<boolean> {
    try {
      const settings = await indexedDB.get(this.storeName, 'site_settings');
      if (settings) return true;

      const localSettings = localStorage.get<SiteSettings>(this.localStorageKey);
      return !!localSettings;
    } catch {
      return false;
    }
  }

  // Get settings version (for migration purposes)
  async getSettingsVersion(): Promise<string> {
    try {
      const versionData = await indexedDB.get(this.storeName, 'settings_version');
      return versionData?.version || '1.0';
    } catch {
      return '1.0';
    }
  }

  // Migrate settings (for future versions)
  async migrateSettings(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Migrating settings from ${fromVersion} to ${toVersion}`);
    // Migration logic would go here
    await indexedDB.set(this.storeName, {
      id: 'settings_version',
      version: toVersion,
      migratedAt: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

// Settings hook utilities
export function useSettingsValidation() {
  return {
    validateSettings,
    validateEmail: (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    validateUrl: (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    validateHex: (color: string): boolean => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },
    validateSlug: (slug: string): boolean => {
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    },
  };
}