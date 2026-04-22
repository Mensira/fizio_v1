'use client';

import dynamic from 'next/dynamic';
import { Plus, CalendarPlus, Clock, Calendar, CheckCircle2, History, Users, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useState } from 'react';
import NewAppointmentModal from '@/components/appointments/NewAppointmentModal';
import PatientBookingModal from '@/components/appointments/PatientBookingModal';
import AppointmentRequestWidget from '@/components/patient/AppointmentRequestWidget';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { formatTime } from '@/lib/utils';

const AppointmentCalendar = dynamic(
  () => import('@/components/appointments/AppointmentCalendar'),
  { ssr: false }
);

export default function RandevularPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);

  const isPatient = userRole === 'patient';
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const appointments = useStore((s) => s.appointments);

  const now = new Date();

  // Patient-specific data
  const myUpcoming = isPatient
    ? appointments
        .filter((a) => a.patientId === loggedInPatientId && new Date(a.date) >= now && a.status === 'Planlandi')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  const nextAppt = myUpcoming[0] || null;
  const myPast = isPatient
    ? appointments
        .filter((a) => a.patientId === loggedInPatientId && new Date(a.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];

  // Doctor-specific data
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const todayAppts = !isPatient
    ? appointments
        .filter((a) => {
          const d = new Date(a.date);
          return d >= todayStart && d < todayEnd;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  const todayCompleted = todayAppts.filter((a) => a.status === 'Tamamlandi').length;
  const todayPlanned = todayAppts.filter((a) => a.status === 'Planlandi').length;

  const docNextAppt = !isPatient
    ? appointments
        .filter((a) => new Date(a.date) >= now && a.status === 'Planlandi')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null
    : null;

  const docUpcoming = !isPatient
    ? appointments
        .filter((a) => {
          const d = new Date(a.date);
          return d >= now && d < new Date(now.getTime() + 3 * 86400000) && a.status === 'Planlandi';
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
    : [];

  // Countdown calculation (shared)
  const getCountdown = (appt: typeof nextAppt | null) => {
    if (!appt) return null;
    const diff = new Date(appt.date).getTime() - now.getTime();
    if (diff < 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return { days, hours, mins };
  };
  const countdown = getCountdown(nextAppt);
  const docCountdown = getCountdown(docNextAppt);

  return (
    <div className="space-y-3 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {isPatient ? t('appointments.myAppointments', language) : t('appointments.title', language)}
          </h2>
          <p className="text-sm text-text-secondary">
            {isPatient ? t('appointments.myAppointmentsDesc', language) : t('appointments.subtitle', language)}
          </p>
        </div>
        {isPatient ? (
          <Button icon={CalendarPlus} onClick={() => setBookingOpen(true)}>
            {t('appointments.requestAppointment', language)}
          </Button>
        ) : (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            {t('appointments.new', language)}
          </Button>
        )}
      </div>

      {!isPatient && (
        <div className="flex gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> {t('status.planned', language)}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-health-green" /> {t('status.completed', language)}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-danger" /> {t('status.noShow', language)}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-warning" /> {t('status.cancelled', language)}</span>
        </div>
      )}
      {isPatient && (
        <div className="flex gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> {t('appointments.yourAppointment', language)}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#94A3B8]" /> {t('appointments.occupied', language)}</span>
        </div>
      )}

      {/* Doctor: stats + countdown + upcoming list */}
      {!isPatient && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
          {/* Today's appointments count */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-medium text-text-secondary">
                  {t('appointments.todayAppts', language)}
                </h3>
                <p className="text-2xl font-bold text-text-main mt-1">{todayAppts.length}</p>
                <p className="text-[11px] text-text-secondary">
                  {todayCompleted} {t('appointments.completed', language)} • {todayPlanned} {t('appointments.pendingShort', language)}
                </p>
              </div>
            </div>
          </Card>

          {/* Countdown to next */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-medium text-text-secondary">
                  {t('appointments.nextAppointmentIn', language)}
                </h3>
                {docCountdown ? (
                  <div className="flex items-baseline gap-2 mt-1">
                    {docCountdown.days > 0 && (
                      <div>
                        <span className="text-xl font-bold text-warning">{docCountdown.days}</span>
                        <span className="text-[11px] text-text-secondary ml-0.5">{t('appointments.dayShort', language)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xl font-bold text-warning">{docCountdown.hours}</span>
                      <span className="text-[11px] text-text-secondary ml-0.5">{t('appointments.hourShort', language)}</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-warning">{docCountdown.mins}</span>
                      <span className="text-[11px] text-text-secondary ml-0.5">{t('appointments.minShort', language)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary mt-1">{t('appointments.noAppts', language)}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Next appointment detail */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
                <Users className="h-5 w-5 text-health-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-medium text-text-secondary">
                  {t('appointments.nextPatient', language)}
                </h3>
                {docNextAppt ? (
                  <div className="mt-1">
                    <p className="text-sm font-semibold text-text-main">{docNextAppt.patientName}</p>
                    <p className="text-[11px] text-text-secondary">
                      {formatTime(docNextAppt.date)} • {docNextAppt.type} • {docNextAppt.duration} {t('common.min', language)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary mt-1">-</p>
                )}
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* Doctor: upcoming appointments list */}
      {!isPatient && docUpcoming.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-main">
              {t('appointments.upcoming3Days', language)}
            </h3>
            <Badge variant="info">{docUpcoming.length}</Badge>
          </div>
          <div className="space-y-2">
            {docUpcoming.map((appt) => {
              const apptDate = new Date(appt.date);
              const isToday = apptDate.toDateString() === now.toDateString();
              const isTomorrow = apptDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
              const dayLabel = isToday
                ? t('common.today', language)
                : isTomorrow
                ? t('appointments.tomorrow', language)
                : apptDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });

              return (
                <div key={appt.id} className="flex items-center gap-3 rounded-lg border border-border/30 p-3 hover:bg-background transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isToday ? 'bg-primary/10' : 'bg-background'}`}>
                    <Calendar className={`h-4 w-4 ${isToday ? 'text-primary' : 'text-text-secondary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-main">{appt.patientName}</p>
                    <p className="text-[11px] text-text-secondary">
                      {dayLabel} • {formatTime(appt.date)} • {appt.type}
                    </p>
                  </div>
                  <Badge variant={isToday ? 'warning' : 'default'}>{appt.duration} {t('common.min', language)}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Patient: countdown + past appointments */}
      {isPatient && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-3 lg:gap-4">
          {/* Countdown to next appointment */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-main mb-1">
                  {t('appointments.nextAppointmentIn', language)}
                </h3>
                {countdown ? (
                  <div className="flex items-baseline gap-3">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">{countdown.days}</span>
                      <p className="text-[11px] text-text-secondary">{t('appointments.daysShort', language)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">{countdown.hours}</span>
                      <p className="text-[11px] text-text-secondary">{t('appointments.hoursShort', language)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">
                    {t('appointments.noUpcomingAppts', language)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Next appointment detail */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
                <Calendar className="h-5 w-5 text-health-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-main mb-1">
                  {t('appointments.nextApptDetail', language)}
                </h3>
                {nextAppt ? (
                  <div>
                    <p className="text-sm font-medium text-text-main">
                      {new Date(nextAppt.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {formatTime(nextAppt.date)} - {nextAppt.type} - {nextAppt.duration} {t('common.min', language)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">-</p>
                )}
              </div>
            </div>
          </Card>

          {/* Total upcoming */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <CheckCircle2 className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-main mb-1">
                  {t('appointments.pendingAppts', language)}
                </h3>
                <p className="text-2xl font-bold text-text-main">{myUpcoming.length}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('appointments.scheduledAppts', language)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Patient: past appointments list with survey */}
      {isPatient && myPast.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-main">
              {t('appointments.pastAppts', language)}
            </h3>
          </div>
          <div className="space-y-2">
            {myPast.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 rounded-lg border border-border/30 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                    <Calendar className="h-4 w-4 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-main">{appt.type}</p>
                    <p className="text-[11px] text-text-secondary">
                      {new Date(appt.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })} - {formatTime(appt.date)}
                    </p>
                  </div>
                  <Badge variant="default">{appt.duration} {t('common.min', language)}</Badge>
                </div>
              ))}
          </div>
        </Card>
      )}

      <AppointmentCalendar />

      {/* Doctor: full new appointment modal */}
      {!isPatient && (
        <NewAppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Patient: simplified booking modal */}
      {isPatient && (
        <PatientBookingModal
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}

      {/* Appointment Request System */}
      <AppointmentRequestWidget />
    </div>
  );
}
