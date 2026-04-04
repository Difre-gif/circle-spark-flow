import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = string;

const statusStyles: Record<string, string> = {
  PAID: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  APPROVED: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  ACTIVE: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  OCCUPIED: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  CURRENT: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  RESOLVED: 'bg-bizrent-emerald text-primary-foreground hover:bg-bizrent-emerald/90',
  DUE: 'bg-bizrent-blue text-primary-foreground hover:bg-bizrent-blue/90',
  UPCOMING: 'bg-bizrent-blue text-primary-foreground hover:bg-bizrent-blue/90',
  PENDING: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  PARTIAL: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  LATE: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  IN_PROGRESS: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  INVITED: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  MEDIUM: 'bg-bizrent-amber text-primary-foreground hover:bg-bizrent-amber/90',
  OVERDUE: 'bg-bizrent-red text-primary-foreground hover:bg-bizrent-red/90',
  REJECTED: 'bg-bizrent-red text-primary-foreground hover:bg-bizrent-red/90',
  TERMINATED: 'bg-muted text-muted-foreground',
  INACTIVE: 'bg-muted text-muted-foreground',
  VACANT: 'bg-muted text-muted-foreground',
  MAINTENANCE: 'bg-bizrent-overdue text-primary-foreground',
  OPEN: 'bg-bizrent-blue text-primary-foreground',
  HIGH: 'bg-bizrent-overdue text-primary-foreground',
  URGENT: 'bg-bizrent-red text-primary-foreground',
  LOW: 'bg-muted text-muted-foreground',
  OWNER: 'bg-bizrent-navy text-primary-foreground',
  MANAGER: 'bg-bizrent-blue text-primary-foreground',
  ACCOUNTANT: 'bg-bizrent-forest text-primary-foreground',
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn('text-xs font-semibold', statusStyles[status] || 'bg-muted text-muted-foreground', className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
