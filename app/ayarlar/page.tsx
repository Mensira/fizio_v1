'use client';

import { useState, useMemo } from 'react';
import {
  User, Building2, Clock, RotateCcw, Check, Heart, Phone, Mail,
  AlertTriangle, Stethoscope, CalendarClock, MessageSquare, ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/lib/store';
import type { ClinicSettings, ProfileSettings, WorkHoursSettings, NotificationSettings, PatientProfileSettings } from '@/lib/store';
import { t } from '@/lib/i18n';
import AppearanceTab from '@/components/settings/AppearanceTab';
import SecurityTab from '@/components/settings/SecurityTab';
import LanguageTab from '@/components/settings/LanguageTab';
import NotificationTab from '@/components/settings/NotificationTab';

/* ═══════ Section Menu (mobile-friendly) ═══════ */
function SectionMenu({ items, activeId, onChange }: { items: { id: string; label: string; icon: React.ReactNode }[]; activeId: string | null; onChange: (id: string | null) => void }) {
  // If a section is active, show back button + content
  if (activeId) {
    const active = items.find((i) => i.id === activeId);
    return (
      <button
        onClick={() => onChange(null)}
        className="flex items-center gap-2 text-sm text-primary font-medium mb-4 hover:underline"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        {active?.label || ''}
      </button>
    );
  }

  // Show list of sections
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="flex items-center gap-3 w-full rounded-xl border border-border/50 bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            {item.icon}
          </div>
          <span className="flex-1 text-sm font-medium text-text-main">{item.label}</span>
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </button>
      ))}
    </div>
  );
}

