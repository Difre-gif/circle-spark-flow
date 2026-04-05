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
  let colorClasses = 'bg-slate-100 text-slate-700';

  switch (status.toUpperCase()) {
    // ─── PAYMENTS & INVOICES ───
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
    case 'DRAFT':
      label = 'Draft';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-slate-100 text-slate-700';
      break;

    // ─── UNIT STATUSES ───
    case 'VACANT':
      label = 'Vacant';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-emerald-100 text-emerald-700';
      break;
    case 'OCCUPIED':
      label = 'Occupied';
      icon = <Home className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-blue-100 text-blue-700';
      break;
    case 'MAINTENANCE':
      label = 'Maintenance';
      icon = <Wrench className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-orange-100 text-orange-700';
      break;
    case 'INACTIVE':
      label = 'Inactive';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-slate-100 text-slate-700';
      break;

    // ─── TENANCY & SUBSCRIPTION STATUSES ───
    case 'ACTIVE':
      label = 'Active';
      icon = <CheckCircle2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-emerald-100 text-emerald-700';
      break;
    case 'TERMINATED':
      label = 'Terminated';
      icon = <MinusCircle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-slate-100 text-slate-700';
      break;
    case 'EVICTED':
      label = 'Evicted';
      icon = <AlertTriangle className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-red-100 text-red-700';
      break;
    case 'TRIAL':
      label = 'Active Trial';
      icon = <Sparkles className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-purple-100 text-purple-700';
      break;
    case 'LAPSED':
      label = 'Lapsed';
      icon = <Clock className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-orange-100 text-orange-700';
      break;

    // ─── PROPERTY TYPES ───
    case 'RESIDENTIAL':
      label = 'Residential';
      icon = <Home className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
      break;
    case 'COMMERCIAL':
      label = 'Commercial';
      icon = <Building2 className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      break;
    case 'MIXED_USE':
      label = 'Mixed Use';
      icon = <Building className="w-3 h-3 mr-1.5" />;
      colorClasses = 'bg-purple-50 text-purple-700 border border-purple-200';
      break;
      
    default:
      label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
      icon = null;
      colorClasses = 'bg-slate-100 text-slate-700';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold min-w-max',
        colorClasses,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}