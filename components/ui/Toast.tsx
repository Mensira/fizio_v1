'use client';

import { useStore } from '@/lib/store';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-card px-5 py-4 shadow-lg border border-border/50 animate-in slide-in-from-bottom-4 duration-300">
      {toast.type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-health-green shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-danger shrink-0" />
      )}
      <p className="text-sm font-medium text-text-main">{toast.message}</p>
      <button onClick={clearToast} className="ml-2 text-text-secondary hover:text-text-main">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
