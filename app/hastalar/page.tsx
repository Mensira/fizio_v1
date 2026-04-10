'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, ChevronRight, Phone } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function HastalarPage() {
  const router = useRouter();
  const patients = useStore((s) => s.patients);
  const treatmentPlans = useStore((s) => s.treatmentPlans);
  const addPatient = useStore((s) => s.addPatient);
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);
  const tr = language === 'tr';

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    birthDate: '', gender: 'Erkek' as 'Erkek' | 'Kadin',
    diagnosis: '', notes: '',
  });

  const enriched = useMemo(() => {
    return patients.map((p) => {
      const plan = treatmentPlans.find((tp) => tp.patientId === p.id && tp.status === 'Aktif');
      return { ...p, plan, isActive: !!plan };
    });
  }, [patients, treatmentPlans]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enriched;
    const q = search.toLowerCase();
    return enriched.filter((p) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }, [enriched, search]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({ id: `p${Date.now()}`, ...form, createdAt: new Date().toISOString() });
    showToast(t('patients.added', language));
    setModalOpen(false);
    setForm({ firstName: '', lastName: '', phone: '', email: '', birthDate: '', gender: 'Erkek', diagnosis: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">{t('patients.title', language)}</h2>
          <p className="text-sm text-text-secondary">{patients.length} {t('patients.registered', language)}</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          {t('patients.new', language)}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder={t('patients.searchPlaceholder', language)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </div>

      {/* Patient List */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <Users className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">{t('patients.notFoundSearch', language)}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient) => (
            <div
              key={patient.id}
              className="rounded-xl bg-card shadow-sm border border-border/50 p-6 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
              onClick={() => router.push(`/hastalar/${patient.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shrink-0 ${patient.isActive ? 'bg-primary/10 text-primary' : 'bg-background text-text-secondary'}`}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <Badge variant={patient.isActive ? 'success' : 'default'}>
                      {patient.isActive ? t('patients.activeStatus', language) : t('patients.inactiveStatus', language)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-text-secondary">
                    <span>{patient.diagnosis}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </span>
                  </div>
                </div>

                {/* Treatment info */}
                {patient.plan && (
                  <div className="hidden sm:block shrink-0 text-right mr-2">
                    <p className="text-xs text-text-secondary">
                      {patient.plan.completedSessions}/{patient.plan.totalSessions} {t('common.sessions', language)}
                    </p>
                    <div className="w-24 h-1.5 rounded-full bg-background mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((patient.plan.completedSessions / patient.plan.totalSessions) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('patients.addModal', language)} size="lg">
        <form onSubmit={handleAddPatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('patients.firstName', language)} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label={t('patients.lastName', language)} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('patients.phone', language)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label={t('patients.email', language)} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('patients.birthDate', language)} type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            <Select
              label={t('patients.gender', language)}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'Erkek' | 'Kadin' })}
              options={[{ value: 'Erkek', label: t('patients.male', language) }, { value: 'Kadin', label: t('patients.female', language) }]}
            />
          </div>
          <Input label={t('patients.diagnosis', language)} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
          <Input label={t('patients.notes', language)} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>{t('common.cancel', language)}</Button>
            <Button type="submit">{t('patients.addButton', language)}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
