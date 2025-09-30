// Local storage utilities for offline-first CMS
// This will be replaced with Supabase when integrated

export interface StorageConfig {
  prefix: string;
  version: string;
}

class LocalStorage {
  private prefix: string;

  constructor(config: StorageConfig = { prefix: 'vibepress_', version: '1.0' }) {
    this.prefix = `${config.prefix}${config.version}_`;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue || null;

      const parsed = JSON.parse(item);

      // Check if the data has expired
      if (parsed.expires && parsed.expires < Date.now()) {
        this.remove(key);
        return defaultValue || null;
      }

      return parsed.data;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expires: ttl ? Date.now() + ttl : null,
      };

      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);

      // If localStorage is full, try to clear some space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearExpired();
        // Try one more time
        try {
          localStorage.setItem(this.getKey(key), JSON.stringify(item));
        } catch (retryError) {
          console.error(`Failed to set ${key} after clearing expired items:`, retryError);
        }
      }
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  clearExpired(): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.expires && item.expires < Date.now()) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing expired localStorage items:', error);
    }
  }

  getAllKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }

    return keys;
  }
}

// IndexedDB for larger data storage
class IndexedDBStorage {
  private dbName: string;
  private version: number;

  constructor(dbName = 'vibepress_cms', version = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Create object stores
        if (!db.objectStoreNames.contains('posts')) {
          const postsStore = db.createObjectStore('posts', { keyPath: 'id' });
          postsStore.createIndex('status', 'status', { unique: false });
          postsStore.createIndex('authorId', 'authorId', { unique: false });
          postsStore.createIndex('createdAt', 'createdAt', { unique: false });
          postsStore.createIndex('publishedAt', 'publishedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('filename', 'filename', { unique: false });
          mediaStore.createIndex('mimeType', 'mimeType', { unique: false });
          mediaStore.createIndex('authorId', 'authorId', { unique: false });
          mediaStore.createIndex('folderId', 'folderId', { unique: false });
          mediaStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
          mediaStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('media_folders')) {
          const foldersStore = db.createObjectStore('media_folders', { keyPath: 'id' });
          foldersStore.createIndex('name', 'name', { unique: false });
          foldersStore.createIndex('slug', 'slug', { unique: false });
          foldersStore.createIndex('parentId', 'parentId', { unique: false });
          foldersStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('slug', 'slug', { unique: true });
          categoriesStore.createIndex('parentId', 'parentId', { unique: false });
        }

        if (!db.objectStoreNames.contains('tags')) {
          const tagsStore = db.createObjectStore('tags', { keyPath: 'id' });
          tagsStore.createIndex('slug', 'slug', { unique: true });
        }

        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async get(storeName: string, key: string): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string, query?: IDBKeyRange | null, count?: number): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll(query, count);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(storeName: string, data: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(storeName: string, key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async query(storeName: string, indexName: string, key: any): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

// Export storage instances
export const localStorage = new LocalStorage();
export const indexedDB = new IndexedDBStorage();

// Migration helper for when we switch to Supabase
export class StorageMigration {
  static async migrateToSupabase(supabase: any): Promise<void> {
    // This will be implemented when we integrate Supabase
    console.log('Storage migration to Supabase will be implemented here');
  }
}