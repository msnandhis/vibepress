import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  animate?: boolean;
}

export function LoadingSkeleton({
  className,
  lines = 3,
  animate = true
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton rounded-md",
            animate && "animate-pulse",
            i === 0 && "h-6 w-3/4",
            i === 1 && "h-4 w-full",
            i === 2 && "h-4 w-5/6",
            i > 2 && "h-4 w-full",
            className
          )}
        />
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
  lines?: number;
}

export function CardSkeleton({
  className,
  showImage = true,
  showAvatar = false,
  lines = 3
}: CardSkeletonProps) {
  return (
    <div className={cn("admin-card space-y-4", className)}>
      {showImage && (
        <div className="skeleton h-48 w-full rounded-lg" />
      )}

      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="skeleton h-6 w-3/4" />
        <LoadingSkeleton lines={lines} animate={false} />
      </div>

      <div className="flex justify-between">
        <div className="skeleton h-8 w-20 rounded-md" />
        <div className="skeleton h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-6 rounded" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton h-4 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}