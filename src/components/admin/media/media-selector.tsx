'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { UploadZone } from './upload-zone';
import { mediaService } from '@/lib/media-service';
import { MediaItem, MediaType, getMediaType, formatFileSize } from '@/types/media';
import {
  Search,
  Grid,
  List,
  Upload,
  Image,
  Film,
  Music,
  FileText,
  Check,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  mediaType?: MediaType | 'all';
  title?: string;
  description?: string;
  selectedItems?: MediaItem[];
}

export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  mediaType = 'all',
  title = 'Select Media',
  description = 'Choose media files to insert',
  selectedItems = []
}: MediaSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>(mediaType);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedItems.map(item => item.id)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, searchTerm, typeFilter, currentPage]);

  useEffect(() => {
    setSelectedIds(selectedItems.map(item => item.id));
  }, [selectedItems]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getMedia({
        search: searchTerm,
        type: typeFilter,
        sortBy: 'uploadedAt',
        sortOrder: 'desc'
      }, currentPage, 20);

      setMediaItems(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelectedIds(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
    } else {
      onSelect(item);
      onOpenChange(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(mediaItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleConfirmSelection = () => {
    const selected = mediaItems.filter(item => selectedIds.includes(item.id));
    onSelect(multiple ? selected : selected[0]);
    onOpenChange(false);
  };

  const handleUpload = async (files: File[]) => {
    try {
      await Promise.all(
        files.map(file => mediaService.uploadMedia({
          file,
          generateThumbnail: true,
          optimizeImage: true
        }))
      );

      // Refresh media list
      await loadMedia();

      // Switch back to browse tab
      setActiveTab('browse');
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const getMediaIcon = (mimeType: string) => {
    const type = getMediaType(mimeType);
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'video':
        return <Film className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      case 'document':
        return <FileText className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div
      className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        selectedIds.includes(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={() => handleSelect(item)}
    >
      <div className="aspect-square bg-muted flex items-center justify-center relative">
        {getMediaType(item.mimeType) === 'image' && item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.altText || item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">
            {getMediaIcon(item.mimeType)}
          </div>
        )}

        {/* Selection indicator */}
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selectedIds.includes(item.id)
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-background border-border hover:border-primary'
        }`}>
          {selectedIds.includes(item.id) && <Check className="h-4 w-4" />}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.url, '_blank');
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium truncate" title={item.title || item.filename}>
          {item.title || item.filename}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {formatFileSize(item.size)}
          </p>
          <Badge variant="outline" className="text-xs">
            {getMediaType(item.mimeType)}
          </Badge>
        </div>
      </div>
    </div>
  );

  const MediaListItem = ({ item }: { item: MediaItem }) => (
    <div
      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
        selectedIds.includes(item.id) ? 'bg-primary/5 border-primary' : ''
      }`}
      onClick={() => handleSelect(item)}
    >
      <Checkbox checked={selectedIds.includes(item.id)} readOnly />

      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
        {getMediaType(item.mimeType) === 'image' && item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.altText || item.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="text-muted-foreground">
            {getMediaIcon(item.mimeType)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{item.title || item.filename}</p>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(item.size)} • {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
        </p>
        {item.altText && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Alt: {item.altText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{getMediaType(item.mimeType)}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            window.open(item.url, '_blank');
          }}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Media</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

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
            </div>

            {/* Selection Controls */}
            {multiple && mediaItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={mediaItems.length > 0 && selectedIds.length === mediaItems.length}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < mediaItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                    Select all on page
                  </label>
                  {selectedIds.length > 0 && (
                    <span className="text-muted-foreground">
                      {selectedIds.length} selected
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Media Grid/List */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <LoadingSkeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : mediaItems.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-12 w-12" />}
                  title="No media found"
                  description={
                    searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Upload some media files to get started'
                  }
                />
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    : "space-y-2"
                }>
                  {mediaItems.map(item => (
                    viewMode === 'grid' ? (
                      <MediaCard key={item.id} item={item} />
                    ) : (
                      <MediaListItem key={item.id} item={item} />
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <UploadZone
              onUpload={handleUpload}
              maxFiles={10}
              maxFileSize={10 * 1024 * 1024}
              className="min-h-64"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {multiple && (
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedIds.length === 0}
            >
              Select {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}