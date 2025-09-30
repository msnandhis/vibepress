# VibePress CMS Implementation Plan

## Current Codebase Analysis

### Technology Stack
- **Framework**: Next.js 15.3.5 with React 19
- **Styling**: Tailwind CSS v4 with custom theme system
- **UI Components**: Radix UI + shadcn/ui components
- **Editor**: TipTap (already integrated)
- **State Management**: React hooks + localStorage
- **Authentication**: Custom auth system with Bearer tokens
- **Icons**: Lucide React + Heroicons

### Existing Structure
```
src/
├── app/
│   ├── page.tsx (Homepage with news sections)
│   ├── blog/[slug]/page.tsx (Blog post view)
│   ├── admin/
│   │   ├── layout.tsx (Admin dashboard layout)
│   │   ├── dashboard/page.tsx
│   │   ├── posts/page.tsx (Posts listing)
│   │   ├── pages/page.tsx (Pages listing)
│   │   ├── media/page.tsx (Media library)
│   │   ├── users/page.tsx (User management)
│   │   ├── comments/page.tsx
│   │   ├── themes/page.tsx
│   │   └── posts/new/page.tsx, posts/[id]/edit/page.tsx, etc.
│   └── sign-in, sign-up pages
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── sections/ (Homepage sections: hero-carousel, recent-articles, etc.)
│   ├── ui/editor.tsx (TipTap editor component)
│   └── ui/admin-card.tsx
├── context/
│   └── theme-provider.tsx (Advanced theme system)
└── lib/
    ├── auth-client.ts
    ├── utils.ts
    ├── storage-adapters.ts
    └── hooks/
```

### Key Features Already Implemented
- ✅ Admin dashboard with sidebar navigation
- ✅ Advanced theme system with custom colors, typography, spacing
- ✅ TipTap rich text editor
- ✅ Basic posts/pages listing with CRUD operations
- ✅ Authentication system
- ✅ Responsive design
- ✅ Dark/light mode support

## Implementation Plan

### 1. Enhanced Global Styles & Theme System

**Priority**: High | **Est. Time**: 1-2 days

#### Tasks:
1. **CSS Variables System**
   - Create comprehensive CSS variables for all design tokens
   - Implement consistent spacing scale (4px base)
   - Define color palettes for light/dark modes
   - Typography scales with proper line heights

2. **Component Design System**
   - Standardize button variants and sizes
   - Create consistent card patterns
   - Implement form input styles
   - Design loading states and empty states

3. **Responsive Breakpoints**
   - Define consistent breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px)
   - Mobile-first approach with progressive enhancement
   - Touch-friendly interface elements

#### File Structure:
```
src/
├── styles/
│   ├── globals.css (main styles)
│   ├── themes.css (theme-specific styles)
│   └── components.css (component-specific styles)
├── types/
│   └── theme.ts (Theme type definitions)
└── lib/
    ├── theme-utils.ts (Theme helper functions)
    └── css-variables.ts (CSS variable definitions)
```

### 2. Posts Management System

**Priority**: High | **Est. Time**: 3-4 days

#### Features to Implement:

**A. Posts List Page Enhancements**
- Bulk selection with checkboxes
- Advanced filtering (author, date range, categories, tags)
- Column sorting (title, date, author, views)
- Quick actions dropdown
- Status bulk operations (publish, unpublish, archive, delete)
- Export functionality (CSV, JSON)

**B. Post Editor**
- Tabbed interface: Content | SEO | Organization
- TipTap editor with extensions:
  - Image upload and management
  - Embed support (YouTube, Twitter, etc.)
  - Code blocks with syntax highlighting
  - Table support
  - Custom blocks (quotes, callouts)
- Autosave functionality (localStorage + IndexedDB)
- Scheduled publishing with timezone picker
- Slug generation and validation
- Featured image upload and cropping
- Excerpt generation
- Revision history

**C. SEO Tab**
- Meta title and description
- Open Graph tags
- Twitter Cards
- Canonical URL
- Focus keyword
- SEO preview

**D. Organization Tab**
- Category selection with hierarchy
- Tag management with autocomplete
- Author assignment
- Featured post toggle
- Post template selection

#### File Structure:
```
src/
├── app/admin/posts/
│   ├── new/
│   │   └── page.tsx (Create new post)
│   ├── [id]/
│   │   ├── edit/
│   │   │   ├── page.tsx (Edit post)
│   │   │   ├── content-tab.tsx
│   │   │   ├── seo-tab.tsx
│   │   │   └── organization-tab.tsx
│   └── page.tsx (Posts list)
├── components/admin/posts/
│   ├── post-list.tsx
│   ├── post-editor.tsx
│   ├── post-filters.tsx
│   ├── post-seo-panel.tsx
│   ├── post-organization-panel.tsx
│   └── scheduled-publishing.tsx
└── lib/
    ├── posts-utils.ts
    ├── autosave.ts
    └── slug-generator.ts
```

### 3. Pages Management System

**Priority**: High | **Est. Time**: 2-3 days

#### Features to Implement:
- Hierarchical page structure (parent/child relationships)
- Drag-and-drop page ordering
- Page templates (default, full-width, landing page, etc.)
- Page-specific SEO settings
- Static content blocks (header, footer, sidebar)
- Menu integration
- Page status (draft, published, password-protected)

