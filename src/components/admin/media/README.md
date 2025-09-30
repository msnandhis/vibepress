# Media Management System

A comprehensive, production-ready media management system for VibePress CMS with advanced features and seamless Supabase integration readiness.

## Features

### ✅ Core Functionality
- **Drag & Drop Upload** - Advanced upload zone with progress tracking
- **Grid/List View** - Flexible viewing modes with responsive design
- **Media Types** - Support for images, videos, audio, and documents
- **Search & Filter** - Real-time search and filtering by type, folder, date
- **Bulk Operations** - Select multiple items for batch operations
- **File Management** - Rename, tag, organize with metadata
- **Folder Organization** - Hierarchical folder structure
- **Preview & Details** - Rich preview modal with file information

### ✅ Advanced Features
- **Progress Tracking** - Real-time upload progress with status indicators
- **File Validation** - Size limits, type restrictions, error handling
- **Image Optimization** - Automatic thumbnail generation
- **Responsive Design** - Mobile-first design with touch-friendly controls
- **Dark/Light Theme** - Seamless theme integration
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### ✅ Developer Experience
- **TypeScript** - Full type safety with comprehensive interfaces
- **Modular Components** - Reusable, composable components
- **Easy Integration** - Simple APIs for posts and pages
- **Local Storage** - IndexedDB for offline-first approach
- **Supabase Ready** - Designed for easy migration to Supabase

## Components

### MediaGrid
Main grid/list component for displaying media items with selection, editing, and preview capabilities.

```tsx
import { MediaGrid } from '@/components/admin/media';

<MediaGrid
  items={mediaItems}
  selectedItems={selectedItems}
  onSelectItem={handleSelectItem}
  onSelectAll={handleSelectAll}
  onDeleteItem={handleDeleteItem}
  onUpdateItem={handleUpdateItem}
  viewMode="grid" // or "list"
  loading={false}
/>
```

### UploadZone
Advanced drag & drop upload component with progress tracking and file validation.

```tsx
import { UploadZone } from '@/components/admin/media';

<UploadZone
  onUpload={handleUpload}
  maxFiles={10}
  maxFileSize={10 * 1024 * 1024} // 10MB
  folderId={currentFolderId}
/>
```

### MediaSelector
Modal component for selecting media in posts and pages.

```tsx
import { MediaSelector } from '@/components/admin/media';

<MediaSelector
  open={showSelector}
  onOpenChange={setShowSelector}
  onSelect={handleMediaSelect}
  multiple={true}
  mediaType="image"
  title="Select Images"
/>
```

### MediaButton & Variants
Convenient button components for triggering media selection.

```tsx
import { ImageButton, MediaButton } from '@/components/admin/media';

// Specific type buttons
<ImageButton onSelect={handleImageSelect} />
<VideoButton onSelect={handleVideoSelect} multiple />

// Generic media button
<MediaButton
  onSelect={handleSelect}
  multiple
  mediaType="all"
  variant="icon"
/>
```

## Usage Examples

### In a Blog Post Editor
```tsx
import { ImageButton } from '@/components/admin/media';

function PostEditor() {
  const handleImageSelect = (images: MediaItem[]) => {
    // Insert images into editor
    images.forEach(image => {
      insertImageToEditor(image.url, image.altText);
    });
  };

  return (
    <div className="editor-toolbar">
      <ImageButton
        onSelect={handleImageSelect}
        multiple
      >
        Add Images
      </ImageButton>
    </div>
  );
}
```

### Featured Image Selection
```tsx
import { MediaSelector } from '@/components/admin/media';

function FeaturedImagePicker() {
  const [showSelector, setShowSelector] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(null);

  return (
    <>
      <Button onClick={() => setShowSelector(true)}>
        {featuredImage ? 'Change' : 'Select'} Featured Image
      </Button>

      <MediaSelector
        open={showSelector}
        onOpenChange={setShowSelector}
        onSelect={(image) => setFeaturedImage(image as MediaItem)}
        mediaType="image"
        title="Select Featured Image"
      />
    </>
  );
}
```

## File Structure

```
src/components/admin/media/
├── index.ts              # Component exports
├── media-grid.tsx        # Main grid/list component
├── upload-zone.tsx       # Drag & drop upload
├── media-selector.tsx    # Selection modal
├── media-button.tsx      # Button components
└── README.md            # This documentation
```

## Theme Integration

The media management system seamlessly integrates with the global theme system:

- **Colors**: Uses CSS variables for consistent theming
- **Dark Mode**: Automatic dark/light mode support
- **Typography**: Follows global font settings
- **Spacing**: Uses consistent spacing scale
- **Animations**: Smooth transitions and loading states

## Performance Features

- **Virtual Scrolling**: Efficient rendering of large media libraries
- **Lazy Loading**: Images load on demand
- **Pagination**: Server-side pagination for large datasets
- **Caching**: IndexedDB for offline-first experience
- **Optimization**: Automatic image compression and thumbnail generation

## Accessibility

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in modals
- **Color Contrast**: WCAG compliant contrast ratios
- **Touch Friendly**: Mobile-optimized touch targets

## Supabase Integration

The system is designed for easy migration to Supabase:

1. **Storage**: Replace IndexedDB calls with Supabase storage
2. **Auth**: Integrate with Supabase Auth for user context
3. **Real-time**: Add real-time updates with Supabase subscriptions
4. **CDN**: Leverage Supabase CDN for optimized delivery

Example migration:
```typescript
// Current: localStorage
await mediaService.uploadMedia(options);

// Future: Supabase
await supabase.storage
  .from('media')
  .upload(path, file);
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Features**: Uses modern APIs with graceful degradation
- **Polyfills**: Minimal polyfills for IndexedDB

This media management system provides a solid foundation for a professional CMS with room for future enhancements and easy Supabase integration.