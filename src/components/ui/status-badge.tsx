import { cn } from "@/lib/utils";

export type StatusType = 'draft' | 'published' | 'archived' | 'pending' | 'approved' | 'rejected' | 'scheduled' | 'active' | 'inactive' | 'suspended' | 'banned';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  children?: React.ReactNode;
}

const statusStyles: Record<StatusType, string> = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-orange-100 text-orange-800 border-orange-200',
  banned: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<StatusType, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  banned: 'Banned',
};

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  const label = children || statusLabels[status];

  return (
    <span
      className={cn(
        'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}

// Animated version with pulse effect for pending status
export function AnimatedStatusBadge({ status, className, children }: StatusBadgeProps) {
  const label = children || statusLabels[status];

  return (
    <span
      className={cn(
        'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200',
        statusStyles[status],
        status === 'pending' && 'animate-pulse-subtle',
        className
      )}
    >
      {label}
    </span>
  );
}