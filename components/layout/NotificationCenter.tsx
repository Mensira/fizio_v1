'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Calendar, MessageCircle, Pill, Dumbbell, Trophy, BellOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { AppNotification } from '@/lib/store';

function timeAgo(date: string, tr: boolean): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return tr ? 'az önce' : 'just now';
  if (diffMin < 60) return tr ? `${diffMin} dk önce` : `${diffMin}m ago`;
  if (diffHour < 24) return tr ? `${diffHour} saat önce` : `${diffHour}h ago`;
  if (diffDay === 1) return tr ? 'dün' : 'yesterday';
  if (diffDay < 7) return tr ? `${diffDay} gün önce` : `${diffDay}d ago`;
  if (diffWeek < 5) return tr ? `${diffWeek} hafta önce` : `${diffWeek}w ago`;
  return tr ? `${diffMonth} ay önce` : `${diffMonth}mo ago`;
}

const typeIcons: Record<AppNotification['type'], React.ReactNode> = {
  appointment: <Calendar className="w-4 h-4 text-[var(--color-primary)]" />,
  message: <MessageCircle className="w-4 h-4 text-[var(--color-health-green)]" />,
  medication: <Pill className="w-4 h-4 text-[var(--color-warning)]" />,
  exercise: <Dumbbell className="w-4 h-4 text-[var(--color-primary)]" />,
  achievement: <Trophy className="w-4 h-4 text-[var(--color-warning)]" />,
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allNotifications = useStore((s) => s.appNotifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);

  const tr = language === 'tr';

  // Filter notifications by role
  const notifications = useMemo(() => {
    return allNotifications.filter((n) => {
      // No target role = show to everyone
      if (!n.targetRole) return true;
      // Doctor notifications
      if (n.targetRole === 'doctor') return userRole === 'doctor';
      // Patient notifications — must match patient ID
      if (n.targetRole === 'patient') {
        if (userRole !== 'patient') return false;
        // No specific patient = show to all patients
        if (!n.targetPatientId) return true;
        return n.targetPatientId === loggedInPatientId;
      }
      return true;
    });
  }, [allNotifications, userRole, loggedInPatientId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors"
        aria-label={tr ? 'Bildirimler' : 'Notifications'}
      >
        <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[var(--color-danger)] rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Dropdown — mobile: fixed bottom sheet, desktop: absolute dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 z-50 lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-[380px] bg-[var(--color-card)] border-t lg:border border-[var(--color-border)] rounded-t-2xl lg:rounded-xl shadow-xl overflow-hidden"
          >
            {/* Handle bar — mobile only */}
            <div className="flex justify-center pt-2 pb-1 lg:hidden">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-main)]">
                {tr ? 'Bildirimler' : 'Notifications'}
              </h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                  >
                    {tr ? 'Tümünü Okundu İşaretle' : 'Mark All Read'}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]">
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[60vh] lg:max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-secondary)]">
                  <BellOff className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">{tr ? 'Bildirim yok' : 'No notifications'}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markNotificationRead(n.id);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-background)] ${
                      !n.read ? 'bg-[var(--color-primary)]/5' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center">
                      {typeIcons[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-main)] truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                        {n.description}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 opacity-70">
                        {timeAgo(n.date, tr)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Bottom safe area — mobile only */}
            <div className="h-[env(safe-area-inset-bottom,0px)] lg:hidden" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