#### File Structure:
```
src/
├── app/admin/pages/
│   ├── new/
│   │   └── page.tsx
│   ├── [id]/
│   │   ├── edit/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── page.tsx
├── components/admin/pages/
│   ├── page-tree.tsx
│   ├── page-editor.tsx
│   ├── page-templates.tsx
│   └── page-ordering.tsx
```

### 4. Media Library

**Priority**: Medium | **Est. Time**: 3-4 days

#### Features to Implement:
- Drag-and-drop file upload
- Grid/List view toggle
- Folder organization
- Image editing (crop, resize, filters)
- Alt text and metadata editing
- Search and filtering
- Bulk operations
- Image compression
- File type restrictions
- Storage optimization

#### File Structure:
```
src/
├── app/admin/media/
│   ├── upload/
│   │   └── page.tsx
│   └── page.tsx
├── components/admin/media/
│   ├── media-grid.tsx
│   ├── media-list.tsx
│   ├── upload-zone.tsx
│   ├── image-editor.tsx
│   └── media-filters.tsx
└── lib/
    ├── media-utils.ts
    ├── image-processor.ts
    └── file-upload.ts
```

### 5. Categories & Tags Management

**Priority**: Medium | **Est. Time**: 2 days

#### Features to Implement:
- Hierarchical categories (parent/child)
- Tag management with autocomplete
- Color coding for categories
- Usage statistics
- Bulk operations (merge, delete, reassign)
- Slug generation
- Description and featured images

#### File Structure:
```
src/
├── app/admin/categories/
│   ├── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
├── app/admin/tags/
│   ├── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
├── components/admin/taxonomy/
│   ├── category-tree.tsx
│   ├── tag-manager.tsx
│   └── taxonomy-colors.tsx
```

### 6. User & Role Management

**Priority**: Medium | **Est. Time**: 2-3 days

#### Features to Implement:
- User list with filtering
- Role-based access control (RBAC)
- Permission matrix
- User profiles with avatars
- Activity logging
- User invitations
- Password management
- Session management

#### File Structure:
```
src/
├── app/admin/users/
│   ├── new/
│   │   └── page.tsx
│   ├── [id]/
│   │   ├── edit/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── page.tsx
├── app/admin/roles/
│   ├── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
├── components/admin/users/
│   ├── user-list.tsx
│   ├── role-editor.tsx
│   └── permissions-matrix.tsx
└── lib/
    ├── rbac.ts
    └── permissions.ts
```

### 7. Advanced Settings & Admin Tools

**Priority**: Low | **Est. Time**: 2-3 days

#### Features to Implement:
- Site configuration (title, description, language)
- SEO defaults and templates
- API key management
- Performance settings
- Theme management
- Analytics dashboard
- Backup and export
- Import tools

#### File Structure:
```
src/
├── app/admin/settings/
│   ├── general/
│   │   └── page.tsx
│   ├── seo/
│   │   └── page.tsx
│   ├── performance/
│   │   └── page.tsx
│   └── page.tsx
├── components/admin/settings/
│   ├── site-config.tsx
│   ├── seo-settings.tsx
│   └── performance-settings.tsx
```

### 8. Enhanced TipTap Editor Integration

**Priority**: Medium | **Est. Time**: 2 days

#### Features to Implement:
- Advanced formatting options
- Custom blocks (callouts, testimonials, etc.)
- Media insertion modal
- Template insertion
- Word count and reading time
- Accessibility features
- Collaboration tools (future-ready)

#### File Structure:
```
src/
├── components/editor/
│   ├── tiptap-editor.tsx
│   ├── toolbar.tsx
│   ├── extensions/
│   │   ├── custom-blocks.tsx
│   │   ├── media-embed.tsx
│   │   └── template-insertion.tsx
│   └── modals/
│       ├── media-insertion.tsx
│       └── template-gallery.tsx
```

## Implementation Strategy

### Phase 1: Core Foundation (Week 1)
1. Enhanced global styles and theme system
2. Basic posts management (list, create, edit)
3. TipTap editor enhancements

### Phase 2: Content Management (Week 2)
1. Pages management system
2. Categories and tags
3. Advanced post features (SEO, scheduling)

### Phase 3: Media & Assets (Week 3)
1. Media library implementation
2. File upload and processing
3. Image editing tools

### Phase 4: Administration (Week 4)
1. User and role management
2. Advanced settings
3. Performance optimization

## Technical Considerations

### Data Storage (Local for now, Supabase-ready)
```typescript
// Local storage structure
interface LocalStorage {
  posts: Post[];
  pages: Page[];
  categories: Category[];
  tags: Tag[];
  media: MediaItem[];
  users: User[];
  settings: SiteSettings;
  themes: CustomTheme[];
}

// IndexedDB for large data
const DB_NAME = 'vibepress_cms';
const DB_VERSION = 1;
```

### Performance Optimizations
- Code splitting for admin components
- Lazy loading for heavy features
- Virtual scrolling for large lists
- Image optimization
- Caching strategies

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

### Mobile Responsiveness
- Touch-friendly interface
- Responsive layouts
- Mobile-optimized forms
- Gesture support for drag-and-drop

## Testing Strategy
1. Component unit tests
2. Integration tests for workflows
3. End-to-end testing for critical paths
4. Performance testing
5. Accessibility testing

## Deployment Considerations
- Static export capability
- Environment configuration
- Build optimization
- Asset management

This implementation plan provides a comprehensive roadmap for building a modern, scalable CMS that's ready for Supabase integration while maintaining a consistent, professional design system.