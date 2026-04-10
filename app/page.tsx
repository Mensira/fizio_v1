'use client';

import { Calendar, Users, ClipboardList, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AppointmentListWidget from '@/components/dashboard/AppointmentListWidget';
import ProgressChartWidget from '@/components/dashboard/ProgressChartWidget';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import { useStore } from '@/lib/store';
import { formatCurrency, formatTime } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function DashboardPage() {
  const userRole = useStore((s) => s.userRole);
  const appointments = useStore((s) => s.appointments);
  const patients = useStore((s) => s.patients);
  const payments = useStore((s) => s.payments);
  const treatmentPlans = useStore((s) => s.treatmentPlans);
  const allSessions = useStore((s) => s.sessions);
  const language = useStore((s) => s.language);
  const profile = useStore((s) => s.profile);

  if (userRole === 'patient') {
    return <PatientDashboard />;
  }

  const today = new Date();
  const todayAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const activePlans = treatmentPlans.filter((tp) => tp.status === 'Aktif');

  const todayRevenue = payments
    .filter((p) => {
      const d = new Date(p.date);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && p.status === 'Odendi';
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const upcomingAppts = appointments
    .filter((a) => {
      const d = new Date(a.date);
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 3 && a.status === 'Planlandi';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentSessions = allSessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const totalSessionsAll = activePlans.reduce((s, p) => s + p.totalSessions, 0);
  const completedSessionsAll = activePlans.reduce((s, p) => s + p.completedSessions, 0);
  const completionRate = totalSessionsAll > 0 ? Math.round((completedSessionsAll / totalSessionsAll) * 100) : 0;

  const hour = today.getHours();
  const greeting = hour < 12 ? t('dashboard.goodMorning', language) : hour < 18 ? t('dashboard.goodAfternoon', language) : t('dashboard.goodEvening', language);

  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  const summaryText = t('dashboard.summaryText', language)
    .replace('{appointments}', String(todayAppointments.length))
    .replace('{plans}', String(activePlans.length));

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-text-main">
            {greeting}, {profile.fullName.split(' ')[0]}
          </h2>
          <p className="text-sm text-text-secondary mt-1">{summaryText}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-card border border-border/50 px-4 py-2.5 shadow-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-text-main">
            {today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <StatCard
          title={t('dashboard.todayAppointments', language)}
          value={todayAppointments.length}
          icon={Calendar}
          iconBgColor="bg-primary/10"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title={t('dashboard.totalActivePatients', language)}
          value={patients.length}
          icon={Users}
          iconBgColor="bg-health-green/10"
        />
        <StatCard
          title={t('dashboard.activeTreatmentPlans', language)}
          value={activePlans.length}
          icon={ClipboardList}
          iconBgColor="bg-warning/10"
        />
        <StatCard
          title={t('dashboard.todayRevenue', language)}
          value={formatCurrency(todayRevenue)}
          icon={TrendingUp}
          iconBgColor="bg-primary/10"
          trend={{ value: 8, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 space-y-3 lg:space-y-6">
          <AppointmentListWidget />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold text-text-main mb-3">{t('dashboard.completionRate', language)}</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-primary">%{completionRate}</span>
                <span className="text-xs text-text-secondary mb-1">
                  {completedSessionsAll}/{totalSessionsAll} {t('dashboard.session', language)}
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-background">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-health-green transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {activePlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="text-center">
                    <p className="text-xs text-text-secondary truncate">{plan.patientName.split(' ')[0]}</p>
                    <p className="text-xs font-semibold text-text-main">{plan.completedSessions}/{plan.totalSessions}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-text-main mb-3">{t('dashboard.recentSessions', language)}</h3>
              <div className="space-y-2.5">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-health-green/10">
                      <span className="text-xs font-semibold text-health-green">
                        {session.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-main truncate">{session.patientName}</p>
                      <p className="text-[11px] text-text-secondary">{session.applications.join(', ')}</p>
                    </div>
                    <span className="text-[11px] text-text-secondary whitespace-nowrap">
                      {t('dashboard.pain', language)}: {session.painLevelBefore}→{session.painLevelAfter}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-3 lg:space-y-6">
          <MotivationalQuote />
          <ProgressChartWidget />

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-main">{t('dashboard.upcomingAppointments', language)}</h3>
              <Badge variant="info">{upcomingAppts.length}</Badge>
            </div>
            {upcomingAppts.length === 0 ? (
              <p className="text-xs text-text-secondary">{t('dashboard.noUpcoming', language)}</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 rounded-lg border border-border/30 p-2.5 hover:bg-background transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {new Date(appt.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-main truncate">{appt.patientName}</p>
                      <p className="text-[11px] text-text-secondary">{formatTime(appt.date)} - {appt.type}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}
