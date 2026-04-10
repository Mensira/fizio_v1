'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import { useStore } from '@/lib/store';
import { APPOINTMENT_STATUS_COLORS } from '@/lib/constants';
import NewAppointmentModal from './NewAppointmentModal';
import AppointmentDetailModal from './AppointmentDetailModal';
import type { Appointment } from '@/lib/types';
import type { EventInput } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';

/** Censor a last name: "Yılmaz" -> "******" (same char count) */
function censorLastName(fullName: string): string {
  const parts = fullName.split(' ');
  if (parts.length < 2) return fullName;
  const last = parts[parts.length - 1];
  return [...parts.slice(0, -1), '*'.repeat(last.length)].join(' ');
}

export default function AppointmentCalendar() {
  const appointments = useStore((s) => s.appointments);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);

  const isPatient = userRole === 'patient';

  const events: EventInput[] = appointments.map((a) => {
    const isOwn = a.patientId === loggedInPatientId;

    if (isPatient && !isOwn) {
      // Other patients: censored name, neutral color, no status info
      return {
        id: a.id,
        title: censorLastName(a.patientName),
        start: a.date,
        end: a.endDate,
        backgroundColor: '#94A3B8',
        borderColor: 'transparent',
        extendedProps: { appointment: a },
      };
    }

    return {
      id: a.id,
      title: isPatient ? `${a.patientName} - ${a.type}` : `${a.patientName} - ${a.type}`,
      start: a.date,
      end: a.endDate,
      backgroundColor: APPOINTMENT_STATUS_COLORS[a.status],
      borderColor: 'transparent',
      extendedProps: { appointment: a },
    };
  });

  const handleDateClick = (info: DateClickArg) => {
    if (isPatient) return;
    setSelectedDate(info.dateStr.split('T')[0]);
    setModalOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    const appt = info.event.extendedProps.appointment as Appointment;
    // Patients can only click their own appointments
    if (isPatient && appt.patientId !== loggedInPatientId) return;
    // Patients don't see detail modal (no status actions)
    if (isPatient) return;
    setDetailAppt(appt);
  };

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border/50">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={trLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        height="auto"
        events={events}
        selectable={!isPatient}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDisplay="block"
        dayMaxEvents={3}
      />
      {!isPatient && (
        <NewAppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultDate={selectedDate}
        />
      )}
      {!isPatient && (
        <AppointmentDetailModal
          appointment={detailAppt}
          isOpen={!!detailAppt}
          onClose={() => setDetailAppt(null)}
        />
      )}
    </div>
  );
}
