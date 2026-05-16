import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('border shadow-sm transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-bizrent-navy dark:text-white">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn('text-sm font-medium flex items-center mt-2', trend.positive ? 'text-bizrent-emerald' : 'text-bizrent-red')}>
                <span className={cn("mr-1 rounded-full p-0.5", trend.positive ? "bg-bizrent-emerald/10" : "bg-bizrent-red/10")}>
                  {trend.positive ? '↑' : '↓'}
                </span>
                {trend.value}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-bizrent-navy/5 p-4 ring-1 ring-bizrent-navy/10">
            <Icon className="h-7 w-7 text-bizrent-navy dark:text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}