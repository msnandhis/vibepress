import {
  MediaItem,
  MediaFolder,
  MediaFilters,
  MediaListResponse,
  MediaStats,
  MediaUploadOptions,
  MediaEditOptions,
  MediaFolderCreate,
  MediaFolderUpdate,
  MediaType,
  getMediaType,
  formatFileSize,
  getFileExtension
} from '@/types/media';
import { indexedDB } from './storage';

class MediaService {
  private readonly storeName = 'media';
  private readonly foldersStoreName = 'media_folders';

  // Get media items with filtering and pagination
  async getMedia(filters: MediaFilters = {}, page = 1, limit = 20): Promise<MediaListResponse> {
    try {
      // Get all media from IndexedDB
      const allMedia = await indexedDB.getAll(this.storeName) as MediaItem[];

      // Apply filters
      let filteredMedia = allMedia;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMedia = filteredMedia.filter(item =>
          item.filename.toLowerCase().includes(searchLower) ||
          item.title?.toLowerCase().includes(searchLower) ||
          item.altText?.toLowerCase().includes(searchLower) ||
          item.caption?.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filters.type && filters.type !== 'all') {
        filteredMedia = filteredMedia.filter(item => getMediaType(item.mimeType) === filters.type);
      }

      if (filters.folderId !== undefined) {
        filteredMedia = filteredMedia.filter(item => item.folderId === filters.folderId);
      }

      if (filters.authorId) {
        filteredMedia = filteredMedia.filter(item => item.authorId === filters.authorId);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredMedia = filteredMedia.filter(item =>
          filters.tags!.some(tag => item.tags.includes(tag))
        );
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredMedia = filteredMedia.filter(item =>
          new Date(item.uploadedAt) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredMedia = filteredMedia.filter(item =>
          new Date(item.uploadedAt) <= toDate
        );
      }

      if (filters.size) {
        if (filters.size.min) {
          filteredMedia = filteredMedia.filter(item => item.size >= filters.size.min!);
        }
        if (filters.size.max) {
          filteredMedia = filteredMedia.filter(item => item.size <= filters.size.max!);
        }
      }

      if (filters.mimeType) {
        filteredMedia = filteredMedia.filter(item => item.mimeType === filters.mimeType);
      }

      if (filters.status) {
        filteredMedia = filteredMedia.filter(item => item.status === filters.status);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'uploadedAt';
      const sortOrder = filters.sortOrder || 'desc';

      filteredMedia.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle dates
        if (sortBy === 'uploadedAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Apply pagination
      const total = filteredMedia.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMedia = filteredMedia.slice(startIndex, endIndex);

      // Enrich with author and folder data
      const enrichedMedia = await Promise.all(
        paginatedMedia.map(async (item) => {
          const author = await indexedDB.get('users', item.authorId);
          const folder = item.folderId ?
            await indexedDB.get(this.foldersStoreName, item.folderId) : null;

          return {
            ...item,
            author,
            folder,
          };
        })
      );

      return {
        items: enrichedMedia,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting media:', error);
      throw new Error('Failed to fetch media');
    }
  }

  // Get a single media item by ID
  async getMediaItem(id: string): Promise<MediaItem | null> {
    try {
      const item = await indexedDB.get(this.storeName, id) as MediaItem;
      if (!item) return null;

      // Enrich with related data
      const author = await indexedDB.get('users', item.authorId);
      const folder = item.folderId ?
        await indexedDB.get(this.foldersStoreName, item.folderId) : null;

      return {
        ...item,
        author,
        folder,
      };
    } catch (error) {
      console.error('Error getting media item:', error);
      throw new Error('Failed to fetch media item');
    }
  }

  // Upload media (simulated - in real app this would upload to a server)
  async uploadMedia(options: MediaUploadOptions): Promise<MediaItem> {
    try {
      const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Simulate upload processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, create object URL for the file
      const url = URL.createObjectURL(options.file);

      // Simulate thumbnail and medium URLs
      const thumbnailUrl = isImageFile(options.file.type) ? url : undefined;
      const mediumUrl = isImageFile(options.file.type) ? url : undefined;

      // Extract dimensions for images
      let width: number | undefined;
      let height: number | undefined;

      if (isImageFile(options.file.type)) {
        width = 800; // Simulated
        height = 600; // Simulated
      }

      const mediaItem: MediaItem = {
        id,
        filename: options.file.name,
        originalFilename: options.file.name,
        title: options.title || options.file.name.split('.')[0],
        altText: options.altText || '',
        caption: options.caption || '',
        description: options.description || '',
        mimeType: options.file.type,
        size: options.file.size,
        width,
        height,
        url,
        thumbnailUrl,
        mediumUrl,
        authorId: 'current_user_id', // This should come from auth context
        folderId: options.folderId,
        tags: options.tags || [],
        status: 'ready',
        uploadedAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.storeName, mediaItem);

      return mediaItem;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Update media item
  async updateMedia(id: string, updates: Partial<MediaEditOptions>): Promise<MediaItem> {
    try {
      const existingItem = await this.getMediaItem(id);
      if (!existingItem) {
        throw new Error('Media item not found');
      }

      const updatedItem: MediaItem = {
        ...existingItem,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.storeName, updatedItem);

      return updatedItem;
    } catch (error) {
      console.error('Error updating media:', error);
      throw new Error('Failed to update media');
    }
  }

  // Delete media item
  async deleteMedia(id: string): Promise<void> {
    try {
      const item = await this.getMediaItem(id);
      if (item) {
        // Revoke object URL to prevent memory leaks
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      }
      await indexedDB.remove(this.storeName, id);
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  }

  // Get media folders
  async getFolders(): Promise<MediaFolder[]> {
    try {
      const folders = await indexedDB.getAll(this.foldersStoreName) as MediaFolder[];
      return folders;
    } catch (error) {
      console.error('Error getting folders:', error);
      return [];
    }
  }

  // Get folder hierarchy
  async getFolderHierarchy(): Promise<MediaFolder[]> {
    try {
      const allFolders = await indexedDB.getAll(this.foldersStoreName) as MediaFolder[];
      const topLevelFolders = allFolders.filter(folder => !folder.parentId);

      const buildHierarchy = (folders: MediaFolder[], parentId?: string): MediaFolder[] => {
        return folders
          .filter(folder => folder.parentId === parentId)
          .map(folder => ({
            ...folder,
            children: buildHierarchy(folders, folder.id)
          }));
      };

      return buildHierarchy(topLevelFolders);
    } catch (error) {
      console.error('Error getting folder hierarchy:', error);
      throw new Error('Failed to fetch folder hierarchy');
    }
  }

  // Create folder
  async createFolder(folderData: MediaFolderCreate): Promise<MediaFolder> {
    try {
      const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const folder: MediaFolder = {
        ...folderData,
        id,
        slug: folderData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        itemCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.foldersStoreName, folder);

      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  // Update folder
  async updateFolder(id: string, updates: MediaFolderUpdate): Promise<MediaFolder> {
    try {
      const existingFolder = await indexedDB.get(this.foldersStoreName, id) as MediaFolder;
      if (!existingFolder) {
        throw new Error('Folder not found');
      }

      const updatedFolder: MediaFolder = {
        ...existingFolder,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      // Update slug if name changed
      if (updates.name && updates.name !== existingFolder.name) {
        updatedFolder.slug = updates.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      }

      await indexedDB.set(this.foldersStoreName, updatedFolder);

      return updatedFolder;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw new Error('Failed to update folder');
    }
  }

  // Delete folder
  async deleteFolder(id: string): Promise<void> {
    try {
      // Check if folder has items
      const itemsInFolder = await this.getMedia({ folderId: id });
      if (itemsInFolder.pagination.total > 0) {
        throw new Error('Cannot delete folder that contains media items');
      }

      // Check if folder has subfolders
      const subfolders = await this.getFolders();
      const hasSubfolders = subfolders.some(folder => folder.parentId === id);
      if (hasSubfolders) {
        throw new Error('Cannot delete folder that contains subfolders');
      }

      await indexedDB.remove(this.foldersStoreName, id);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  }

  // Get media statistics
  async getMediaStats(): Promise<MediaStats> {
    try {
      const allMedia = await indexedDB.getAll(this.storeName) as MediaItem[];
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: MediaStats = {
        totalItems: allMedia.length,
        totalSize: allMedia.reduce((sum, item) => sum + item.size, 0),
        images: allMedia.filter(item => isImageFile(item.mimeType)).length,
        videos: allMedia.filter(item => getMediaType(item.mimeType) === 'video').length,
        audio: allMedia.filter(item => getMediaType(item.mimeType) === 'audio').length,
        documents: allMedia.filter(item => getMediaType(item.mimeType) === 'document').length,
        thisMonth: {
          items: allMedia.filter(item => new Date(item.uploadedAt) >= thisMonth).length,
          size: allMedia
            .filter(item => new Date(item.uploadedAt) >= thisMonth)
            .reduce((sum, item) => sum + item.size, 0),
        },
        thisWeek: {
          items: allMedia.filter(item => new Date(item.uploadedAt) >= thisWeek).length,
          size: allMedia
            .filter(item => new Date(item.uploadedAt) >= thisWeek)
            .reduce((sum, item) => sum + item.size, 0),
        },
        storageUsed: allMedia.reduce((sum, item) => sum + item.size, 0),
        storageLimit: 1024 * 1024 * 1024 * 10, // 10GB limit
      };

      return stats;
    } catch (error) {
      console.error('Error getting media stats:', error);
      throw new Error('Failed to fetch media stats');
    }
  }

  // Bulk operations
  async bulkDeleteMedia(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deleteMedia(id))
      );
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw new Error('Failed to bulk delete media');
    }
  }

  async bulkUpdateMedia(ids: string[], updates: Partial<MediaEditOptions>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updateMedia(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to bulk update media');
    }
  }

  // Get available tags
  async getAvailableTags(): Promise<string[]> {
    try {
      const allMedia = await indexedDB.getAll(this.storeName) as MediaItem[];
      const allTags = allMedia.flatMap(item => item.tags);
      return [...new Set(allTags)].sort();
    } catch (error) {
      console.error('Error getting available tags:', error);
      return [];
    }
  }
}

// Helper functions
function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Export singleton instance
export const mediaService = new MediaService();