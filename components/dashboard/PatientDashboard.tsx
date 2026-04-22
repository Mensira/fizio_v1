'use client';

import { useState } from 'react';
import { Calendar, Activity, TrendingUp, Dumbbell, Clock, ArrowRight, Stethoscope, Sparkles, Droplets, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import MotivationalQuote from './MotivationalQuote';
import DailyGoalsWidget from '@/components/patient/DailyGoalsWidget';
import WaterIntakeWidget from '@/components/patient/WaterIntakeWidget';
import MedicationWidget from '@/components/patient/MedicationWidget';
import { useStore } from '@/lib/store';
import { exercises as allExercises, progressRecords } from '@/lib/mock-data';
import { WATER_TIPS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/utils';
import { t, translateDiagnosis } from '@/lib/i18n';
import Link from 'next/link';

const INITIAL_TIP_INDEX = Math.floor(Math.random() * WATER_TIPS.length);

function WaterTipCard({ tr }: { tr: boolean }) {
  const [tipIndex, setTipIndex] = useState(INITIAL_TIP_INDEX);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-primary/3 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5" />
      <div className="absolute -left-2 -bottom-2 h-14 w-14 rounded-full bg-primary/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Droplets className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-text-main">
              {tr ? 'Su İçmeyi Unutma' : 'Stay Hydrated'}
            </h3>
          </div>
          <button
            onClick={() => setTipIndex((prev) => (prev + 1) % WATER_TIPS.length)}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-main transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm italic text-text-secondary leading-relaxed pl-1 border-l-2 border-primary/30 ml-1">
          &ldquo;{WATER_TIPS[tipIndex]}&rdquo;
        </p>
      </div>
    </Card>
  );
}

export default function PatientDashboard() {
  const language = useStore((s) => s.language);
  const appointments = useStore((s) => s.appointments);
  const sessions = useStore((s) => s.sessions);
  const patients = useStore((s) => s.patients);
  const treatmentPlans = useStore((s) => s.treatmentPlans);
  const exercisePrograms = useStore((s) => s.exercisePrograms);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);

  const tr = language === 'tr';
  const patient = patients.find((p) => p.id === loggedInPatientId);
  if (!patient) return null;

  const myAppointments = appointments
    .filter((a) => a.patientId === loggedInPatientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = myAppointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status === 'Planlandi'
  );

  const mySessions = sessions.filter((s) => s.patientId === loggedInPatientId);
  const completedSessions = mySessions.filter((s) => s.completed);

  const myPlan = treatmentPlans.find(
    (tp) => tp.patientId === loggedInPatientId && tp.status === 'Aktif'
  );

  const myExerciseProgram = exercisePrograms.find(
    (ep) => ep.patientId === loggedInPatientId
  );

  const myProgress = progressRecords
    .filter((pr) => pr.patientId === loggedInPatientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const nextAppt = upcomingAppointments[0];

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.goodMorning', language)
    : hour < 18
    ? t('dashboard.goodAfternoon', language)
    : t('dashboard.goodEvening', language);

  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-text-main">
            {greeting}, {patient.firstName}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('patientDash.subtitle', language)}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-card border border-border/50 px-4 py-2.5 shadow-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-text-main">
            {new Date().toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          title={t('patientDash.nextAppointment', language)}
          value={nextAppt ? formatDate(nextAppt.date) : '-'}
          icon={Calendar}
          iconBgColor="bg-primary/10"
        />
        <StatCard
          title={t('patientDash.completedSessions', language)}
          value={completedSessions.length}
          icon={Activity}
          iconBgColor="bg-health-green/10"
        />
        <StatCard
          title={t('patientDash.remainingSessions', language)}
          value={myPlan ? myPlan.totalSessions - myPlan.completedSessions : 0}
          icon={TrendingUp}
          iconBgColor="bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-3 lg:space-y-6">
          {/* Therapist & Diagnosis */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-main mb-2">
                  {t('patientDash.therapist', language)}
                </h3>
                <p className="text-base font-medium text-text-main">Fzt.Dr. Ceydanur Congaz</p>
                <p className="text-xs text-text-secondary">{tr ? 'Nörolojik Rehabilitasyon' : 'Neurological Rehabilitation'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary mb-1">{t('patientDash.diagnosis', language)}</p>
                <Badge variant="warning">{translateDiagnosis(patient.diagnosis, language)}</Badge>
              </div>
            </div>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-main">
                {t('patientDash.myAppointments', language)}
              </h3>
              <Link href="/randevular" className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1">
                {t('patientDash.viewAll', language)} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">
                {t('patientDash.noAppointments', language)}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 4).map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-background transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-main">{appt.type}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(appt.date).toLocaleDateString(locale, {
                          weekday: 'short', day: 'numeric', month: 'long',
                        })} - {formatTime(appt.date)}
                      </p>
                    </div>
                    <Badge variant="info">{appt.duration} {tr ? 'dk' : 'min'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Treatment Plan Progress */}
          {myPlan && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-main">
                  {t('patientDash.treatmentPlan', language)}
                </h3>
                <Link href="/tedavi-planlari" className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1">
                  {t('patientDash.viewAll', language)} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{translateDiagnosis(myPlan.diagnosis, language)}</span>
                  <span className="text-sm font-semibold text-primary">
                    {myPlan.completedSessions}/{myPlan.totalSessions} {t('dashboard.session', language)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-background overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary to-health-green transition-all duration-700"
                    style={{
                      width: `${Math.round((myPlan.completedSessions / myPlan.totalSessions) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {myPlan.goals.slice(0, 3).map((goal, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-health-green/10 px-3 py-1 text-xs font-medium text-health-green">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Water Tip */}
          <WaterTipCard tr={tr} />
        </div>

        {/* Right column */}
        <div className="space-y-3 lg:space-y-6">
          <MotivationalQuote />

          {/* Daily Exercise Reminder */}
          {myExerciseProgram && (
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                  <Sparkles className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-main mb-1">
                    {tr ? 'Günlük Egzersiz Hatırlatma' : 'Daily Exercise Reminder'}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {tr
                      ? `Bugün ${myExerciseProgram.exercises.length} egzersiziniz var. Sıklık: ${myExerciseProgram.frequency}. Düzenli egzersiz iyileşmenizi hızlandırır!`
                      : `You have ${myExerciseProgram.exercises.length} exercises today. Frequency: ${myExerciseProgram.frequency}. Regular exercise speeds up recovery!`
                    }
                  </p>
                  <Link
                    href="/egzersiz-programlari"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    {tr ? 'Egzersizlere Git' : 'Go to Exercises'} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* My Exercises */}
          {myExerciseProgram && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-main">
                  {t('patientDash.myExercises', language)}
                </h3>
                <Link href="/egzersiz-programlari" className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1">
                  {t('patientDash.viewAll', language)} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {myExerciseProgram.exercises.slice(0, 4).map((item) => {
                  const exercise = allExercises.find((e) => e.id === item.exerciseId);
                  if (!exercise) return null;
                  return (
                    <div key={item.exerciseId} className="flex items-center gap-3 rounded-lg border border-border/30 p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                        <Dumbbell className="h-4 w-4 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-main truncate">{exercise.name}</p>
                        <p className="text-[11px] text-text-secondary">
                          {item.sets} {t('patientDetail.set', language)} x {item.reps} {t('patientDetail.rep', language)}
                        </p>
                      </div>
                      <Badge variant={exercise.difficulty === 'Kolay' ? 'success' : exercise.difficulty === 'Orta' ? 'warning' : 'danger'}>
                        {exercise.difficulty === 'Kolay' ? t('difficulty.easy', language) : exercise.difficulty === 'Orta' ? t('difficulty.medium', language) : t('difficulty.hard', language)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-secondary mt-3">
                {tr ? `Sıklık: ${myExerciseProgram.frequency}` : `Frequency: ${myExerciseProgram.frequency}`}
              </p>
            </Card>
          )}

        </div>
      </div>

      {/* Daily Goals, Water, Medication, Progress — full width 4 columns */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
        <DailyGoalsWidget />
        <WaterIntakeWidget />
        <MedicationWidget />

        {/* Pain Progress */}
        {myProgress.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-main">
                {t('patientDash.myProgress', language)}
              </h3>
              <Link href="/ilerleme" className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1">
                {t('patientDash.viewAll', language)} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {myProgress.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-xs text-text-secondary">{formatDate(record.date)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">ROM: <span className="font-semibold text-text-main">{record.rangeOfMotion}°</span></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

    </div>
  );
}
