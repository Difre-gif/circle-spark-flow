import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = string;

const statusStyles: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  APPROVED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  ACTIVE: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  OCCUPIED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  CURRENT: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  RESOLVED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  AUTO_APPROVED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent',
  
  DUE: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent',
  UPCOMING: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent',
  OPEN: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent',
  
  PENDING: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  PARTIAL: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  LATE: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  INVITED: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  
  OVERDUE: 'bg-red-100 text-red-800 hover:bg-red-200 border-transparent',
  REJECTED: 'bg-red-100 text-red-800 hover:bg-red-200 border-transparent',
  URGENT: 'bg-red-100 text-red-800 hover:bg-red-200 border-transparent',
  
  TERMINATED: 'bg-slate-100 text-slate-700 border-transparent',
  INACTIVE: 'bg-slate-100 text-slate-700 border-transparent',
  VACANT: 'bg-slate-100 text-slate-700 border-transparent',
  CANCELLED: 'bg-slate-100 text-slate-700 border-transparent',
  EXPIRED: 'bg-slate-100 text-slate-700 border-transparent',
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider', statusStyles[status] || 'bg-slate-100 text-slate-700', className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}