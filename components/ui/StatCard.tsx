import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, icon: Icon, iconBgColor = 'bg-primary/10', trend }: StatCardProps) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border/50 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text-main">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-sm font-medium', trend.positive ? 'text-health-green' : 'text-danger')}>
              {trend.positive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBgColor)}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
