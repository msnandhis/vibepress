import { useCallback, useEffect, useRef } from 'react';
import { indexedDB, localStorage } from './storage';

interface AutosaveOptions {
  key: string;
  debounceMs?: number;
  storageType?: 'indexedDB' | 'localStorage';
}

interface AutosaveData {
  id?: string;
  title: string;
  content: any;
  excerpt?: string;
  lastSaved: string;
}

export class AutosaveManager {
  private static instance: AutosaveManager;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): AutosaveManager {
    if (!AutosaveManager.instance) {
      AutosaveManager.instance = new AutosaveManager();
    }
    return AutosaveManager.instance;
  }

  private constructor() {}

  async save(key: string, data: AutosaveData, options: AutosaveOptions): Promise<void> {
    const { storageType = 'indexedDB' } = options;

    const autosaveData = {
      ...data,
      lastSaved: new Date().toISOString(),
    };

    try {
      if (storageType === 'indexedDB') {
        await indexedDB.set('autosave', { id: key, ...autosaveData });
      } else {
        localStorage.set(`autosave_${key}`, autosaveData);
      }
    } catch (error) {
      console.error('Failed to autosave:', error);
    }
  }

  async load(key: string, storageType: 'indexedDB' | 'localStorage' = 'indexedDB'): Promise<AutosaveData | null> {
    try {
      if (storageType === 'indexedDB') {
        const data = await indexedDB.get('autosave', key);
        return data || null;
      } else {
        return localStorage.get(`autosave_${key}`) || null;
      }
    } catch (error) {
      console.error('Failed to load autosave:', error);
      return null;
    }
  }

  async clear(key: string, storageType: 'indexedDB' | 'localStorage' = 'indexedDB'): Promise<void> {
    try {
      if (storageType === 'indexedDB') {
        await indexedDB.remove('autosave', key);
      } else {
        localStorage.remove(`autosave_${key}`);
      }
    } catch (error) {
      console.error('Failed to clear autosave:', error);
    }
  }

  debounce(key: string, callback: () => void, delay: number): void {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(callback, delay);
    this.timers.set(key, timer);
  }

  clearTimer(key: string): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }
}

// Hook for using autosave in React components
export function useAutosave(data: AutosaveData, options: AutosaveOptions) {
  const autosaveManager = useRef(AutosaveManager.getInstance());
  const { key, debounceMs = 2000, storageType = 'indexedDB' } = options;

  const saveData = useCallback(async () => {
    await autosaveManager.current.save(key, data, options);
  }, [key, data, options]);

  const debouncedSave = useCallback(() => {
    autosaveManager.current.debounce(key, saveData, debounceMs);
  }, [key, saveData, debounceMs]);

  // Auto-save when data changes
  useEffect(() => {
    if (data.title || data.content) {
      debouncedSave();
    }
  }, [data.title, data.content, data.excerpt, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autosaveManager.current.clearTimer(key);
    };
  }, [key]);

  const loadAutosave = useCallback(async (): Promise<AutosaveData | null> => {
    return await autosaveManager.current.load(key, storageType);
  }, [key, storageType]);

  const clearAutosave = useCallback(async (): Promise<void> => {
    await autosaveManager.current.clear(key, storageType);
  }, [key, storageType]);

  return {
    loadAutosave,
    clearAutosave,
    saveNow: saveData,
  };
}

// Utility for checking if there are any pending autosaves
export async function getAutosaveKeys(): Promise<string[]> {
  try {
    const autosaves = await indexedDB.getAll('autosave');
    return autosaves.map((item: any) => item.id);
  } catch (error) {
    console.error('Failed to get autosave keys:', error);
    return [];
  }
}

// Utility to get autosave timestamp
export async function getAutosaveTimestamp(key: string): Promise<string | null> {
  try {
    const data = await AutosaveManager.getInstance().load(key);
    return data?.lastSaved || null;
  } catch (error) {
    console.error('Failed to get autosave timestamp:', error);
    return null;
  }
}