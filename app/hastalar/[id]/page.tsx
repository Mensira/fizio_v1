'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Phone, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useStore } from '@/lib/store';
import {
  getProgressByPatientId,
  exercises as allExercises,
} from '@/lib/mock-data';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { MOTIVATIONAL_QUOTES } from '@/lib/constants';
import { t } from '@/lib/i18n';
import type { AppointmentStatus } from '@/lib/types';

const statusBadge: Record<AppointmentStatus, 'info' | 'success' | 'danger' | 'warning'> = {
  Planlandi: 'info',
  Tamamlandi: 'success',
  Gelmedi: 'danger',
  Iptal: 'warning',
};

const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const storePatients = useStore((s) => s.patients);
  const storeAppointments = useStore((s) => s.appointments);
  const storeTreatmentPlans = useStore((s) => s.treatmentPlans);
  const storeSessions = useStore((s) => s.sessions);
  const storePayments = useStore((s) => s.payments);
  const storeExercisePrograms = useStore((s) => s.exercisePrograms);
  const [activeTab, setActiveTab] = useState('genel');
  const patient = storePatients.find((p) => p.id === (params.id as string));

  const isPatient = userRole === 'patient';

  // Patient can only view their own detail
  if (isPatient && params.id !== loggedInPatientId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-text-secondary">{t('access.denied', language)}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/')}>
          {t('common.back', language)}
        </Button>
      </div>
    );
  }

  const ALL_TABS = [
    { id: 'genel', label: t('patientDetail.generalInfo', language) },
    { id: 'randevular', label: t('patientDetail.appointments', language) },
    { id: 'seanslar', label: t('patientDetail.sessions', language) },
    { id: 'tedavi', label: t('patientDetail.treatmentPlan', language) },
    { id: 'egzersiz', label: t('patientDetail.exerciseProgram', language) },
    { id: 'ilerleme', label: t('patientDetail.progressTracking', language) },
    { id: 'odemeler', label: t('patientDetail.payments', language) },
  ];

  // Hide payments tab for patients
  const TABS = isPatient ? ALL_TABS.filter(tab => tab.id !== 'odemeler') : ALL_TABS;

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-text-secondary">{t('patients.notFound', language)}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/hastalar')}>
          {t('common.back', language)}
        </Button>
      </div>
    );
  }

  const appointments = storeAppointments.filter((a) => a.patientId === patient.id);
  const plans = storeTreatmentPlans.filter((tp) => tp.patientId === patient.id);
  const patientSessions = storeSessions.filter((s) => s.patientId === patient.id);
  const progress = getProgressByPatientId(patient.id);
  const payments = storePayments.filter((p) => p.patientId === patient.id);
  const exerciseProgram = storeExercisePrograms.find((ep) => ep.patientId === patient.id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push(isPatient ? '/' : '/hastalar')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-main transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {isPatient ? t('common.back', language) : t('patients.backToList', language)}
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Patient header */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-sm text-text-secondary">{patient.diagnosis}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {patient.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {patient.email}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card padding={false}>
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            <div className="p-4 sm:p-6">
              {activeTab === 'genel' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div><p className="text-xs text-text-secondary">{t('patients.fullName', language)}</p><p className="text-sm font-medium text-text-main">{patient.firstName} {patient.lastName}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.phone', language)}</p><p className="text-sm font-medium text-text-main">{patient.phone}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.email', language)}</p><p className="text-sm font-medium text-text-main">{patient.email}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.birthDate', language)}</p><p className="text-sm font-medium text-text-main">{formatDate(patient.birthDate)}</p></div>
                  </div>
                  <div className="space-y-4">
                    <div><p className="text-xs text-text-secondary">{t('patients.gender', language)}</p><p className="text-sm font-medium text-text-main">{patient.gender === 'Erkek' ? t('patients.male', language) : t('patients.female', language)}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.diagnosis', language)}</p><p className="text-sm font-medium text-text-main">{patient.diagnosis}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.notes', language)}</p><p className="text-sm font-medium text-text-main">{patient.notes || '-'}</p></div>
                    <div><p className="text-xs text-text-secondary">{t('patients.registrationDate', language)}</p><p className="text-sm font-medium text-text-main">{formatDate(patient.createdAt)}</p></div>
                  </div>
                </div>
              )}

              {activeTab === 'randevular' && (
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noAppointments', language)}</p>
                  ) : (
                    appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((appt) => (
                      <div key={appt.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                        <div>
                          <p className="text-sm font-medium text-text-main">{formatDate(appt.date)} - {formatTime(appt.date)}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{appt.type} - {appt.therapistName}</p>
                        </div>
                        <Badge variant={statusBadge[appt.status]}>{appt.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'seanslar' && (
                <div className="space-y-3">
                  {patientSessions.length === 0 ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noSessions', language)}</p>
                  ) : (
                    patientSessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                        <div>
                          <p className="text-sm font-medium text-text-main">{formatDate(s.date)}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{s.applications.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={s.completed ? 'success' : 'warning'}>
                            {s.completed ? t('status.completed', language) : t('status.waiting', language)}
                          </Badge>
                          <p className="text-xs text-text-secondary mt-1">{t('dashboard.pain', language)}: {s.painLevelBefore} → {s.painLevelAfter}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'tedavi' && (
                <div className="space-y-4">
                  {plans.length === 0 ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noTreatmentPlan', language)}</p>
                  ) : (
                    plans.map((plan) => (
                      <div key={plan.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-text-main">{plan.diagnosis}</h4>
                          <Badge variant={plan.status === 'Aktif' ? 'success' : 'default'}>{plan.status}</Badge>
                        </div>
                        <p className="text-xs text-text-secondary">{plan.description}</p>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={plan.completedSessions} max={plan.totalSessions} color="bg-health-green" />
                          <span className="text-xs font-medium text-text-main whitespace-nowrap">
                            {plan.completedSessions}/{plan.totalSessions}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.modalities.map((m) => (
                            <Badge key={m} variant="info">{m}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'egzersiz' && (
                <div className="space-y-4">
                  {!exerciseProgram ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noExerciseProgram', language)}</p>
                  ) : (
                    <>
                      <p className="text-sm text-text-secondary">{t('patientDetail.frequency', language)}: {exerciseProgram.frequency}</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {exerciseProgram.exercises.map((item) => {
                          const ex = allExercises.find((e) => e.id === item.exerciseId);
                          if (!ex) return null;
                          return (
                            <div key={item.exerciseId} className="rounded-lg border border-border/50 p-4">
                              <h4 className="text-sm font-semibold text-text-main">{ex.name}</h4>
                              <p className="text-xs text-text-secondary mt-1">{ex.description}</p>
                              <div className="flex gap-3 mt-2">
                                <Badge variant="info">{item.sets} set</Badge>
                                <Badge variant="info">{item.reps} tekrar</Badge>
                                <Badge variant={ex.difficulty === 'Kolay' ? 'success' : ex.difficulty === 'Orta' ? 'warning' : 'danger'}>
                                  {ex.difficulty}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'ilerleme' && (
                <div className="space-y-3">
                  {progress.length === 0 ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noProgress', language)}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="px-4 py-2 text-xs font-medium uppercase text-text-secondary">{t('progressTable.date', language)}</th>
                            <th className="px-4 py-2 text-xs font-medium uppercase text-text-secondary">{t('progressTable.painLevel', language)}</th>
                            <th className="px-4 py-2 text-xs font-medium uppercase text-text-secondary">{t('progressTable.rom', language)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                            <tr key={r.id} className="border-b border-border/50">
                              <td className="px-4 py-3 text-sm text-text-main">{formatDate(r.date)}</td>
                              <td className="px-4 py-3 text-sm text-text-main">{r.painLevel}/10</td>
                              <td className="px-4 py-3 text-sm text-text-main">{r.rangeOfMotion}°</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'odemeler' && (
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <p className="text-sm text-text-secondary">{t('patientDetail.noPayments', language)}</p>
                  ) : (
                    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                        <div>
                          <p className="text-sm font-medium text-text-main">{pay.description}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{formatDate(pay.date)} - {pay.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text-main">{formatCurrency(pay.amount)}</p>
                          <Badge variant={pay.status === 'Odendi' ? 'success' : pay.status === 'Bekliyor' ? 'warning' : 'danger'}>
                            {pay.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Quick stats */}
          <Card>
            <h3 className="text-sm font-semibold text-text-main mb-4">{t('patientDetail.summary', language)}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">{t('patientDetail.totalAppointments', language)}</span>
                <span className="text-sm font-medium text-text-main">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">{t('patientDetail.totalSessions', language)}</span>
                <span className="text-sm font-medium text-text-main">{patientSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">{t('patientDetail.activePlan', language)}</span>
                <span className="text-sm font-medium text-text-main">{plans.filter(p => p.status === 'Aktif').length}</span>
              </div>
            </div>
          </Card>

          {/* Motivational quote */}
          <Card className="bg-gradient-to-br from-primary/5 to-health-green/5">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-health-green shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-main">{t('patientDetail.motivation', language)}</h3>
                <p className="mt-2 text-xs italic text-text-secondary leading-relaxed">
                  &ldquo;{randomQuote}&rdquo;
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
