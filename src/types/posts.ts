export interface PostAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: string;
  postCount?: number;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  postCount?: number;
}

export interface PostMedia {
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

export interface PostSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface PostRevision {
  id: string;
  content: any; // TipTap JSON content
  title: string;
  excerpt?: string;
  authorId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: any; // TipTap JSON content
  excerpt?: string;
  status: PostStatus;
  authorId: string;
  author?: PostAuthor;
  categoryId?: string;
  category?: PostCategory;
  tags: PostTag[];
  featuredMediaId?: string;
  featuredMedia?: PostMedia;
  seo: PostSeo;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  revisions: PostRevision[];
  template?: string;
  isSticky: boolean;
  isFeatured: boolean;
}

export type PostStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface PostFilters {
  status?: PostStatus | 'all';
  author?: string;
  category?: string;
  tag?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PostPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostListResponse {
  posts: Post[];
  pagination: PostPagination;
  filters: PostFilters;
}

export interface PostStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalComments: number;
  popularPosts: Post[];
  recentPosts: Post[];
}