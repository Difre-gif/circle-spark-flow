import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  XCircle,
  BellRing,
  RotateCw,
  CalendarClock,
  MinusCircle,
  CheckCheck,
  Home,
  Wrench,
  AlertTriangle,
  Sparkles,
  Building2,
  Building
} from 'lucide-react';

export type GlobalAppStatus = 
  // Payment & Invoice
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERDUE' | 'PARTIAL' | 'DUE' | 'CANCELLED' | 'PAID' | 'AUTO_APPROVED' | 'DRAFT'
  // Unit
  | 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE'
  // Tenancy
  | 'ACTIVE' | 'TERMINATED' | 'EVICTED'
  // Subscription
  | 'TRIAL' | 'LAPSED'
  // Property Type
  | 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE';

interface StatusBadgeProps {
  status: GlobalAppStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let label = status.replace(/_/g, ' ');
  let icon = null;
  let colorClasses = 'bg-muted text-foreground/80';

  switch (status.toUpperCase()) {
    // ─── PAYMENTS & INVOICES ───
    case 'PENDING':
      label = 'Pending Review';
      icon = <Clock className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#F59E0B] text-[#92400E]';
      break;
    case 'APPROVED':
    case 'AUTO_APPROVED':
      label = 'Approved';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#10B981] text-[#065F46]';
      break;
    case 'REJECTED':
      label = 'Rejected';
      icon = <XCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#DC2626] text-[#991B1B]';
      break;
    case 'OVERDUE':
      label = 'Overdue';
      icon = <BellRing className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#EA580C] text-[#9A3412]';
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
    case 'DRAFT':
      label = 'Draft';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-muted text-foreground/80';
      break;

    // ─── UNIT STATUSES ───
    case 'VACANT':
      label = 'Vacant';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-emerald/15 text-bizrent-emerald';
      break;
    case 'OCCUPIED':
      label = 'Occupied';
      icon = <Home className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-blue/15 text-bizrent-blue';
      break;
    case 'MAINTENANCE':
      label = 'Maintenance';
      icon = <Wrench className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-orange/15 text-bizrent-orange';
      break;
    case 'INACTIVE':
      label = 'Inactive';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-slate/15 text-bizrent-slate';
      break;

    // ─── TENANCY & SUBSCRIPTION STATUSES ───
    case 'ACTIVE':
      label = 'Active';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-emerald/15 text-bizrent-emerald';
      break;
    case 'TERMINATED':
      label = 'Terminated';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-slate/15 text-bizrent-slate';
      break;
    case 'EVICTED':
      label = 'Evicted';
      icon = <AlertTriangle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-red/15 text-bizrent-red';
      break;
    case 'TRIAL':
      label = 'Active Trial';
      icon = <Sparkles className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#F59E0B]/15 text-[#92400E]';
      break;
    case 'LAPSED':
      label = 'Lapsed';
      icon = <Clock className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-orange/15 text-bizrent-orange';
      break;

    // ─── PROPERTY TYPES ───
    case 'RESIDENTIAL':
      label = 'Residential';
      icon = <Home className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-bizrent-blue/10 text-bizrent-blue border border-bizrent-blue/20';
      break;
    case 'COMMERCIAL':
      label = 'Commercial';
      icon = <Building2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#1D4ED8]/10 text-[#1E3A8A] border border-[#1D4ED8]/20';
      break;
    case 'MIXED_USE':
      label = 'Mixed Use';
      icon = <Building className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-[#065F46]/10 text-[#065F46] border border-[#065F46]/20';
      break;
      
    default:
      label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
      icon = null;
      colorClasses = 'bg-muted text-foreground/80';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase min-w-max',
        colorClasses,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}