import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'centered' | 'card';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const baseClasses = "flex flex-col items-center justify-center p-8";

  const variantClasses = {
    default: baseClasses,
    centered: `${baseClasses} min-h-[400px]`,
    card: `${baseClasses} border-2 border-dashed border-muted rounded-lg bg-muted/20`
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Common empty states
export function EmptyPosts({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      title="No posts found"
      description="Get started by creating your first blog post."
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Post
          </button>
        )
      }
      variant="card"
    />
  );
}

export function EmptyPages({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      title="No pages found"
      description="Create your first page to start building your site structure."
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Page
          </button>
        )
      }
      variant="card"
    />
  );
}

export function EmptyMedia({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      title="No media files"
      description="Upload images, videos, and other media to use in your content."
      action={
        onUpload && (
          <button
            onClick={onUpload}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Upload Media
          </button>
        )
      }
      variant="card"
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
      variant="centered"
    />
  );
}