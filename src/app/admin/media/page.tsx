'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { UploadZone } from '@/components/admin/media/upload-zone';
import { MediaGrid } from '@/components/admin/media/media-grid';
import { mediaService } from '@/lib/media-service';
import { MediaItem, MediaFolder, MediaType, MediaView, MediaFilters, formatFileSize, getMediaType } from '@/types/media';
import {
  Plus,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  FolderOpen,
  FolderPlus,
  Grid,
  List,
  Image,
  Film,
  Music,
  FileText,
  HardDrive,
  Calendar,
  Tag,
  MoreHorizontal,
  X,
  Maximize2,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

export default function MediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'filename' | 'size' | 'title'>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<MediaView>('grid');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadData();
  }, [page, typeFilter, folderFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [mediaResponse, foldersData, statsData] = await Promise.all([
        mediaService.getMedia({
          search: searchTerm,
          type: typeFilter,
          folderId: folderFilter === 'all' ? undefined : folderFilter,
          sortBy,
          sortOrder,
        }, page, 24),
        mediaService.getFolderHierarchy(),
        mediaService.getMediaStats()
      ]);

      setMediaItems(mediaResponse.items);
      setPagination(mediaResponse.pagination);
      setFolders(foldersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file =>
        mediaService.uploadMedia({
          file,
          generateThumbnail: true,
          optimizeImage: true,
        })
      );

      await Promise.all(uploadPromises);
      loadData();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await mediaService.createFolder({
        name: newFolderName.trim(),
        parentId: folderFilter === 'all' ? undefined : folderFilter,
      });
      setNewFolderName('');
      setShowFolderModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }

    try {
      await mediaService.bulkDeleteMedia(selectedItems);
      setSelectedItems([]);
      loadData();
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(mediaItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const getMediaIcon = (mimeType: string) => {
    const type = getMediaType(mimeType);
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8" />;
      case 'video':
        return <Film className="h-8 w-8" />;
      case 'audio':
        return <Music className="h-8 w-8" />;
      case 'document':
        return <FileText className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<MediaItem>) => {
    try {
      await mediaService.updateMedia(itemId, updates);
      loadData();
    } catch (error) {
      console.error('Error updating media item:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <LoadingSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage your media files and folders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFolderModal(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{formatFileSize(stats?.storageUsed || 0)}</p>
              </div>
              <div className="text-2xl">
                {Math.round((stats?.storageUsed || 0) / (stats?.storageLimit || 1) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Images</p>
                <p className="text-2xl font-bold">{stats?.images || 0}</p>
              </div>
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats?.thisMonth.items || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media Files</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={(value: MediaType | 'all') => setTypeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadedAt">Date</SelectItem>
                  <SelectItem value="filename">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {selectedItems.length} item(s) selected
              </CardDescription>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement bulk edit
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement bulk download
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {mediaItems.length === 0 ? (
            <EmptyState
              icon={<HardDrive className="h-12 w-12" />}
              title="No media files found"
              description={
                searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by uploading your first media file'
              }
              action={
                !searchTerm && (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                )
              }
            />
          ) : (
            <>
              <MediaGrid
                items={mediaItems}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                onDeleteItem={async (itemId) => {
                  await mediaService.deleteMedia(itemId);
                  loadData();
                }}
                onUpdateItem={handleUpdateItem}
                viewMode={viewMode}
                loading={loading}
              />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <UploadZone
                onUpload={async (files) => {
                  await handleFileUpload(files);
                  setShowUploadModal(false);
                }}
                onClose={() => setShowUploadModal(false)}
                maxFiles={20}
                maxFileSize={50 * 1024 * 1024} // 50MB
                folderId={folderFilter === 'all' ? undefined : folderFilter}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Folder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowFolderModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Media Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Preview</Label>
                  <div className="mt-2 aspect-square bg-muted rounded-lg flex items-center justify-center">
                    {getMediaType(selectedItem.mimeType) === 'image' ? (
                      <img
                        src={selectedItem.url}
                        alt={selectedItem.altText || selectedItem.title}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        {getMediaIcon(selectedItem.mimeType)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Filename</Label>
                    <p className="font-medium">{selectedItem.filename}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Title</Label>
                    <p className="font-medium">{selectedItem.title || 'No title'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <Badge variant="outline">{getMediaType(selectedItem.mimeType)}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Size</Label>
                    <p className="font-medium">{formatFileSize(selectedItem.size)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Uploaded</Label>
                    <p className="font-medium">
                      {format(new Date(selectedItem.uploadedAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  {selectedItem.width && selectedItem.height && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Dimensions</Label>
                      <p className="font-medium">
                        {selectedItem.width} × {selectedItem.height}px
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {selectedItem.altText && (
                <div>
                  <Label className="text-sm text-muted-foreground">Alt Text</Label>
                  <p className="font-medium">{selectedItem.altText}</p>
                </div>
              )}
              {selectedItem.caption && (
                <div>
                  <Label className="text-sm text-muted-foreground">Caption</Label>
                  <p className="font-medium">{selectedItem.caption}</p>
                </div>
              )}
              {selectedItem.tags.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedItem.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedItem.url);
                    // Add toast notification here
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}