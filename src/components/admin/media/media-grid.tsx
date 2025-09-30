'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaItem, getMediaType, formatFileSize } from '@/types/media';
import {
  Image,
  Film,
  Music,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Tag,
  Calendar,
  User,
  Folder,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface MediaGridProps {
  items: MediaItem[];
  selectedItems: string[];
  onSelectItem: (itemId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<MediaItem>) => void;
  viewMode: 'grid' | 'list';
  loading?: boolean;
}

export function MediaGrid({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onDeleteItem,
  onUpdateItem,
  viewMode,
  loading = false
}: MediaGridProps) {
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    altText: '',
    caption: '',
    description: '',
    tags: ''
  });

  const getMediaIcon = (mimeType: string) => {
    const type = getMediaType(mimeType);
    const iconClass = "h-8 w-8";

    switch (type) {
      case 'image':
        return <Image className={iconClass} />;
      case 'video':
        return <Film className={iconClass} />;
      case 'audio':
        return <Music className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      altText: item.altText || '',
      caption: item.caption || '',
      description: item.description || '',
      tags: item.tags.join(', ')
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    onUpdateItem(editingItem.id, {
      title: editForm.title.trim() || undefined,
      altText: editForm.altText.trim() || undefined,
      caption: editForm.caption.trim() || undefined,
      description: editForm.description.trim() || undefined,
      tags: editForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    });

    setEditingItem(null);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You might want to show a toast notification here
  };

  const handleDownload = (item: MediaItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div
      className={`relative group border rounded-lg overflow-hidden transition-all hover:shadow-md ${
        selectedItems.includes(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
    >
      {/* Image/Preview */}
      <div className="aspect-square bg-muted flex items-center justify-center relative">
        {getMediaType(item.mimeType) === 'image' && item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.altText || item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground">
            {getMediaIcon(item.mimeType)}
          </div>
        )}

        {/* Selection checkbox */}
        <Checkbox
          checked={selectedItems.includes(item.id)}
          onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
          className="absolute top-2 left-2 bg-background"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Actions dropdown */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPreviewItem(item)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyUrl(item.url)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(item)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteItem(item.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreviewItem(item)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Info */}
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
        {item.width && item.height && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.width} × {item.height}
          </p>
        )}
      </div>
    </div>
  );

  const MediaListItem = ({ item }: { item: MediaItem }) => (
    <div
      className={`flex items-center gap-4 p-4 border rounded-lg transition-all hover:bg-muted/50 ${
        selectedItems.includes(item.id) ? 'bg-primary/5 border-primary' : ''
      }`}
    >
      <Checkbox
        checked={selectedItems.includes(item.id)}
        onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
      />

      {/* Thumbnail */}
      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
        {getMediaType(item.mimeType) === 'image' && item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.altText || item.title}
            className="w-full h-full object-cover rounded"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground">
            {getMediaIcon(item.mimeType)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{item.title || item.filename}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
              </span>
              <span>{formatFileSize(item.size)}</span>
              {item.width && item.height && (
                <span>{item.width} × {item.height}</span>
              )}
            </div>
            {item.altText && (
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                Alt: {item.altText}
              </p>
            )}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{getMediaType(item.mimeType)}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPreviewItem(item)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyUrl(item.url)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteItem(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          : "space-y-2"
      }>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            {viewMode === 'grid' ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-4 h-4 bg-muted rounded" />
                <div className="w-16 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Selection controls */}
      {items.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={items.length > 0 && selectedItems.length === items.length}
              indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm">
              Select all {selectedItems.length > 0 && `(${selectedItems.length} selected)`}
            </span>
          </label>
        </div>
      )}

      {/* Media grid */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          : "space-y-2"
      }>
        {items.map(item => (
          viewMode === 'grid' ? (
            <MediaCard key={item.id} item={item} />
          ) : (
            <MediaListItem key={item.id} item={item} />
          )
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Media Details</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter a title for this media"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="altText" className="text-right">
                  Alt Text
                </Label>
                <Input
                  id="altText"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  className="col-span-3"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="caption" className="text-right">
                  Caption
                </Label>
                <Input
                  id="caption"
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  className="col-span-3"
                  placeholder="Add a caption"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Add a detailed description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{previewItem.title || previewItem.filename}</DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-64">
                  {getMediaType(previewItem.mimeType) === 'image' ? (
                    <img
                      src={previewItem.url}
                      alt={previewItem.altText || previewItem.title}
                      className="max-w-full max-h-96 object-contain rounded"
                    />
                  ) : getMediaType(previewItem.mimeType) === 'video' ? (
                    <video
                      src={previewItem.url}
                      controls
                      className="max-w-full max-h-96 rounded"
                    />
                  ) : getMediaType(previewItem.mimeType) === 'audio' ? (
                    <audio src={previewItem.url} controls className="w-full" />
                  ) : (
                    <div className="text-center">
                      <div className="text-muted-foreground mb-4">
                        {getMediaIcon(previewItem.mimeType)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getMediaType(previewItem.mimeType)} file
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(previewItem.url)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewItem)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewItem.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">File Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filename:</span>
                      <span className="font-mono">{previewItem.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatFileSize(previewItem.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{getMediaType(previewItem.mimeType)}</Badge>
                    </div>
                    {previewItem.width && previewItem.height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{previewItem.width} × {previewItem.height}px</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{format(new Date(previewItem.uploadedAt), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>

                {previewItem.altText && (
                  <div>
                    <h4 className="font-medium mb-2">Alt Text</h4>
                    <p className="text-sm text-muted-foreground">{previewItem.altText}</p>
                  </div>
                )}

                {previewItem.caption && (
                  <div>
                    <h4 className="font-medium mb-2">Caption</h4>
                    <p className="text-sm text-muted-foreground">{previewItem.caption}</p>
                  </div>
                )}

                {previewItem.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{previewItem.description}</p>
                  </div>
                )}

                {previewItem.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewItem.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}