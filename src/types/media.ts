export interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  authorId: string;
  author?: MediaAuthor;
  folderId?: string;
  folder?: MediaFolder;
  tags: string[];
  status: MediaStatus;
  uploadedAt: string;
  updatedAt: string;
  metadata?: MediaMetadata;
  exif?: MediaExif;
}

export interface MediaAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: MediaFolder;
  children?: MediaFolder[];
  description?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaMetadata {
  duration?: number; // For video/audio
  bitrate?: number;
  codec?: string;
  colorSpace?: string;
  hasTransparency?: boolean;
  dominantColors?: string[];
}

export interface MediaExif {
  make?: string;
  model?: string;
  exposureTime?: number;
  aperture?: number;
  iso?: number;
  focalLength?: number;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  dateTaken?: string;
  orientation?: number;
}

export type MediaStatus = 'processing' | 'ready' | 'failed' | 'deleted';

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

export type MediaView = 'grid' | 'list';

export interface MediaFilters {
  search?: string;
  type?: MediaType | 'all';
  folderId?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  size?: {
    min?: number;
    max?: number;
  };
  mimeType?: string;
  status?: MediaStatus;
  sortBy?: 'uploadedAt' | 'filename' | 'size' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaListResponse {
  items: MediaItem[];
  pagination: MediaPagination;
  filters: MediaFilters;
}

export interface MediaStats {
  totalItems: number;
  totalSize: number;
  images: number;
  videos: number;
  audio: number;
  documents: number;
  thisMonth: {
    items: number;
    size: number;
  };
  thisWeek: {
    items: number;
    size: number;
  };
  storageUsed: number;
  storageLimit: number;
}

export interface MediaUploadOptions {
  file: File;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: string;
  tags?: string[];
  generateThumbnail?: boolean;
  optimizeImage?: boolean;
  watermark?: boolean;
}

export interface MediaEditOptions {
  id: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: string;
  tags?: string[];
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  filters?: Array<{
    type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sharpen';
    value: number;
  }>;
}

export interface MediaFolderCreate {
  name: string;
  parentId?: string;
  description?: string;
}

export interface MediaFolderUpdate {
  name?: string;
  parentId?: string;
  description?: string;
}

// Utility functions
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/rtf',
  ];
  return documentTypes.includes(mimeType);
}