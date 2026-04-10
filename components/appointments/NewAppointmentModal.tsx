'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { therapists } from '@/lib/mock-data';
import { t } from '@/lib/i18n';
import type { Appointment, AppointmentType } from '@/lib/types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export default function NewAppointmentModal({ isOpen, onClose, defaultDate }: NewAppointmentModalProps) {
  const addAppointment = useStore((s) => s.addAppointment);
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);
  const patients = useStore((s) => s.patients);

  const [form, setForm] = useState({
    patientId: '',
    therapistId: therapists[0]?.id || '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '45',
    type: 'Tedavi Seansi' as AppointmentType,
    notes: '',
  });

  const effectivePatientId = form.patientId || patients[0]?.id || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === effectivePatientId);
    const therapist = therapists.find((th) => th.id === form.therapistId);
    if (!patient || !therapist) return;

    const dateTime = new Date(`${form.date}T${form.time}:00`);
    const endDateTime = new Date(dateTime.getTime() + parseInt(form.duration) * 60000);

    const newAppt: Appointment = {
      id: `a${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      therapistId: therapist.id,
      therapistName: `${therapist.firstName} ${therapist.lastName}`,
      date: dateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      duration: parseInt(form.duration),
      type: form.type,
      status: 'Planlandi',
      notes: form.notes,
    };

    addAppointment(newAppt);
    showToast(t('appointments.created', language));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('appointments.newModal', language)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={t('sessions.patient', language)}
          value={effectivePatientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
          options={patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
        />
        <Select
          label={t('appointments.therapist', language)}
          value={form.therapistId}
          onChange={(e) => setForm({ ...form, therapistId: e.target.value })}
          options={therapists.map((th) => ({ value: th.id, label: `${th.title} ${th.firstName} ${th.lastName}` }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('appointments.date', language)}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label={t('appointments.time', language)}
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('appointments.duration', language)}
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            options={[
              { value: '30', label: `30 ${t('appointments.minutes', language)}` },
              { value: '45', label: `45 ${t('appointments.minutes', language)}` },
              { value: '60', label: `60 ${t('appointments.minutes', language)}` },
            ]}
          />
          <Select
            label={t('appointments.type', language)}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}
            options={[
              { value: 'Tedavi Seansi', label: t('appointments.treatmentSession', language) },
              { value: 'Ilk Muayene', label: t('appointments.firstExam', language) },
              { value: 'Kontrol', label: t('appointments.checkup', language) },
              { value: 'Degerlendirme', label: t('appointments.evaluation', language) },
            ]}
          />
        </div>
        <Input
          label={t('appointments.note', language)}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder={t('appointments.notePlaceholder', language)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel', language)}
          </Button>
          <Button type="submit">{t('appointments.create', language)}</Button>
        </div>
      </form>
    </Modal>
  );
}
