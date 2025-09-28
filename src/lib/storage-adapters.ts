interface IStorageAdapter {
  upload(file: File, folder?: string): Promise<{ url: string; id: string; metadata?: any }>;
  get(fileId: string): Promise<{ url: string; data?: any }>;
  delete(fileId: string): Promise<boolean>;
  list(folder?: string, limit?: number): Promise<{ files: { id: string; url: string; name: string; size: number }[]; hasMore: boolean }>;
}

// LocalStorageAdapter for development - uses IndexedDB for better file handling
class LocalStorageAdapter implements IStorageAdapter {
  private dbName = 'cms-media-db';
  private storeName = 'files';
  private db?: IDBDatabase;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('folder', 'folder', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  async upload(file: File, folder?: string): Promise<{ url: string; id: string; metadata?: any }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = crypto.randomUUID();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const metadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          folder: folder || null,
        };
        
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ id, data: arrayBuffer, metadata });
        
        request.onsuccess = () => resolve({ url: `/local-media/${id}`, id, metadata });
        request.onerror = () => reject(request.error);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async get(fileId: string): Promise<{ url: string; data?: any }> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileId);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          const blob = new Blob([result.data], { type: result.metadata.type });
          resolve({ 
            url: URL.createObjectURL(blob), 
            data: { ...result.metadata, blob } 
          });
        } else {
          resolve({ url: `/local-media/${fileId}`, data: null });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(fileId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fileId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async list(folder?: string, limit: number = 20): Promise<{ files: { id: string; url: string; name: string; size: number }[]; hasMore: boolean }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allFiles: any[] = [];
    let cursor: IDBCursorWithValue | null = null;
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('folder');
      const request = folder ? index.openCursor(IDBKeyRange.only(folder)) : store.openCursor();
      
      request.onsuccess = (event) => {
        cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const file = cursor.value as any;
          allFiles.push({
            id: file.id,
            url: `/local-media/${file.id}`,
            name: file.metadata.name,
            size: file.metadata.size
          });
          cursor.continue();
        } else {
          const sliced = allFiles.slice(0, limit);
          resolve({ files: sliced, hasMore: allFiles.length > limit });
        }
      };
      
      request.onerror = () => resolve({ files: [], hasMore: false });
    });
  }
}

// Stub for SupabaseStorageAdapter - will be implemented when Supabase is integrated
class SupabaseStorageAdapter implements IStorageAdapter {
  async upload(file: File, folder?: string): Promise<{ url: string; id: string; metadata?: any }> {
    throw new Error('SupabaseStorageAdapter not implemented. Use for production with Supabase.');
  }

  async get(fileId: string): Promise<{ url: string; data?: any }> {
    throw new Error('SupabaseStorageAdapter not implemented.');
  }

  async delete(fileId: string): Promise<boolean> {
    throw new Error('SupabaseStorageAdapter not implemented.');
  }

  async list(folder?: string, limit?: number): Promise<{ files: { id: string; url: string; name: string; size: number }[]; hasMore: boolean }> {
    throw new Error('SupabaseStorageAdapter not implemented.');
  }
}

// Provider or factory to switch adapters
export const createStorageAdapter = (type: 'local' | 'supabase' = 'local'): IStorageAdapter => {
  switch (type) {
    case 'local':
      return new LocalStorageAdapter();
    case 'supabase':
      return new SupabaseStorageAdapter();
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
};

export type { IStorageAdapter };