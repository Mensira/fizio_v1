import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <input
        className={cn(
          'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors',
          className
        )}
        {...props}
      />
    </div>
  );
}
