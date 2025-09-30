// Slug generation utilities

export async function generateSlug(
  text: string,
  storeName?: string,
  excludeId?: string
): Promise<string> {
  // Convert to lowercase and replace spaces with hyphens
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If storeName is provided, check for uniqueness
  if (storeName) {
    slug = await ensureUniqueSlug(slug, storeName, excludeId);
  }

  return slug;
}

async function ensureUniqueSlug(
  baseSlug: string,
  storeName: string,
  excludeId?: string
): Promise<string> {
  try {
    // Dynamic import to avoid circular dependency
    const { indexedDB } = await import('./storage');
    const allItems = await indexedDB.getAll(storeName);

    // Filter out the current item if excludeId is provided
    const existingItems = excludeId
      ? allItems.filter(item => item.id !== excludeId)
      : allItems;

    const existingSlugs = existingItems
      .map(item => item.slug)
      .filter(Boolean);

    // If the base slug is unique, return it
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    // If not unique, append a number
    let counter = 1;
    let uniqueSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(uniqueSlug)) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    return uniqueSlug;
  } catch (error) {
    console.error('Error ensuring unique slug:', error);
    // Fallback to timestamp if there's an error
    return `${baseSlug}-${Date.now()}`;
  }
}

export function validateSlug(slug: string): boolean {
  // Basic slug validation
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100;
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generateExcerpt(content: any, maxLength = 160): string {
  try {
    // Extract text from TipTap content
    let text = '';

    if (typeof content === 'string') {
      text = content;
    } else if (content && typeof content === 'object') {
      // Handle TipTap JSON content
      if (content.content && Array.isArray(content.content)) {
        const extractTextFromNode = (node: any): string => {
          let result = '';

          if (node.text) {
            result += node.text;
          }

          if (node.content && Array.isArray(node.content)) {
            result += node.content.map(extractTextFromNode).join('');
          }

          return result;
        };

        text = content.content.map(extractTextFromNode).join('');
      }
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n+/g, ' ') // Newlines to spaces
      .trim();

    // Truncate if necessary
    if (text.length <= maxLength) {
      return text;
    }

    // Try to break at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  } catch (error) {
    console.error('Error generating excerpt:', error);
    return '';
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}