/* ═══════ Patient Settings Page ═══════ */
function PatientSettingsPage() {
  const language = useStore((s) => s.language);
  const showToast = useStore((s) => s.showToast);
  const patients = useStore((s) => s.patients);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patientProfiles = useStore((s) => s.patientProfiles);
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    const currentStored = loggedInPatientId ? patientProfiles[loggedInPatientId] : null;
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(currentStored || defaultPatientProfile);
    const notifChanged = JSON.stringify(notifications) !== JSON.stringify(storeNotifications);
    return profileChanged || notifChanged;
  }, [profile, notifications, patientProfiles, storeNotifications, loggedInPatientId, defaultPatientProfile]);

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

  const SECTIONS = [
    { id: 'profil', label: tr ? 'Profil Bilgilerim' : 'My Profile', icon: <User className="h-4 w-4 text-primary" /> },
    { id: 'tedavi', label: tr ? 'Tedavi Tercihleri' : 'Treatment Prefs', icon: <Stethoscope className="h-4 w-4 text-primary" /> },
    { id: 'bildirim', label: t('settings.notifications', language), icon: <MessageSquare className="h-4 w-4 text-primary" /> },
    { id: 'gorunum', label: tr ? 'Görünüm' : 'Appearance', icon: <Clock className="h-4 w-4 text-primary" /> },
    { id: 'guvenlik', label: tr ? 'Güvenlik' : 'Security', icon: <AlertTriangle className="h-4 w-4 text-primary" /> },
    { id: 'dil', label: t('settings.language', language), icon: <Building2 className="h-4 w-4 text-primary" /> },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-health-green to-health-green-light text-sm font-bold text-white shrink-0">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-main truncate">{patient.firstName} {patient.lastName}</h2>
          <p className="text-xs text-text-secondary">{t('settings.title', language)}</p>
        </div>
      </div>

      {/* Section navigation */}
      <SectionMenu items={SECTIONS} activeId={activeSection} onChange={setActiveSection} />

      {/* Section content */}
      {activeSection && (
        <form onSubmit={handleSave} className="space-y-4">
          {activeSection === 'profil' && (
            <Card>
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

                <p className="text-xs font-semibold text-text-main flex items-center gap-1.5 pt-2 border-t border-border/50">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" /> {tr ? 'Acil Durum' : 'Emergency'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={tr ? 'Acil Durum Kişisi' : 'Emergency Contact'} value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} />
                  <Input label={tr ? 'Acil Durum Tel.' : 'Emergency Phone'} value={profile.emergencyPhone} onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })} />
                </div>

                <p className="text-xs font-semibold text-text-main flex items-center gap-1.5 pt-2 border-t border-border/50">
                  <Heart className="h-3.5 w-3.5 text-danger" /> {tr ? 'Sağlık' : 'Health'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label={tr ? 'Kan Grubu' : 'Blood Type'} value={profile.bloodType} onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                    options={[{ value: '', label: tr ? 'Seçiniz' : 'Select' }, { value: 'A+', label: 'A Rh+' }, { value: 'A-', label: 'A Rh-' }, { value: 'B+', label: 'B Rh+' }, { value: 'B-', label: 'B Rh-' }, { value: 'AB+', label: 'AB Rh+' }, { value: 'AB-', label: 'AB Rh-' }, { value: '0+', label: '0 Rh+' }, { value: '0-', label: '0 Rh-' }]} />
                  <Input label={tr ? 'Alerjiler' : 'Allergies'} value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} />
                </div>
                <Input label={tr ? 'Ek Notlar' : 'Notes'} value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} />
              </div>
            </Card>
          )}

          {activeSection === 'tedavi' && (
            <Card>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-text-secondary" /> {tr ? 'Tercih Edilen Saatler' : 'Preferred Times'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: tr ? 'Sabah' : 'Morning', desc: '08-12' },
                    { label: tr ? 'Öğlen' : 'Afternoon', desc: '12-16' },
                    { label: tr ? 'Akşam' : 'Evening', desc: '16-20' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border/50 p-3 cursor-pointer hover:border-primary/30">
                      <Clock className="h-4 w-4 text-text-secondary shrink-0" />
                      <span className="text-sm font-medium text-text-main">{s.label}</span>
                      <span className="text-[10px] text-text-secondary ml-auto">{s.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-text-main flex items-center gap-1.5 pt-2 border-t border-border/50">
                  <MessageSquare className="h-3.5 w-3.5 text-text-secondary" /> {tr ? 'Bildirim Tercihleri' : 'Notification Prefs'}
                </p>
                {[
                  { label: tr ? 'Randevu hatırlatma' : 'Appointment reminders' },
                  { label: tr ? 'Tedavi güncellemeleri' : 'Treatment updates' },
                  { label: tr ? 'Egzersiz hatırlatma' : 'Exercise reminders' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                    <span className="text-sm text-text-main">{item.label}</span>
                    <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary shrink-0">
                      <span className="inline-block h-4 w-4 rounded-full bg-white shadow-sm translate-x-6" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'bildirim' && (
            <Card>
              <NotificationTab language={language} notifications={notifications} setNotifications={setNotifications}
                items={[
                  { key: 'appointmentReminder', label: tr ? 'Randevu Hatırlatma' : 'Appointment Reminder', desc: tr ? 'Yaklaşan randevular için bildirim' : 'Notifications for upcoming appointments' },
                  { key: 'sessionComplete', label: tr ? 'Seans Tamamlama' : 'Session Completion', desc: tr ? 'Seans bittiğinde bildirim' : 'Notification when session ends' },
                  { key: 'dailySummary', label: tr ? 'Günlük Özet' : 'Daily Summary', desc: tr ? 'Günlük tedavi özeti' : 'Daily treatment summary' },
                ]} />
            </Card>
          )}

          {activeSection === 'gorunum' && <Card><AppearanceTab language={language} /></Card>}
          {activeSection === 'guvenlik' && <Card><SecurityTab language={language} /></Card>}
          {activeSection === 'dil' && <Card><LanguageTab language={language} /></Card>}

          {(activeSection === 'profil' || activeSection === 'bildirim') && (
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" icon={RotateCcw} onClick={handleCancel} disabled={!hasChanges} className="flex-1">
                {t('common.cancel', language)}
              </Button>
              <Button type="submit" icon={Check} disabled={!hasChanges} className="flex-1">
                {t('settings.saveChanges', language)}
              </Button>
            </div>
          )}
        </form>
      )}
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
    if (!workHours[startKey] && !workHours[endKey]) {
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

  const SECTIONS = [
    { id: 'klinik', label: t('settings.clinicInfo', language), icon: <Building2 className="h-4 w-4 text-primary" /> },
    { id: 'profil', label: t('settings.profile', language), icon: <User className="h-4 w-4 text-primary" /> },
    { id: 'calisma', label: t('settings.workHours', language), icon: <Clock className="h-4 w-4 text-primary" /> },
    { id: 'bildirim', label: t('settings.notifications', language), icon: <MessageSquare className="h-4 w-4 text-primary" /> },
    { id: 'gorunum', label: tr ? 'Görünüm' : 'Appearance', icon: <Stethoscope className="h-4 w-4 text-primary" /> },
    { id: 'guvenlik', label: tr ? 'Güvenlik' : 'Security', icon: <AlertTriangle className="h-4 w-4 text-primary" /> },
    { id: 'dil', label: t('settings.language', language), icon: <CalendarClock className="h-4 w-4 text-primary" /> },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shrink-0">
          {storeProfile.fullName.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'DR'}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-main truncate">{storeProfile.fullName}</h2>
          <p className="text-xs text-text-secondary">{t('settings.title', language)}</p>
        </div>
      </div>

      {/* Section navigation */}
      <SectionMenu items={SECTIONS} activeId={activeSection} onChange={setActiveSection} />

      {/* Section content */}
      {activeSection && (
        <form onSubmit={handleSave} className="space-y-4">
          {activeSection === 'klinik' && (
            <Card>
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
            </Card>
          )}

          {activeSection === 'profil' && (
            <Card>
              <div className="space-y-4">
                <Input label={t('settings.fullName', language)} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label={t('settings.email', language)} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  <Input label={t('settings.phone', language)} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label={t('settings.titleField', language)} value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    options={[{ value: 'Fzt.', label: 'Fzt.' }, { value: 'Fzt.Dr.', label: 'Fzt.Dr.' }, { value: 'Uzm. Fzt.', label: 'Uzm. Fzt.' }, { value: 'Prof. Dr.', label: 'Prof. Dr.' }]} />
                  <Input label={t('settings.specialty', language)} value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} />
                </div>
                <Input label={t('settings.licenseNo', language)} value={profile.license} onChange={(e) => setProfile({ ...profile, license: e.target.value })} />
              </div>
            </Card>
          )}

          {activeSection === 'calisma' && (
            <Card>
              <div className="space-y-3">
                {days.map((day) => {
                  const startKey = `${day.key}Start`;
                  const endKey = `${day.key}End`;
                  const isClosed = !workHours[startKey] && !workHours[endKey];
                  return (
                    <div key={day.key} className={`rounded-lg p-3 ${isClosed ? 'bg-background' : 'border border-border/50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-main">{day.label}</span>
                        <div className="flex items-center gap-2">
                          {isClosed && <Badge variant="default">{t('common.closed', language)}</Badge>}
                          <button type="button" onClick={() => toggleDayOpen(day.key)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${!isClosed ? 'bg-primary' : 'bg-border'}`}>
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${!isClosed ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                          </button>
                        </div>
                      </div>
                      {!isClosed && (
                        <div className="flex items-center gap-2 mt-2">
                          <input type="time" value={workHours[startKey]} onChange={(e) => setWorkHours({ ...workHours, [startKey]: e.target.value })}
                            className="h-9 flex-1 rounded-lg border border-border px-2 text-sm focus:border-primary focus:outline-none" />
                          <span className="text-xs text-text-secondary">-</span>
                          <input type="time" value={workHours[endKey]} onChange={(e) => setWorkHours({ ...workHours, [endKey]: e.target.value })}
                            className="h-9 flex-1 rounded-lg border border-border px-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <Input label={t('settings.sessionDuration', language)} type="number" value={workHours.sessionDuration} onChange={(e) => setWorkHours({ ...workHours, sessionDuration: e.target.value })} />
                  <Input label={t('settings.breakBetween', language)} type="number" value={workHours.breakBetween} onChange={(e) => setWorkHours({ ...workHours, breakBetween: e.target.value })} />
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'bildirim' && (
            <Card>
              <NotificationTab language={language} notifications={notifications} setNotifications={setNotifications}
                items={[
                  { key: 'appointmentReminder', label: t('settings.appointmentReminder', language), desc: t('settings.appointmentReminderDesc', language) },
                  { key: 'sessionComplete', label: t('settings.sessionComplete', language), desc: t('settings.sessionCompleteDesc', language) },
                  { key: 'paymentReceived', label: t('settings.paymentNotif', language), desc: t('settings.paymentNotifDesc', language) },
                  { key: 'dailySummary', label: t('settings.dailySummary', language), desc: t('settings.dailySummaryDesc', language) },
                ]} />
            </Card>
          )}

          {activeSection === 'gorunum' && <Card><AppearanceTab language={language} /></Card>}
          {activeSection === 'guvenlik' && <Card><SecurityTab language={language} /></Card>}
          {activeSection === 'dil' && <Card><LanguageTab language={language} /></Card>}

          {['klinik', 'profil', 'calisma', 'bildirim'].includes(activeSection) && (
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" icon={RotateCcw} onClick={handleCancel} disabled={!hasChangesDr} className="flex-1">
                {t('common.cancel', language)}
              </Button>
              <Button type="submit" icon={Check} disabled={!hasChangesDr} className="flex-1">
                {t('settings.saveChanges', language)}
              </Button>
            </div>
          )}
        </form>
      )}
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
