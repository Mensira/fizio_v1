'use client';

import { useState, useMemo } from 'react';
import {
  User, Building2, Clock, RotateCcw, Check, Heart, Phone, Mail,
  AlertTriangle, Shield, Stethoscope, CalendarClock, MessageSquare,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import { useStore } from '@/lib/store';
import type { ClinicSettings, ProfileSettings, WorkHoursSettings, NotificationSettings, PatientProfileSettings } from '@/lib/store';
import { t } from '@/lib/i18n';
import AppearanceTab from '@/components/settings/AppearanceTab';
import SecurityTab from '@/components/settings/SecurityTab';
import LanguageTab from '@/components/settings/LanguageTab';
import NotificationTab from '@/components/settings/NotificationTab';

/* ═══════ Patient Settings Page ═══════ */
function PatientSettingsPage() {
  const language = useStore((s) => s.language);
  const showToast = useStore((s) => s.showToast);
  const patients = useStore((s) => s.patients);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patientProfiles = useStore((s) => s.patientProfiles);
  const treatmentPlans = useStore((s) => s.treatmentPlans);
  const updatePatientProfile = useStore((s) => s.updatePatientProfile);
  const storeNotifications = useStore((s) => s.notifications);
  const updateNotifications = useStore((s) => s.updateNotifications);

  const tr = language === 'tr';
  const patient = patients.find((p) => p.id === loggedInPatientId);

  const storedProfile = loggedInPatientId ? patientProfiles[loggedInPatientId] : null;
  const defaultPatientProfile = useMemo<PatientProfileSettings>(() => ({
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    notes: '',
  }), [patient?.phone, patient?.email]);

  const [profile, setProfile] = useState<PatientProfileSettings>(storedProfile || defaultPatientProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>({ ...storeNotifications });
  const hasChanges = useMemo(() => {
    const currentStored = loggedInPatientId ? patientProfiles[loggedInPatientId] : null;
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(currentStored || defaultPatientProfile);
    const notifChanged = JSON.stringify(notifications) !== JSON.stringify(storeNotifications);
    return profileChanged || notifChanged;
  }, [profile, notifications, patientProfiles, storeNotifications, loggedInPatientId, defaultPatientProfile]);

  const TABS = [
    { id: 'profil', label: tr ? 'Profilim' : 'My Profile' },
    { id: 'tedavi', label: tr ? 'Tedavi Tercihleri' : 'Treatment Prefs' },
    { id: 'bildirim', label: t('settings.notifications', language) },
    { id: 'gorunum', label: tr ? 'Görünüm' : 'Appearance' },
    { id: 'guvenlik', label: tr ? 'Güvenlik' : 'Security' },
    { id: 'dil', label: t('settings.language', language) },
  ];
  const [activeTab, setActiveTab] = useState('profil');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedInPatientId) updatePatientProfile(loggedInPatientId, profile);
    updateNotifications(notifications);
    showToast(t('settings.saved', language));
  };

  const handleCancel = () => {
    const currentStored = loggedInPatientId ? patientProfiles[loggedInPatientId] : null;
    setProfile(currentStored || defaultPatientProfile);
    setNotifications({ ...storeNotifications });
  };

  if (!patient) return null;

  const myPlans = treatmentPlans.filter((tp) => tp.patientId === loggedInPatientId);
  const activePlan = myPlans.find((tp) => tp.status === 'Aktif');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-main">{t('settings.title', language)}</h2>
        <p className="text-sm text-text-secondary">{tr ? 'Profil, bildirim ve güvenlik ayarlarınızı yönetin' : 'Manage your profile, notification, and security settings'}</p>
      </div>

      {/* Patient summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-health-green" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Hesap' : 'Account'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main truncate">{patient.firstName} {patient.lastName}</p>
          <p className="text-[11px] text-text-secondary">{patient.diagnosis}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Tedavi' : 'Treatment'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main">{activePlan ? (tr ? 'Aktif' : 'Active') : (tr ? 'Yok' : 'None')}</p>
          <p className="text-[11px] text-text-secondary">{activePlan ? `${activePlan.completedSessions}/${activePlan.totalSessions} ${tr ? 'seans' : 'sessions'}` : '-'}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-warning" />
            <span className="text-[11px] text-text-secondary">{tr ? 'İletişim' : 'Contact'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main truncate">{profile.phone || (tr ? 'Girilmedi' : 'Not set')}</p>
          <p className="text-[11px] text-text-secondary truncate">{profile.email || '-'}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-danger" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Güvenlik' : 'Security'}</span>
          </div>
          <p className="text-sm font-semibold text-health-green">{tr ? 'Güvenli' : 'Secure'}</p>
          <p className="text-[11px] text-text-secondary">{tr ? 'Şifre aktif' : 'Password active'}</p>
        </div>
      </div>

      <Card padding={false}>
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
          {activeTab === 'profil' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
                  <User className="h-5 w-5 text-health-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">{tr ? 'Profil Bilgilerim' : 'My Profile Info'}</h3>
                  <p className="text-xs text-text-secondary">{tr ? 'Kişisel ve iletişim bilgileriniz' : 'Your personal and contact information'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-health-green to-health-green-light text-lg font-bold text-white">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-text-secondary">{patient.diagnosis}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{patient.gender === 'Erkek' ? (tr ? 'Erkek' : 'Male') : (tr ? 'Kadın' : 'Female')}</Badge>
                    {patient.birthDate && <Badge variant="default">{patient.birthDate}</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-text-main">
                      <Phone className="h-3.5 w-3.5 text-text-secondary" /> {t('settings.phone', language)}
                    </label>
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-text-main">
                      <Mail className="h-3.5 w-3.5 text-text-secondary" /> {t('settings.email', language)}
                    </label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>

                <Input label={tr ? 'Adres' : 'Address'} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder={tr ? 'Ev adresiniz...' : 'Your home address...'} />

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-semibold text-text-main mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" /> {tr ? 'Acil Durum Bilgileri' : 'Emergency Information'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={tr ? 'Acil Durum Kişisi' : 'Emergency Contact'} value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} placeholder={tr ? 'Ad Soyad' : 'Full Name'} />
                    <Input label={tr ? 'Acil Durum Telefonu' : 'Emergency Phone'} value={profile.emergencyPhone} onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })} placeholder="0532 000 0000" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-semibold text-text-main mb-3 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-danger" /> {tr ? 'Sağlık Bilgileri' : 'Health Information'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label={tr ? 'Kan Grubu' : 'Blood Type'}
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      options={[
                        { value: '', label: tr ? 'Seçiniz' : 'Select' },
                        { value: 'A+', label: 'A Rh+' }, { value: 'A-', label: 'A Rh-' },
                        { value: 'B+', label: 'B Rh+' }, { value: 'B-', label: 'B Rh-' },
                        { value: 'AB+', label: 'AB Rh+' }, { value: 'AB-', label: 'AB Rh-' },
                        { value: '0+', label: '0 Rh+' }, { value: '0-', label: '0 Rh-' },
                      ]}
                    />
                    <Input label={tr ? 'Alerjiler' : 'Allergies'} value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} placeholder={tr ? 'Bilinen alerjiler...' : 'Known allergies...'} />
                  </div>
                </div>

                <Input label={tr ? 'Ek Notlar' : 'Additional Notes'} value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} placeholder={tr ? 'Doktorunuzla paylaşmak istediğiniz notlar...' : 'Notes you want to share with your doctor...'} />
              </div>
            </>
          )}

          {activeTab === 'tedavi' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">{tr ? 'Tedavi Tercihleri' : 'Treatment Preferences'}</h3>
                  <p className="text-xs text-text-secondary">{tr ? 'Randevu ve iletişim tercihlerinizi belirleyin' : 'Set your appointment and communication preferences'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-text-main mb-3 flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 text-text-secondary" /> {tr ? 'Tercih Edilen Randevu Saatleri' : 'Preferred Appointment Times'}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: tr ? 'Sabah' : 'Morning', desc: '08:00 - 12:00', value: 'morning' },
                      { label: tr ? 'Öğlen' : 'Afternoon', desc: '12:00 - 16:00', value: 'afternoon' },
                      { label: tr ? 'Akşam' : 'Evening', desc: '16:00 - 20:00', value: 'evening' },
                    ].map((slot) => (
                      <div key={slot.value} className="flex flex-col items-center gap-1 rounded-xl border-2 border-border/50 hover:border-primary/30 p-4 cursor-pointer transition-all">
                        <Clock className="h-5 w-5 text-text-secondary" />
                        <span className="text-sm font-medium text-text-main">{slot.label}</span>
                        <span className="text-[10px] text-text-secondary">{slot.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-semibold text-text-main mb-3 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-text-secondary" /> {tr ? 'İletişim Tercihleri' : 'Communication Preferences'}
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: tr ? 'Randevu hatırlatma yöntemi' : 'Appointment reminder method', desc: tr ? 'Randevularınız için nasıl hatırlatılmak istersiniz' : 'How would you like to be reminded of appointments' },
                      { label: tr ? 'Tedavi güncellemeleri' : 'Treatment updates', desc: tr ? 'Tedavi planı değişikliklerinde bilgilendirilme' : 'Get informed about treatment plan changes' },
                      { label: tr ? 'Egzersiz hatırlatmaları' : 'Exercise reminders', desc: tr ? 'Günlük egzersiz zamanı geldiğinde hatırlatma' : 'Reminder when daily exercise time comes' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                        <div>
                          <p className="text-sm font-medium text-text-main">{item.label}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                        </div>
                        <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                          <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm translate-x-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bildirim' && (
            <NotificationTab
              language={language}
              notifications={notifications}
              setNotifications={setNotifications}
              items={[
                { key: 'appointmentReminder', label: tr ? 'Randevu Hatırlatma' : 'Appointment Reminder', desc: tr ? 'Yaklaşan randevularınız için bildirim alın' : 'Get notified for upcoming appointments' },
                { key: 'sessionComplete', label: tr ? 'Seans Tamamlama' : 'Session Completion', desc: tr ? 'Seansınız tamamlandığında bildirim alın' : 'Get notified when your session is completed' },
                { key: 'dailySummary', label: tr ? 'Günlük Özet' : 'Daily Summary', desc: tr ? 'Tedavi sürecinizle ilgili günlük özet alın' : 'Get daily summary about your treatment' },
              ]}
            />
          )}

          {activeTab === 'gorunum' && <AppearanceTab language={language} />}
          {activeTab === 'guvenlik' && <SecurityTab language={language} />}
          {activeTab === 'dil' && <LanguageTab language={language} />}

          {(activeTab === 'profil' || activeTab === 'bildirim') && (
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="secondary" type="button" icon={RotateCcw} onClick={handleCancel} disabled={!hasChanges}>
                {t('common.cancel', language)}
              </Button>
              <Button type="submit" icon={Check} disabled={!hasChanges}>
                {t('settings.saveChanges', language)}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

/* ═══════ Doctor Settings Page ═══════ */
function DoctorSettingsPage() {
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);

  const storeClinic = useStore((s) => s.clinic);
  const storeProfile = useStore((s) => s.profile);
  const storeWorkHours = useStore((s) => s.workHours);
  const storeNotifications = useStore((s) => s.notifications);
  const updateClinic = useStore((s) => s.updateClinic);
  const updateProfile = useStore((s) => s.updateProfile);
  const updateWorkHours = useStore((s) => s.updateWorkHours);
  const updateNotifications = useStore((s) => s.updateNotifications);

  const [clinic, setClinic] = useState<ClinicSettings>({ ...storeClinic });
  const [profile, setProfile] = useState<ProfileSettings>({ ...storeProfile });
  const [workHours, setWorkHours] = useState<WorkHoursSettings>({ ...storeWorkHours });
  const [notifications, setNotifications] = useState<NotificationSettings>({ ...storeNotifications });
  const tr = language === 'tr';

  const TABS = [
    { id: 'klinik', label: t('settings.clinicInfo', language) },
    { id: 'profil', label: t('settings.profile', language) },
    { id: 'calisma', label: t('settings.workHours', language) },
    { id: 'bildirim', label: t('settings.notifications', language) },
    { id: 'gorunum', label: tr ? 'Görünüm' : 'Appearance' },
    { id: 'guvenlik', label: tr ? 'Güvenlik' : 'Security' },
    { id: 'dil', label: t('settings.language', language) },
  ];

  const [activeTab, setActiveTab] = useState('klinik');

  const hasChangesDr = useMemo(() => {
    return (
      JSON.stringify(clinic) !== JSON.stringify(storeClinic) ||
      JSON.stringify(profile) !== JSON.stringify(storeProfile) ||
      JSON.stringify(workHours) !== JSON.stringify(storeWorkHours) ||
      JSON.stringify(notifications) !== JSON.stringify(storeNotifications)
    );
  }, [clinic, profile, workHours, notifications, storeClinic, storeProfile, storeWorkHours, storeNotifications]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinic(clinic);
    updateProfile(profile);
    updateWorkHours(workHours);
    updateNotifications(notifications);
    showToast(t('settings.saved', language));
  };

  const handleCancel = () => {
    setClinic({ ...storeClinic });
    setProfile({ ...storeProfile });
    setWorkHours({ ...storeWorkHours });
    setNotifications({ ...storeNotifications });
  };

  const toggleDayOpen = (dayKey: string) => {
    const startKey = `${dayKey}Start`;
    const endKey = `${dayKey}End`;
    const isClosed = !workHours[startKey] && !workHours[endKey];
    if (isClosed) {
      setWorkHours({ ...workHours, [startKey]: '09:00', [endKey]: '17:00' });
    } else {
      setWorkHours({ ...workHours, [startKey]: '', [endKey]: '' });
    }
  };

  const days = [
    { key: 'monday', label: t('days.monday', language) },
    { key: 'tuesday', label: t('days.tuesday', language) },
    { key: 'wednesday', label: t('days.wednesday', language) },
    { key: 'thursday', label: t('days.thursday', language) },
    { key: 'friday', label: t('days.friday', language) },
    { key: 'saturday', label: t('days.saturday', language) },
    { key: 'sunday', label: t('days.sunday', language) },
  ];

  // Quick info for summary cards
  const storePatients = useStore((s) => s.patients);


  const openDays = days.filter((d) => {
    const startKey = `${d.key}Start`;
    return !!storeWorkHours[startKey];
  }).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-main">{t('settings.title', language)}</h2>
        <p className="text-sm text-text-secondary">{t('settings.subtitle', language)}</p>
      </div>

      {/* Doctor summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Klinik' : 'Clinic'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main truncate">{storeClinic.name}</p>
          <p className="text-[11px] text-text-secondary">{storeClinic.city}, {storeClinic.district}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-health-green" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Profil' : 'Profile'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main truncate">{storeProfile.fullName}</p>
          <p className="text-[11px] text-text-secondary">{storeProfile.specialty}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Çalışma' : 'Schedule'}</span>
          </div>
          <p className="text-sm font-semibold text-text-main">{openDays} {tr ? 'gün/hafta' : 'days/week'}</p>
          <p className="text-[11px] text-text-secondary">{storeWorkHours.sessionDuration} {tr ? 'dk seans' : 'min session'}</p>
        </div>
        <div className="rounded-xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-danger" />
            <span className="text-[11px] text-text-secondary">{tr ? 'Durum' : 'Status'}</span>
          </div>
          <p className="text-sm font-semibold text-health-green">{tr ? 'Aktif' : 'Active'}</p>
          <p className="text-[11px] text-text-secondary">{storePatients.length} {tr ? 'hasta' : 'patients'}</p>
        </div>
      </div>

      <Card padding={false}>
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
          {activeTab === 'klinik' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">{t('settings.clinicInfoTitle', language)}</h3>
                  <p className="text-xs text-text-secondary">{t('settings.clinicInfoDesc', language)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input label={t('settings.clinicName', language)} value={clinic.name} onChange={(e) => setClinic({ ...clinic, name: e.target.value })} />
                <Input label={t('settings.address', language)} value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t('settings.city', language)} value={clinic.city} onChange={(e) => setClinic({ ...clinic, city: e.target.value })} />
                  <Input label={t('settings.district', language)} value={clinic.district} onChange={(e) => setClinic({ ...clinic, district: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t('settings.phone', language)} value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} />
                  <Input label={t('settings.email', language)} value={clinic.email} onChange={(e) => setClinic({ ...clinic, email: e.target.value })} />
                </div>
                <Input label={t('settings.taxNo', language)} value={clinic.taxNo} onChange={(e) => setClinic({ ...clinic, taxNo: e.target.value })} />
              </div>
            </>
          )}

          {activeTab === 'profil' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">{t('settings.profileTitle', language)}</h3>
                  <p className="text-xs text-text-secondary">{t('settings.profileDesc', language)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-lg font-bold text-white">
                  {profile.fullName.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'CC'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">{profile.fullName}</p>
                  <p className="text-xs text-text-secondary">{profile.specialty}</p>
                  <Badge variant="info" className="mt-1">{profile.license}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Input label={t('settings.fullName', language)} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t('settings.email', language)} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  <Input label={t('settings.phone', language)} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label={t('settings.titleField', language)}
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    options={[
                      { value: 'Fzt.', label: 'Fzt.' },
                      { value: 'Fzt.Dr.', label: 'Fzt.Dr.' },
                      { value: 'Uzm. Fzt.', label: 'Uzm. Fzt.' },
                      { value: 'Prof. Dr.', label: 'Prof. Dr.' },
                    ]}
                  />
                  <Input label={t('settings.specialty', language)} value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} />
                </div>
                <Input label={t('settings.licenseNo', language)} value={profile.license} onChange={(e) => setProfile({ ...profile, license: e.target.value })} />
              </div>
            </>
          )}

          {activeTab === 'calisma' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">{t('settings.workHoursTitle', language)}</h3>
                  <p className="text-xs text-text-secondary">{t('settings.workHoursDesc', language)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {days.map((day) => {
                  const startKey = `${day.key}Start`;
                  const endKey = `${day.key}End`;
                  const isClosed = !workHours[startKey] && !workHours[endKey];

                  return (
                    <div key={day.key} className={`flex items-center gap-4 rounded-lg p-3 ${isClosed ? 'bg-background' : 'border border-border/50'}`}>
                      <span className="w-24 text-sm font-medium text-text-main">{day.label}</span>
                      <button
                        type="button"
                        onClick={() => toggleDayOpen(day.key)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${!isClosed ? 'bg-primary' : 'bg-border'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${!isClosed ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                      </button>
                      {isClosed ? (
                        <Badge variant="default">{t('common.closed', language)}</Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="time" value={workHours[startKey]} onChange={(e) => setWorkHours({ ...workHours, [startKey]: e.target.value })} className="h-9 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                          <span className="text-xs text-text-secondary">-</span>
                          <input type="time" value={workHours[endKey]} onChange={(e) => setWorkHours({ ...workHours, [endKey]: e.target.value })} className="h-9 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input label={t('settings.sessionDuration', language)} type="number" value={workHours.sessionDuration} onChange={(e) => setWorkHours({ ...workHours, sessionDuration: e.target.value })} />
                <Input label={t('settings.breakBetween', language)} type="number" value={workHours.breakBetween} onChange={(e) => setWorkHours({ ...workHours, breakBetween: e.target.value })} />
              </div>
            </>
          )}

          {activeTab === 'bildirim' && (
            <NotificationTab
              language={language}
              notifications={notifications}
              setNotifications={setNotifications}
              items={[
                { key: 'appointmentReminder', label: t('settings.appointmentReminder', language), desc: t('settings.appointmentReminderDesc', language) },
                { key: 'sessionComplete', label: t('settings.sessionComplete', language), desc: t('settings.sessionCompleteDesc', language) },
                { key: 'paymentReceived', label: t('settings.paymentNotif', language), desc: t('settings.paymentNotifDesc', language) },
                { key: 'dailySummary', label: t('settings.dailySummary', language), desc: t('settings.dailySummaryDesc', language) },
              ]}
            />
          )}

          {activeTab === 'gorunum' && <AppearanceTab language={language} />}
          {activeTab === 'guvenlik' && <SecurityTab language={language} />}
          {activeTab === 'dil' && <LanguageTab language={language} />}

          {['klinik', 'profil', 'calisma', 'bildirim'].includes(activeTab) && (
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="secondary" type="button" icon={RotateCcw} onClick={handleCancel} disabled={!hasChangesDr}>
                {t('common.cancel', language)}
              </Button>
              <Button type="submit" icon={Check} disabled={!hasChangesDr}>
                {t('settings.saveChanges', language)}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

/* ═══════ Main Export ═══════ */
export default function AyarlarPage() {
  const userRole = useStore((s) => s.userRole);

  if (userRole === 'patient') {
    return <PatientSettingsPage />;
  }

  return <DoctorSettingsPage />;
}
