'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-0 lg:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`w-full lg:${sizeClasses[size]} rounded-t-2xl lg:rounded-2xl bg-card shadow-xl animate-in fade-in slide-in-from-bottom-4 lg:zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 lg:px-6 py-4">
          <h2 className="text-base lg:text-lg font-semibold text-text-main">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-4 lg:px-6 py-4 overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-10rem)]">{children}</div>
      </div>
    </div>
  );
}
