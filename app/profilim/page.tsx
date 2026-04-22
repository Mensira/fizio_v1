'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t, translateDiagnosis } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  UserCircle, Activity, CreditCard, AlertTriangle, Phone, Mail, Droplets, ShieldAlert, UserCheck,
} from 'lucide-react';

export default function ProfilimPage() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patients = useStore((s) => s.patients);
  const sessions = useStore((s) => s.sessions);
  const payments = useStore((s) => s.payments);
  const patientProfiles = useStore((s) => s.patientProfiles);

  const patient = patients.find((p) => p.id === loggedInPatientId);
  const profile = patientProfiles[loggedInPatientId || ''];

  const tr = language === 'tr';

  const stats = useMemo(() => {
    const pid = loggedInPatientId || '';
    const mySessions = sessions.filter((s) => s.patientId === pid);
    const myPayments = payments.filter((p) => p.patientId === pid);
    const completedSessions = mySessions.filter((s) => s.completed).length;
    const totalPaid = myPayments.filter((p) => p.status === 'Odendi').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = myPayments.filter((p) => p.status === 'Bekliyor').reduce((sum, p) => sum + p.amount, 0);

    return {
      completedSessions,
      totalSessions: mySessions.length,
      totalPaid,
      pendingPayments,
    };
  }, [loggedInPatientId, sessions, payments]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  const calcAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (!patient) return null;

  const phone = profile?.phone || patient.phone || '';
  const email = profile?.email || patient.email || '';
  const bloodType = profile?.bloodType || '';
  const allergies = profile?.allergies || '';
  const emergencyContact = profile?.emergencyContact || '';
  const emergencyPhone = profile?.emergencyPhone || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('profile.title', language)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('profile.subtitle', language)}
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-main">{patient.firstName} {patient.lastName}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <Badge variant="info">{translateDiagnosis(patient.diagnosis, language)}</Badge>
              <span className="text-xs text-text-secondary">
                {calcAge(patient.birthDate)} {t('profile.yearsOld', language)}
              </span>
              <span className="text-xs text-text-secondary">
                {patient.gender === 'Erkek' ? t('common.male', language) : t('common.female', language)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {phone && (
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-xs text-text-secondary">{t('profile.registrationDate', language)}</p>
            <p className="text-sm font-medium text-text-main">{formatDate(patient.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Health Info */}
      {(bloodType || allergies || emergencyContact || patient.notes) && (
        <Card>
          <h3 className="text-base font-semibold text-text-main mb-4">
            {t('profile.healthInfo', language)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bloodType && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                <Droplets className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">{t('profile.bloodType', language)}</p>
                  <p className="text-sm font-medium text-text-main">{bloodType}</p>
                </div>
              </div>
            )}
            {allergies && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                <ShieldAlert className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">{t('profile.allergies', language)}</p>
                  <p className="text-sm font-medium text-text-main">{allergies}</p>
                </div>
              </div>
            )}
            {emergencyContact && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                <UserCheck className="h-4 w-4 text-health-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">{t('profile.emergencyContact', language)}</p>
                  <p className="text-sm font-medium text-text-main">{emergencyContact}</p>
                  {emergencyPhone && (
                    <p className="text-xs text-text-secondary">{emergencyPhone}</p>
                  )}
                </div>
              </div>
            )}
            {patient.notes && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3 sm:col-span-2">
                <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">{t('profile.clinicalNotes', language)}</p>
                  <p className="text-sm font-medium text-text-main">{patient.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Treatment Summary */}
      <Card>
        <h3 className="text-base font-semibold text-text-main mb-4">
          {t('profile.treatmentSummary', language)}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-border bg-background/50 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-health-green/10">
              <Activity className="h-4 w-4 text-health-green" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-main">{stats.completedSessions}/{stats.totalSessions}</p>
              <p className="text-xs text-text-secondary">{t('profile.sessions', language)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <CreditCard className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-main">{stats.totalPaid.toLocaleString()}₺</p>
              <p className="text-xs text-text-secondary">{t('profile.paid', language)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending payment warning */}
      {stats.pendingPayments > 0 && (
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-main">
              {t('profile.pendingPayment', language)}
            </p>
            <p className="text-xs text-text-secondary">
              {stats.pendingPayments.toLocaleString()}₺ {t('profile.pendingPaymentDesc', language)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
