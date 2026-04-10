'use client';

import { Bell } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { NotificationSettings } from '@/lib/store';

export default function NotificationTab({
  language,
  notifications,
  setNotifications,
  items,
}: {
  language: 'tr' | 'en';
  notifications: NotificationSettings;
  setNotifications: (n: NotificationSettings) => void;
  items: { key: string; label: string; desc: string }[];
}) {
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-main">{t('settings.notifTitle', language)}</h3>
          <p className="text-xs text-text-secondary">{t('settings.notifDesc', language)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium text-text-main">{item.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications[item.key as keyof NotificationSettings] ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                notifications[item.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <p className="text-xs font-semibold text-text-main mb-3">{t('settings.notifChannels', language)}</p>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              notifications.emailNotification ? 'border-primary bg-primary/5' : 'border-border/50'
            }`}
            onClick={() => setNotifications({ ...notifications, emailNotification: !notifications.emailNotification })}
          >
            <input type="checkbox" checked={notifications.emailNotification} readOnly className="rounded accent-primary" />
            <div>
              <p className="text-sm font-medium text-text-main">{t('settings.email', language)}</p>
              <p className="text-xs text-text-secondary">{t('settings.emailNotif', language)}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              notifications.smsNotification ? 'border-primary bg-primary/5' : 'border-border/50'
            }`}
            onClick={() => setNotifications({ ...notifications, smsNotification: !notifications.smsNotification })}
          >
            <input type="checkbox" checked={notifications.smsNotification} readOnly className="rounded accent-primary" />
            <div>
              <p className="text-sm font-medium text-text-main">SMS</p>
              <p className="text-xs text-text-secondary">{t('settings.smsNotif', language)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
