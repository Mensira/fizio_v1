import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export default function ProgressBar({ value, max, color = 'bg-primary', className }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('h-2 w-full rounded-full bg-background', className)}>
      <div
        className={cn('h-2 rounded-full transition-all duration-500', color)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
