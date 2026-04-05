import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  XCircle,
  BellRing,
  RotateCw,
  CalendarClock,
  MinusCircle,
  CheckCheck
} from 'lucide-react';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERDUE' | 'PARTIAL' | 'DUE' | 'CANCELLED' | 'PAID' | 'AUTO_APPROVED';

interface StatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let label = status.replace('_', ' ');
  let icon = null;
  let colorClasses = 'bg-slate-100 text-slate-700';

  switch (status.toUpperCase()) {
    case 'PENDING':
      label = 'Pending Review';
      icon = <Clock className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-pending-bg text-status-pending-text';
      break;
    case 'APPROVED':
    case 'AUTO_APPROVED':
      label = 'Approved';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-approved-bg text-status-approved-text';
      break;
    case 'REJECTED':
      label = 'Rejected';
      icon = <XCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-rejected-bg text-status-rejected-text';
      break;
    case 'OVERDUE':
      label = 'Overdue';
      icon = <BellRing className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-overdue-bg text-status-overdue-text';
      break;
    case 'PARTIAL':
      label = 'Partial Payment';
      icon = <RotateCw className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-partial-bg text-status-partial-text';
      break;
    case 'DUE':
      label = 'Payment Due';
      icon = <CalendarClock className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-due-bg text-status-due-text';
      break;
    case 'CANCELLED':
      label = 'Cancelled';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-cancelled-bg text-status-cancelled-text';
      break;
    case 'PAID':
      label = 'Paid in Full';
      icon = <CheckCheck className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-status-paid-bg text-status-paid-text';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold min-w-[80px]',
        colorClasses,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}