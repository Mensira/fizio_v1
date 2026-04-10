'use client';

import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import { APPOINTMENT_STATUS_COLORS } from '@/lib/constants';
import { t } from '@/lib/i18n';
import type { AppointmentStatus } from '@/lib/types';

const statusBadgeVariant: Record<AppointmentStatus, 'info' | 'success' | 'danger' | 'warning'> = {
  Planlandi: 'info',
  Tamamlandi: 'success',
  Gelmedi: 'danger',
  Iptal: 'warning',
};

export default function AppointmentListWidget() {
  const appointments = useStore((s) => s.appointments);
  const language = useStore((s) => s.language);

  const statusLabels: Record<AppointmentStatus, string> = {
    Planlandi: t('status.planned', language),
    Tamamlandi: t('status.completed', language),
    Gelmedi: t('status.noShow', language),
    Iptal: t('status.cancelled', language),
  };

  const today = new Date();
  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completed = todayAppts.filter(a => a.status === 'Tamamlandi').length;
  const total = todayAppts.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-main">{t('dashboard.todayAppointmentsWidget', language)}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {completed}/{total} {t('dashboard.xCompleted', language)}
          </p>
        </div>
        <Link
          href="/randevular"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t('common.all', language)} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {todayAppts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background mb-3">
            <Clock className="h-6 w-6 text-text-secondary" />
          </div>
          <p className="text-sm text-text-secondary">{t('dashboard.noAppointments', language)}</p>
          <p className="text-xs text-text-secondary mt-1">{t('dashboard.useCalendar', language)}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayAppts.map((appt) => (
            <div
              key={appt.id}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 hover:shadow-sm ${
                appt.status === 'Tamamlandi'
                  ? 'border-health-green/20 bg-health-green/5'
                  : appt.status === 'Gelmedi'
                  ? 'border-danger/20 bg-danger/5'
                  : 'border-border/50 hover:bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-text-main">{formatTime(appt.date)}</span>
                  <span className="text-[10px] text-text-secondary">{appt.duration} {t('dashboard.min', language)}</span>
                </div>
                <div
                  className="h-10 w-1 rounded-full"
                  style={{ backgroundColor: APPOINTMENT_STATUS_COLORS[appt.status] }}
                />
                <div>
                  <p className="text-sm font-medium text-text-main">{appt.patientName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-secondary">{appt.type}</span>
                    <span className="text-text-secondary">·</span>
                    <span className="text-xs text-text-secondary">{appt.therapistName}</span>
                  </div>
                </div>
              </div>
              <Badge variant={statusBadgeVariant[appt.status]}>
                {statusLabels[appt.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
