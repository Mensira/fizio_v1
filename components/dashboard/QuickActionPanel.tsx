'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarPlus,
  CheckCircle,
  CreditCard,
  FileEdit,
  Search,
  Bell,
  Check,
  X,
  Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useStore } from '@/lib/store';
import type { AppointmentType } from '@/lib/types';

type ActionKey = 'appointment' | 'session' | 'payment' | 'note' | 'search' | 'requests' | null;

export default function QuickActionPanel() {
  const language = useStore((s) => s.language);
  const patients = useStore((s) => s.patients);
  const sessions = useStore((s) => s.sessions);
  const appointmentRequests = useStore((s) => s.appointmentRequests);
  const addAppointment = useStore((s) => s.addAppointment);
  const toggleSessionComplete = useStore((s) => s.toggleSessionComplete);
  const addPayment = useStore((s) => s.addPayment);
  const addProgressNote = useStore((s) => s.addProgressNote);
  const updateAppointmentRequest = useStore((s) => s.updateAppointmentRequest);
  const showToast = useStore((s) => s.showToast);

  const tr = language === 'tr';
  const router = useRouter();

  const [activeAction, setActiveAction] = useState<ActionKey>(null);

  // New Appointment state
  const [apptPatientId, setApptPatientId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('09:00');
  const [apptType, setApptType] = useState<AppointmentType>('Tedavi Seansi');

  // Payment state
  const [payPatientId, setPayPatientId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Nakit' | 'Kredi Karti' | 'Havale'>('Nakit');
  const [payDescription, setPayDescription] = useState('');

  // Quick Note state
  const [notePatientId, setNotePatientId] = useState('');
  const [noteText, setNoteText] = useState('');

  // Patient Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Appointment request confirmation
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approved' | 'rejected'; patientName: string; date: string; time: string; type: string } | null>(null);

  const pendingRequests = useMemo(
    () => appointmentRequests.filter((r) => r.status === 'pending'),
    [appointmentRequests]
  );

  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter((s) => s.date.startsWith(today) && !s.completed);
  }, [sessions]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const patientOptions = useMemo(
    () => [
      { value: '', label: tr ? '-- Hasta Seçin --' : '-- Select Patient --' },
      ...patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` })),
    ],
    [patients, tr]
  );

  const typeOptions: { value: string; label: string }[] = [
    { value: 'Degerlendirme', label: tr ? 'Değerlendirme' : 'Assessment' },
    { value: 'Tedavi Seansi', label: tr ? 'Tedavi Seansı' : 'Treatment Session' },
    { value: 'Kontrol', label: tr ? 'Kontrol' : 'Follow-up' },
    { value: 'Ilk Muayene', label: tr ? 'İlk Muayene' : 'Initial Exam' },
  ];

  const methodOptions: { value: string; label: string }[] = [
    { value: 'Nakit', label: tr ? 'Nakit' : 'Cash' },
    { value: 'Kredi Karti', label: tr ? 'Kredi Kartı' : 'Credit Card' },
    { value: 'Havale', label: tr ? 'Havale' : 'Bank Transfer' },
  ];

  const actions: { key: ActionKey; icon: typeof CalendarPlus; label: string; badge?: number }[] = [
    { key: 'appointment', icon: CalendarPlus, label: tr ? 'Yeni Randevu' : 'New Appointment' },
    { key: 'session', icon: CheckCircle, label: tr ? 'Seans Tamamla' : 'Complete Session' },
    { key: 'payment', icon: CreditCard, label: tr ? 'Ödeme Al' : 'Take Payment' },
    { key: 'note', icon: FileEdit, label: tr ? 'Hızlı Not' : 'Quick Note' },
    { key: 'search', icon: Search, label: tr ? 'Hasta Ara' : 'Find Patient' },
    {
      key: 'requests',
      icon: Bell,
      label: tr ? 'Randevu Talebi' : 'Appointment Requests',
      badge: pendingRequests.length || undefined,
    },
  ];

  function handleToggleAction(key: ActionKey) {
    setActiveAction((prev) => (prev === key ? null : key));
  }

  function resetAppointmentForm() {
    setApptPatientId('');
    setApptDate('');
    setApptTime('09:00');
    setApptType('Tedavi Seansi');
  }

  function handleAddAppointment() {
    if (!apptPatientId || !apptDate || !apptTime) return;
    const patient = patients.find((p) => p.id === apptPatientId);
    if (!patient) return;

    const startDate = new Date(`${apptDate}T${apptTime}:00`);
    const duration = 45;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    addAppointment({
      id: `appt-${Date.now()}`,
      patientId: apptPatientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      therapistId: 't1',
      therapistName: 'Fzt.Dr. Ceydanur Congaz',
      date: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      type: apptType,
      status: 'Planlandi',
      notes: '',
    });

    showToast(tr ? 'Randevu oluşturuldu' : 'Appointment created');
    resetAppointmentForm();
    setActiveAction(null);
  }

  function handleAddPayment() {
    if (!payPatientId || !payAmount) return;
    const patient = patients.find((p) => p.id === payPatientId);
    if (!patient) return;

    addPayment({
      id: `pay-${Date.now()}`,
      patientId: payPatientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString(),
      amount: parseFloat(payAmount),
      method: payMethod,
      status: 'Odendi',
      description: payDescription || (tr ? 'Seans Ücreti' : 'Session Fee'),
    });

    showToast(tr ? 'Ödeme kaydedildi' : 'Payment recorded');
    setPayPatientId('');
    setPayAmount('');
    setPayMethod('Nakit');
    setPayDescription('');
    setActiveAction(null);
  }

  function handleAddNote() {
    if (!notePatientId || !noteText.trim()) return;

    addProgressNote({
      id: `pn-${Date.now()}`,
      patientId: notePatientId,
      date: new Date().toISOString(),
      text: noteText.trim(),
      author: 'doctor',
    });

    showToast(tr ? 'Not kaydedildi' : 'Note saved');
    setNotePatientId('');
    setNoteText('');
    setActiveAction(null);
  }

  function handleConfirmAction() {
    if (!confirmAction) return;
    updateAppointmentRequest(confirmAction.id, confirmAction.action);
    showToast(
      confirmAction.action === 'approved'
        ? (tr ? 'Talep onaylandı' : 'Request approved')
        : (tr ? 'Talep reddedildi' : 'Request rejected')
    );
    setConfirmAction(null);
  }

  // Render the expanded section content based on active action
  function renderExpandedContent() {
    if (!activeAction) return null;

    switch (activeAction) {
      case 'appointment':
        return (
          <div className="space-y-3">
            <Select
              label={tr ? 'Hasta' : 'Patient'}
              options={patientOptions}
              value={apptPatientId}
              onChange={(e) => setApptPatientId(e.target.value)}
            />
            <Input
              label={tr ? 'Tarih' : 'Date'}
              type="date"
              value={apptDate}
              onChange={(e) => setApptDate(e.target.value)}
            />
            <Input
              label={tr ? 'Saat' : 'Time'}
              type="time"
              value={apptTime}
              onChange={(e) => setApptTime(e.target.value)}
            />
            <Select
              label={tr ? 'Tür' : 'Type'}
              options={typeOptions}
              value={apptType}
              onChange={(e) => setApptType(e.target.value as AppointmentType)}
            />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleAddAppointment} disabled={!apptPatientId || !apptDate}>
                {tr ? 'Oluştur' : 'Create'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
                {tr ? 'İptal' : 'Cancel'}
              </Button>
            </div>
          </div>
        );

      case 'session':
        return (
          <div className="space-y-2">
            {todaySessions.length === 0 ? (
              <p className="text-sm text-text-secondary py-2">
                {tr ? 'Bugün tamamlanacak seans yok.' : 'No incomplete sessions today.'}
              </p>
            ) : (
              todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">{s.patientName}</p>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(s.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {s.duration}{tr ? ' dk' : ' min'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Check}
                    onClick={() => {
                      toggleSessionComplete(s.id);
                      showToast(tr ? 'Seans tamamlandı' : 'Session completed');
                    }}
                  >
                    {tr ? 'Tamamla' : 'Complete'}
                  </Button>
                </div>
              ))
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-3">
            <Select
              label={tr ? 'Hasta' : 'Patient'}
              options={patientOptions}
              value={payPatientId}
              onChange={(e) => setPayPatientId(e.target.value)}
            />
            <Input
              label={tr ? 'Tutar (₺)' : 'Amount (₺)'}
              type="number"
              min="0"
              step="0.01"
              placeholder="500"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <Select
              label={tr ? 'Ödeme Yöntemi' : 'Payment Method'}
              options={methodOptions}
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as 'Nakit' | 'Kredi Karti' | 'Havale')}
            />
            <Input
              label={tr ? 'Açıklama' : 'Description'}
              placeholder={tr ? 'Seans Ücreti' : 'Session Fee'}
              value={payDescription}
              onChange={(e) => setPayDescription(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleAddPayment} disabled={!payPatientId || !payAmount}>
                {tr ? 'Kaydet' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
                {tr ? 'İptal' : 'Cancel'}
              </Button>
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="space-y-3">
            <Select
              label={tr ? 'Hasta' : 'Patient'}
              options={patientOptions}
              value={notePatientId}
              onChange={(e) => setNotePatientId(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">
                {tr ? 'Not' : 'Note'}
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                rows={3}
                placeholder={tr ? 'Gözlem veya not yazın...' : 'Write an observation or note...'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleAddNote} disabled={!notePatientId || !noteText.trim()}>
                {tr ? 'Kaydet' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>
                {tr ? 'İptal' : 'Cancel'}
              </Button>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-2">
            <Input
              placeholder={tr ? 'Hasta adı ile arayın...' : 'Search by patient name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredPatients.length === 0 ? (
                <p className="text-sm text-text-secondary py-2">
                  {tr ? 'Hasta bulunamadı.' : 'No patients found.'}
                </p>
              ) : (
                filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-text-main hover:bg-background transition-colors"
                    onClick={() => {
                      router.push(`/hastalar/${p.id}`);
                      setSearchQuery('');
                      setActiveAction(null);
                    }}
                  >
                    <span className="font-medium">{p.firstName} {p.lastName}</span>
                    <span className="text-text-secondary ml-2 text-xs">{p.diagnosis}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-2">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-text-secondary py-2">
                {tr ? 'Bekleyen talep yok.' : 'No pending requests.'}
              </p>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border border-border p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-main">{req.patientName}</p>
                    <Badge variant="warning">
                      {tr ? 'Bekliyor' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {req.preferredDate} - {req.preferredTime} | {req.type}
                  </p>
                  {req.notes && (
                    <p className="text-xs text-text-secondary italic">{req.notes}</p>
                  )}
                  <div className="flex gap-2 pt-0.5">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Check}
                      onClick={() => setConfirmAction({ id: req.id, action: 'approved', patientName: req.patientName, date: req.preferredDate, time: req.preferredTime, type: req.type })}
                    >
                      {tr ? 'Onayla' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={X}
                      onClick={() => setConfirmAction({ id: req.id, action: 'rejected', patientName: req.patientName, date: req.preferredDate, time: req.preferredTime, type: req.type })}
                    >
                      {tr ? 'Reddet' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-main mb-3">
        {tr ? 'Hızlı İşlemler' : 'Quick Actions'}
      </h3>

      {/* 3x2 action grid */}
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ key, icon: Icon, label, badge }) => {
          const isActive = activeAction === key;
          return (
            <button
              key={key}
              onClick={() => handleToggleAction(key)}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                  : 'bg-background text-text-secondary hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium leading-tight">{label}</span>
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded content area */}
      {activeAction && (
        <div className="mt-3 border-t border-border pt-3">
          {renderExpandedContent()}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.action === 'approved'
            ? (tr ? 'Randevu Talebini Onayla' : 'Approve Appointment Request')
            : (tr ? 'Randevu Talebini Reddet' : 'Reject Appointment Request')}
        >
          <div className="space-y-4">
            <div className={`rounded-xl p-4 border ${confirmAction.action === 'approved' ? 'bg-health-green/5 border-health-green/20' : 'bg-danger/5 border-danger/20'}`}>
              <p className="text-sm text-text-main leading-relaxed">
                {confirmAction.action === 'approved'
                  ? (tr
                    ? `${confirmAction.patientName} hastasının ${confirmAction.date} tarihli saat ${confirmAction.time} için ${confirmAction.type} randevu talebini onaylıyorsunuz. Onaylandığında hastaya bildirim gönderilecek ve takvime eklenecektir.`
                    : `You are approving ${confirmAction.patientName}'s ${confirmAction.type} appointment request for ${confirmAction.date} at ${confirmAction.time}. The patient will be notified and it will be added to the calendar.`)
                  : (tr
                    ? `${confirmAction.patientName} hastasının ${confirmAction.date} tarihli saat ${confirmAction.time} için ${confirmAction.type} randevu talebini reddediyorsunuz. Hastaya red bildirimi gönderilecektir.`
                    : `You are rejecting ${confirmAction.patientName}'s ${confirmAction.type} appointment request for ${confirmAction.date} at ${confirmAction.time}. The patient will be notified of the rejection.`)}
              </p>
            </div>

            {/* Request details */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-background p-2.5">
                <p className="text-[10px] text-text-secondary">{tr ? 'Hasta' : 'Patient'}</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">{confirmAction.patientName}</p>
              </div>
              <div className="rounded-lg bg-background p-2.5">
                <p className="text-[10px] text-text-secondary">{tr ? 'Tarih & Saat' : 'Date & Time'}</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">{confirmAction.date} {confirmAction.time}</p>
              </div>
              <div className="rounded-lg bg-background p-2.5">
                <p className="text-[10px] text-text-secondary">{tr ? 'Tür' : 'Type'}</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">{confirmAction.type}</p>
              </div>
            </div>

            {confirmAction.action === 'approved' && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs text-text-secondary">
                {tr
                  ? 'Onay sonrası: Randevu takvime eklenir, hastaya 500₺ seans ücreti ödeme talebi oluşturulur ve bildirim gönderilir.'
                  : 'After approval: Appointment will be added to calendar, a 500₺ session fee payment request will be created, and the patient will be notified.'}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setConfirmAction(null)}>
                {tr ? 'Vazgeç' : 'Cancel'}
              </Button>
              <Button
                variant={confirmAction.action === 'approved' ? 'primary' : 'danger'}
                icon={confirmAction.action === 'approved' ? Check : X}
                onClick={handleConfirmAction}
              >
                {confirmAction.action === 'approved'
                  ? (tr ? 'Evet, Onayla' : 'Yes, Approve')
                  : (tr ? 'Evet, Reddet' : 'Yes, Reject')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
