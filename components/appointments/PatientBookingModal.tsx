'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import type { AppointmentRequest } from '@/lib/store';
import { t } from '@/lib/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientBookingModal({ isOpen, onClose }: Props) {
  const addAppointmentRequest = useStore((s) => s.addAppointmentRequest);
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);
  const patients = useStore((s) => s.patients);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);

  const tr = language === 'tr';
  const patient = patients.find((p) => p.id === loggedInPatientId);

  const [form, setForm] = useState({
    date: '',
    time: '09:00',
    type: 'Tedavi Seansi',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    if (!form.date) {
      showToast(tr ? 'Lütfen bir tarih seçin' : 'Please select a date', 'error');
      return;
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;

    const newRequest: AppointmentRequest = {
      id: `ar-${Date.now()}`,
      patientId: patient.id,
      patientName,
      preferredDate: form.date,
      preferredTime: form.time,
      type: form.type,
      notes: form.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addAppointmentRequest(newRequest);
    showToast(tr ? 'Randevu talebiniz gönderildi. Doktorunuz onayladığında bildirim alacaksınız.' : 'Appointment request sent. You will be notified when your doctor approves.');
    setForm({ date: '', time: '09:00', type: 'Tedavi Seansi', notes: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tr ? 'Randevu Talep Et' : 'Request Appointment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {patient && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs text-text-secondary">{tr ? 'Hasta' : 'Patient'}</p>
            <p className="text-sm font-medium text-text-main">{patient.firstName} {patient.lastName}</p>
          </div>
        )}

        <div className="rounded-xl bg-health-green/5 border border-health-green/10 p-3">
          <p className="text-xs text-text-secondary">{tr ? 'Fizyoterapist' : 'Therapist'}</p>
          <p className="text-sm font-medium text-text-main">Fzt.Dr. Ceydanur Congaz</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={tr ? 'Tercih Edilen Tarih' : 'Preferred Date'}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label={tr ? 'Tercih Edilen Saat' : 'Preferred Time'}
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        <Select
          label={tr ? 'Randevu Türü' : 'Appointment Type'}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={[
            { value: 'Tedavi Seansi', label: t('appointments.treatmentSession', language) },
            { value: 'Kontrol', label: t('appointments.checkup', language) },
            { value: 'Degerlendirme', label: t('appointments.evaluation', language) },
          ]}
        />

        <Input
          label={tr ? 'Notlar' : 'Notes'}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder={tr ? 'Ek bilgi veya şikayetinizi yazın...' : 'Additional notes...'}
        />

        <div className="rounded-xl bg-warning/5 border border-warning/10 p-3">
          <p className="text-xs text-text-secondary">
            {tr
              ? 'Randevu talebiniz doktorunuza iletilecektir. Onaylandığında bildirim alacaksınız.'
              : 'Your request will be sent to your doctor. You will be notified when approved.'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel', language)}
          </Button>
          <Button type="submit">{tr ? 'Talep Gönder' : 'Send Request'}</Button>
        </div>
      </form>
    </Modal>
  );
}
