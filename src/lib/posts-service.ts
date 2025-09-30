import { Post, PostFilters, PostListResponse, PostStats, PostStatus } from '@/types/posts';
import { indexedDB, localStorage } from './storage';
import { generateSlug } from './slug-utils';

class PostsService {
  private readonly storeName = 'posts';

  // Get all posts with filtering and pagination
  async getPosts(filters: PostFilters = {}, page = 1, limit = 10): Promise<PostListResponse> {
    try {
      // Get all posts from IndexedDB
      const allPosts = await indexedDB.getAll(this.storeName) as Post[];

      // Apply filters
      let filteredPosts = allPosts;

      if (filters.status && filters.status !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.status === filters.status);
      }

      if (filters.author) {
        filteredPosts = filteredPosts.filter(post => post.authorId === filters.author);
      }

      if (filters.category) {
        filteredPosts = filteredPosts.filter(post => post.categoryId === filters.category);
      }

      if (filters.tag) {
        filteredPosts = filteredPosts.filter(post =>
          post.tags.some(tag => tag.id === filters.tag)
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.content.content?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredPosts = filteredPosts.filter(post =>
          new Date(post.createdAt) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredPosts = filteredPosts.filter(post =>
          new Date(post.createdAt) <= toDate
        );
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';

      filteredPosts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle dates
        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
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
      const total = filteredPosts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      // Enrich with author and category data
      const enrichedPosts = await Promise.all(
        paginatedPosts.map(async (post) => {
          const author = await indexedDB.get('users', post.authorId);
          const category = post.categoryId ?
            await indexedDB.get('categories', post.categoryId) : null;
          const featuredMedia = post.featuredMediaId ?
            await indexedDB.get('media', post.featuredMediaId) : null;

          return {
            ...post,
            author,
            category,
            featuredMedia,
          };
        })
      );

      return {
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  // Get a single post by ID
  async getPost(id: string): Promise<Post | null> {
    try {
      const post = await indexedDB.get(this.storeName, id) as Post;
      if (!post) return null;

      // Enrich with related data
      const author = await indexedDB.get('users', post.authorId);
      const category = post.categoryId ?
        await indexedDB.get('categories', post.categoryId) : null;
      const featuredMedia = post.featuredMediaId ?
        await indexedDB.get('media', post.featuredMediaId) : null;

      return {
        ...post,
        author,
        category,
        featuredMedia,
      };
    } catch (error) {
      console.error('Error getting post:', error);
      throw new Error('Failed to fetch post');
    }
  }

  // Get a post by slug
  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const allPosts = await indexedDB.getAll(this.storeName) as Post[];
      const post = allPosts.find(p => p.slug === slug);

      if (!post) return null;

      // Enrich with related data
      const author = await indexedDB.get('users', post.authorId);
      const category = post.categoryId ?
        await indexedDB.get('categories', post.categoryId) : null;
      const featuredMedia = post.featuredMediaId ?
        await indexedDB.get('media', post.featuredMediaId) : null;

      return {
        ...post,
        author,
        category,
        featuredMedia,
      };
    } catch (error) {
      console.error('Error getting post by slug:', error);
      throw new Error('Failed to fetch post');
    }
  }

  // Create a new post
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'revisions'>): Promise<Post> {
    try {
      const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const post: Post = {
        ...postData,
        id,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        revisions: [],
        createdAt: now,
        updatedAt: now,
      };

      // Generate slug if not provided
      if (!post.slug) {
        post.slug = await generateSlug(post.title, this.storeName);
      }

      await indexedDB.set(this.storeName, post);

      // Create initial revision
      await this.createRevision(post.id, {
        content: post.content,
        title: post.title,
        excerpt: post.excerpt,
      });

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  // Update a post
  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    try {
      const existingPost = await this.getPost(id);
      if (!existingPost) {
        throw new Error('Post not found');
      }

      const updatedPost: Post = {
        ...existingPost,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      // Update slug if title changed
      if (updates.title && updates.title !== existingPost.title) {
        updatedPost.slug = await generateSlug(updates.title, this.storeName, id);
      }

      await indexedDB.set(this.storeName, updatedPost);

      // Create revision if content changed
      if (updates.content || updates.title) {
        await this.createRevision(id, {
          content: updatedPost.content,
          title: updatedPost.title,
          excerpt: updatedPost.excerpt,
        });
      }

      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  // Delete a post
  async deletePost(id: string): Promise<void> {
    try {
      await indexedDB.remove(this.storeName, id);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Get post statistics
  async getPostStats(): Promise<PostStats> {
    try {
      const allPosts = await indexedDB.getAll(this.storeName) as Post[];

      const stats: PostStats = {
        totalPosts: allPosts.length,
        publishedPosts: allPosts.filter(p => p.status === 'published').length,
        draftPosts: allPosts.filter(p => p.status === 'draft').length,
        archivedPosts: allPosts.filter(p => p.status === 'archived').length,
        scheduledPosts: allPosts.filter(p => p.status === 'scheduled').length,
        totalViews: allPosts.reduce((sum, p) => sum + p.viewCount, 0),
        totalComments: allPosts.reduce((sum, p) => sum + p.commentCount, 0),
        popularPosts: allPosts
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5),
        recentPosts: allPosts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
      };

      return stats;
    } catch (error) {
      console.error('Error getting post stats:', error);
      throw new Error('Failed to fetch post stats');
    }
  }

  // Bulk operations
  async bulkUpdatePosts(ids: string[], updates: Partial<Post>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updatePost(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to bulk update posts');
    }
  }

  async bulkDeletePosts(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deletePost(id))
      );
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw new Error('Failed to bulk delete posts');
    }
  }

  // Revision management
  private async createRevision(postId: string, data: { content: any; title: string; excerpt?: string }): Promise<void> {
    try {
      const post = await this.getPost(postId);
      if (!post) return;

      const revision = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        title: data.title,
        excerpt: data.excerpt,
        authorId: post.authorId,
        createdAt: new Date().toISOString(),
      };

      const updatedPost = {
        ...post,
        revisions: [...post.revisions.slice(-9), revision], // Keep last 10 revisions
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.storeName, updatedPost);
    } catch (error) {
      console.error('Error creating revision:', error);
    }
  }

  async getRevisions(postId: string): Promise<any[]> {
    try {
      const post = await this.getPost(postId);
      return post?.revisions || [];
    } catch (error) {
      console.error('Error getting revisions:', error);
      return [];
    }
  }

  // Get categories
  async getCategories(): Promise<PostCategory[]> {
    try {
      const categories = await indexedDB.getAll('categories') as PostCategory[];
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get tags
  async getTags(): Promise<PostTag[]> {
    try {
      const tags = await indexedDB.getAll('tags') as PostTag[];
      return tags;
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  // Create category
  async createCategory(categoryData: Omit<PostCategory, 'id'>): Promise<PostCategory> {
    try {
      const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const category: PostCategory = {
        ...categoryData,
        id,
        postCount: 0,
      };
      await indexedDB.set('categories', category);
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Create tag
  async createTag(tagData: Omit<PostTag, 'id'>): Promise<PostTag> {
    try {
      const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tag: PostTag = {
        ...tagData,
        id,
        postCount: 0,
      };
      await indexedDB.set('tags', tag);
      return tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  }
}

// Export singleton instance
export const postsService = new PostsService();