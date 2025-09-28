# VibePress - Modern Content Management System

## Overview
VibePress is a sophisticated content management system (CMS) built with Next.js 15, designed for modern blogging and content publication. It features a comprehensive admin dashboard, role-based user management, and advanced content editing capabilities.

## Tech Stack

### Core Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Turbopack** for fast development builds

### Database & ORM
- **Turso** (SQLite-based cloud database)
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for schema migrations

### Authentication & Security
- **Better Auth** with email/password authentication
- **Bearer token** plugin support
- **Middleware-based** route protection
- **Role-based access control** (admin, editor, author, contributor, viewer)

### UI & Styling
- **Tailwind CSS** for styling
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Three.js** for 3D effects and visualizations
- **Lucide React** and **Tabler Icons** for iconography

### Content Editing
- **TipTap** rich text editor with extensions:
  - Code blocks with syntax highlighting
  - Image handling
  - Link management
  - Typography enhancements
  - Focus and placeholder extensions

### Additional Libraries
- **Sharp** for image optimization
- **React Hook Form** with Zod validation
- **Sonner** for toast notifications
- **Next Themes** for theme management
- **React Dropzone** for file uploads

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Protected admin dashboard
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── posts/         # Posts management
│   │   ├── pages/         # Pages management
│   │   ├── users/         # User management
│   │   └── ...           # Other admin features
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable UI components
│   ├── sections/        # Page sections (header, footer, etc.)
│   └── ui/             # Base UI components
├── context/             # React context providers
├── db/                  # Database configuration
│   └── schema.ts       # Drizzle schema definitions
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication configuration
│   └── utils.ts        # Helper functions
└── visual-edits/       # Visual editing system
```

## Database Schema

### Core Tables
- **users**: User accounts with role-based permissions
- **sessions**: Authentication session management
- **posts**: Blog posts with content, SEO, and metadata
- **pages**: Static pages with hierarchical structure
- **media**: File uploads with folder organization
- **categories**: Taxonomic categorization
- **tags**: Content tagging system

### Search & Performance
- **posts_search**: Full-text search for posts
- **pages_search**: Full-text search for pages
- **activity_logs**: User activity tracking

### Content Relationships
- **post_categories**: Many-to-many post-category relations
- **post_tags**: Many-to-many post-tag relations

## Key Features

### Content Management
- **Rich Text Editor**: TipTap-based WYSIWYG editor
- **Media Library**: File upload, organization, and management
- **SEO Optimization**: Meta tags, structured data
- **Content Scheduling**: Draft, published, scheduled states
- **Hierarchical Pages**: Parent-child page relationships
- **Category & Tag System**: Flexible content organization

### User Management
- **Role-Based Access**: Five-tier permission system
- **User Profiles**: Bio, avatar, metadata support
- **Activity Logging**: Track user actions and changes

### Admin Dashboard
- **Protected Routes**: Middleware-secured admin areas
- **Dashboard Analytics**: Content and user insights
- **Bulk Operations**: Manage multiple items efficiently
- **Theme Management**: Customizable site themes

### Visual Editing
- **Component Tagging**: Live editing capabilities
- **Visual Edits Messenger**: Real-time editing communication
- **Custom Loader**: Component tagging webpack loader

## Development Setup

### Prerequisites
- Node.js 18+ or Bun
- Turso database account
- Environment variables configured

### Scripts
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Environment Variables
```env
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
BETTER_AUTH_SECRET=your_auth_secret
```

## Configuration Files

### Core Config
- **next.config.ts**: Next.js configuration with image optimization and Turbopack rules
- **drizzle.config.ts**: Database connection and migration settings
- **middleware.ts**: Route protection for admin areas
- **components.json**: Shadcn/ui component configuration

### Build Tools
- **tsconfig.json**: TypeScript configuration
- **eslint.config.mjs**: ESLint rules and settings
- **postcss.config.mjs**: PostCSS with Tailwind CSS

## Security Features
- **Route Protection**: Middleware-based authentication
- **Session Management**: Secure session handling
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **XSS Protection**: React's built-in protections

## Performance Optimizations
- **Turbopack**: Fast development builds
- **Image Optimization**: Next.js Image component with Sharp
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: Pre-rendered pages where possible
- **Database Indexing**: Optimized queries with Drizzle

## Deployment Considerations
- **Vercel**: Optimized for Vercel deployment
- **Database**: Turso for global SQLite distribution
- **CDN**: Next.js automatic static asset optimization
- **Environment**: Production and development configurations

## Future Extensibility
- **Plugin System**: Theme and extension support
- **API Routes**: RESTful API for external integrations
- **Webhook Support**: Content update notifications
- **Multi-language**: Internationalization ready
- **PWA Support**: Progressive web app capabilities

---

*This documentation serves as a reference for understanding VibePress architecture, features, and development practices.*