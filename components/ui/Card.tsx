import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card shadow-sm border border-border/50',
        padding && 'p-4 lg:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
