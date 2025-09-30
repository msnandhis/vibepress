import { Page, PageFilters, PageListResponse, PageStats, PageTemplate, PageStatus } from '@/types/pages';
import { indexedDB } from './storage';
import { generateSlug } from './slug-utils';

class PagesService {
  private readonly storeName = 'pages';

  // Get all pages with filtering and pagination
  async getPages(filters: PageFilters = {}, page = 1, limit = 10): Promise<PageListResponse> {
    try {
      // Get all pages from IndexedDB
      const allPages = await indexedDB.getAll(this.storeName) as Page[];

      // Apply filters
      let filteredPages = allPages;

      if (filters.status && filters.status !== 'all') {
        filteredPages = filteredPages.filter(page => page.status === filters.status);
      }

      if (filters.author) {
        filteredPages = filteredPages.filter(page => page.authorId === filters.author);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPages = filteredPages.filter(page =>
          page.title.toLowerCase().includes(searchLower) ||
          page.excerpt?.toLowerCase().includes(searchLower) ||
          page.content.content?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredPages = filteredPages.filter(page =>
          new Date(page.createdAt) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredPages = filteredPages.filter(page =>
          new Date(page.createdAt) <= toDate
        );
      }

      if (filters.template) {
        filteredPages = filteredPages.filter(page => page.template === filters.template);
      }

      if (filters.parent !== undefined) {
        filteredPages = filteredPages.filter(page => page.parent === filters.parent);
      }

      if (filters.showInMenu !== undefined) {
        filteredPages = filteredPages.filter(page => page.showInMenu === filters.showInMenu);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'order';
      const sortOrder = filters.sortOrder || 'asc';

      filteredPages.sort((a, b) => {
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
      const total = filteredPages.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPages = filteredPages.slice(startIndex, endIndex);

      // Enrich with author data
      const enrichedPages = await Promise.all(
        paginatedPages.map(async (page) => {
          const author = await indexedDB.get('users', page.authorId);
          const featuredMedia = page.featuredMediaId ?
            await indexedDB.get('media', page.featuredMediaId) : null;

          return {
            ...page,
            author,
            featuredMedia,
          };
        })
      );

      return {
        pages: enrichedPages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting pages:', error);
      throw new Error('Failed to fetch pages');
    }
  }

  // Get a single page by ID
  async getPage(id: string): Promise<Page | null> {
    try {
      const page = await indexedDB.get(this.storeName, id) as Page;
      if (!page) return null;

      // Enrich with related data
      const author = await indexedDB.get('users', page.authorId);
      const featuredMedia = page.featuredMediaId ?
        await indexedDB.get('media', page.featuredMediaId) : null;

      return {
        ...page,
        author,
        featuredMedia,
      };
    } catch (error) {
      console.error('Error getting page:', error);
      throw new Error('Failed to fetch page');
    }
  }

  // Get a page by slug
  async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const allPages = await indexedDB.getAll(this.storeName) as Page[];
      const page = allPages.find(p => p.slug === slug);

      if (!page) return null;

      // Enrich with related data
      const author = await indexedDB.get('users', page.authorId);
      const featuredMedia = page.featuredMediaId ?
        await indexedDB.get('media', page.featuredMediaId) : null;

      return {
        ...page,
        author,
        featuredMedia,
      };
    } catch (error) {
      console.error('Error getting page by slug:', error);
      throw new Error('Failed to fetch page');
    }
  }

  // Get page hierarchy (tree structure)
  async getPageHierarchy(): Promise<Page[]> {
    try {
      const allPages = await indexedDB.getAll(this.storeName) as Page[];
      const topLevelPages = allPages.filter(page => !page.parent);

      const buildHierarchy = (pages: Page[], parentId?: string): Page[] => {
        return pages
          .filter(page => page.parent === parentId)
          .sort((a, b) => a.order - b.order)
          .map(page => ({
            ...page,
            children: buildHierarchy(pages, page.id)
          }));
      };

      return buildHierarchy(topLevelPages);
    } catch (error) {
      console.error('Error getting page hierarchy:', error);
      throw new Error('Failed to fetch page hierarchy');
    }
  }

  // Create a new page
  async createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'revisions'>): Promise<Page> {
    try {
      const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Get the highest order number for pages with same parent
      const siblingPages = await this.getPages({ parent: pageData.parent });
      const maxOrder = Math.max(...siblingPages.pages.map(p => p.order), 0);

      const page: Page = {
        ...pageData,
        id,
        order: maxOrder + 1,
        revisions: [],
        createdAt: now,
        updatedAt: now,
      };

      // Generate slug if not provided
      if (!page.slug) {
        page.slug = await generateSlug(page.title, this.storeName);
      }

      await indexedDB.set(this.storeName, page);

      // Create initial revision
      await this.createRevision(page.id, {
        content: page.content,
        title: page.title,
        excerpt: page.excerpt,
      });

      return page;
    } catch (error) {
      console.error('Error creating page:', error);
      throw new Error('Failed to create page');
    }
  }

  // Update a page
  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    try {
      const existingPage = await this.getPage(id);
      if (!existingPage) {
        throw new Error('Page not found');
      }

      const updatedPage: Page = {
        ...existingPage,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      // Update slug if title changed
      if (updates.title && updates.title !== existingPage.title) {
        updatedPage.slug = await generateSlug(updates.title, this.storeName, id);
      }

      await indexedDB.set(this.storeName, updatedPage);

      // Create revision if content changed
      if (updates.content || updates.title) {
        await this.createRevision(id, {
          content: updatedPage.content,
          title: updatedPage.title,
          excerpt: updatedPage.excerpt,
        });
      }

      return updatedPage;
    } catch (error) {
      console.error('Error updating page:', error);
      throw new Error('Failed to update page');
    }
  }

  // Delete a page
  async deletePage(id: string): Promise<void> {
    try {
      // First, delete all child pages
      const childPages = await this.getPages({ parent: id });
      for (const child of childPages.pages) {
        await this.deletePage(child.id);
      }

      await indexedDB.remove(this.storeName, id);
    } catch (error) {
      console.error('Error deleting page:', error);
      throw new Error('Failed to delete page');
    }
  }

  // Get page statistics
  async getPageStats(): Promise<PageStats> {
    try {
      const allPages = await indexedDB.getAll(this.storeName) as Page[];

      const stats: PageStats = {
        totalPages: allPages.length,
        publishedPages: allPages.filter(p => p.status === 'published').length,
        draftPages: allPages.filter(p => p.status === 'draft').length,
        archivedPages: allPages.filter(p => p.status === 'archived').length,
        topLevelPages: allPages.filter(p => !p.parent).length,
        totalPagesInMenu: allPages.filter(p => p.showInMenu).length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting page stats:', error);
      throw new Error('Failed to fetch page stats');
    }
  }

  // Get available page templates
  async getPageTemplates(): Promise<PageTemplate[]> {
    try {
      const templates: PageTemplate[] = [
        {
          id: 'default',
          name: 'Default Template',
          description: 'Standard page layout with sidebar',
          file: 'default',
        },
        {
          id: 'full-width',
          name: 'Full Width',
          description: 'Page without sidebar',
          file: 'full-width',
        },
        {
          id: 'landing',
          name: 'Landing Page',
          description: 'Marketing landing page template',
          file: 'landing',
        },
        {
          id: 'contact',
          name: 'Contact Page',
          description: 'Contact form and information',
          file: 'contact',
        },
      ];

      return templates;
    } catch (error) {
      console.error('Error getting page templates:', error);
      return [];
    }
  }

  // Reorder pages
  async reorderPages(pageOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of pageOrders) {
        const page = await this.getPage(id);
        if (page) {
          await this.updatePage(id, { order });
        }
      }
    } catch (error) {
      console.error('Error reordering pages:', error);
      throw new Error('Failed to reorder pages');
    }
  }

  // Bulk operations
  async bulkUpdatePages(ids: string[], updates: Partial<Page>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updatePage(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to bulk update pages');
    }
  }

  async bulkDeletePages(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deletePage(id))
      );
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw new Error('Failed to bulk delete pages');
    }
  }

  // Revision management
  private async createRevision(pageId: string, data: { content: any; title: string; excerpt?: string }): Promise<void> {
    try {
      const page = await this.getPage(pageId);
      if (!page) return;

      const revision = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        title: data.title,
        excerpt: data.excerpt,
        authorId: page.authorId,
        createdAt: new Date().toISOString(),
      };

      const updatedPage = {
        ...page,
        revisions: [...page.revisions.slice(-9), revision], // Keep last 10 revisions
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.storeName, updatedPage);
    } catch (error) {
      console.error('Error creating revision:', error);
    }
  }

  async getRevisions(pageId: string): Promise<any[]> {
    try {
      const page = await this.getPage(pageId);
      return page?.revisions || [];
    } catch (error) {
      console.error('Error getting revisions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const pagesService = new PagesService();