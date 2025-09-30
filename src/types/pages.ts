export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any; // TipTap JSON content
  excerpt?: string;
  status: PageStatus;
  authorId: string;
  author?: PageAuthor;
  template?: string;
  featuredMediaId?: string;
  featuredMedia?: PageMedia;
  seo: PageSeo;
  order: number;
  parent?: string;
  showInMenu: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisions: PageRevision[];
}

export interface PageAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PageMedia {
  id: string;
  url: string;
  filename: string;
  altText?: string;
  caption?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface PageRevision {
  id: string;
  content: any;
  title: string;
  excerpt?: string;
  authorId: string;
  createdAt: string;
}

export type PageStatus = 'draft' | 'published' | 'archived';

export interface PageFilters {
  status?: PageStatus | 'all';
  author?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  template?: string;
  parent?: string;
  showInMenu?: boolean;
  sortBy?: 'order' | 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PagePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageListResponse {
  pages: Page[];
  pagination: PagePagination;
  filters: PageFilters;
}

export interface PageStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  archivedPages: number;
  topLevelPages: number;
  totalPagesInMenu: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  file: string;
}