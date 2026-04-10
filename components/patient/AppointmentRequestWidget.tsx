'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import type { AppointmentRequest } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CalendarPlus, Clock, Check, X, ChevronDown, ChevronUp, Send, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const timeOptions = Array.from({ length: 9 }, (_, i) => {
  const hour = (9 + i).toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const typeOptions = [
  { value: 'Tedavi Seansi', label: 'Tedavi Seansı' },
  { value: 'Kontrol', label: 'Kontrol' },
  { value: 'Degerlendirme', label: 'Değerlendirme' },
];

const statusConfig: Record<AppointmentRequest['status'], { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Beklemede', variant: 'warning' },
  approved: { label: 'Onaylandı', variant: 'success' },
  rejected: { label: 'Reddedildi', variant: 'danger' },
};

export default function AppointmentRequestWidget() {
  const userRole = useStore((s) => s.userRole);
  const appointmentRequests = useStore((s) => s.appointmentRequests);
  const addAppointmentRequest = useStore((s) => s.addAppointmentRequest);
  const updateAppointmentRequest = useStore((s) => s.updateAppointmentRequest);
  const showToast = useStore((s) => s.showToast);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patients = useStore((s) => s.patients);
  const language = useStore((s) => s.language);

  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [type, setType] = useState('Tedavi Seansi');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const isPatient = userRole === 'patient';

  // Patient view data
  const myRequests = useMemo(
    () =>
      loggedInPatientId
        ? appointmentRequests
            .filter((r) => r.patientId === loggedInPatientId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [appointmentRequests, loggedInPatientId]
  );

  // Doctor view data
  const pendingRequests = useMemo(
    () =>
      appointmentRequests
        .filter((r) => r.status === 'pending')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [appointmentRequests]
  );

  const resolvedRequests = useMemo(
    () =>
      appointmentRequests
        .filter((r) => r.status !== 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [appointmentRequests]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!preferredDate) {
      showToast(language === 'tr' ? 'Lütfen bir tarih seçin' : 'Please select a date', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === loggedInPatientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Hasta';

    const newRequest: AppointmentRequest = {
      id: `ar-${Date.now()}`,
      patientId: loggedInPatientId || '',
      patientName,
      preferredDate,
      preferredTime,
      type,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addAppointmentRequest(newRequest);
    showToast(language === 'tr' ? 'Randevu talebiniz gönderildi' : 'Appointment request sent');

    setPreferredDate('');
    setPreferredTime('09:00');
    setType('Tedavi Seansi');
    setNotes('');
  };

  const handleApprove = (id: string) => {
    setConfirmAction({ id, action: 'approve' });
  };

  const handleReject = (id: string) => {
    setConfirmAction({ id, action: 'reject' });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'approve') {
      updateAppointmentRequest(confirmAction.id, 'approved');
      showToast(language === 'tr' ? 'Randevu talebi onaylandı' : 'Appointment request approved');
    } else {
      updateAppointmentRequest(confirmAction.id, 'rejected');
      showToast(language === 'tr' ? 'Randevu talebi reddedildi' : 'Appointment request rejected');
    }
    setConfirmAction(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Patient View ───
  if (isPatient) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-main">
              {language === 'tr' ? 'Randevu Talep Et' : 'Request Appointment'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'tr' ? 'Tercih Edilen Tarih' : 'Preferred Date'}
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Select
                label={language === 'tr' ? 'Tercih Edilen Saat' : 'Preferred Time'}
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                options={timeOptions}
              />
            </div>

            <Select
              label={language === 'tr' ? 'Randevu Türü' : 'Appointment Type'}
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={typeOptions}
            />

            <Input
              label={language === 'tr' ? 'Notlar' : 'Notes'}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'tr' ? 'Ek bilgi veya şikayetinizi yazın...' : 'Additional notes...'}
            />

            <Button type="submit" icon={Send} className="w-full sm:w-auto">
              {language === 'tr' ? 'Talep Gönder' : 'Submit Request'}
            </Button>
          </form>
        </Card>

        {/* Patient's own requests */}
        {myRequests.length > 0 && (
          <Card>
            <h4 className="text-base font-semibold text-text-main mb-4">
              {language === 'tr' ? 'Taleplerim' : 'My Requests'}
            </h4>
            <div className="space-y-3">
              <AnimatePresence>
                {myRequests.map((req) => {
                  const cfg = statusConfig[req.status];
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border/50 bg-background"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                          <Clock className="w-4 h-4 text-text-secondary" />
                          {formatDate(req.preferredDate)} - {req.preferredTime}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {req.type}
                          {req.notes ? ` — ${req.notes}` : ''}
                        </p>
                      </div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ─── Doctor View ───
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
            <FileText className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              {language === 'tr' ? 'Bekleyen Randevu Talepleri' : 'Pending Appointment Requests'}
            </h3>
            {pendingRequests.length > 0 && (
              <p className="text-xs text-text-secondary">
                {pendingRequests.length} {language === 'tr' ? 'talep bekliyor' : 'pending'}
              </p>
            )}
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6">
            {language === 'tr' ? 'Bekleyen randevu talebi yok.' : 'No pending requests.'}
          </p>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-lg border border-border/50 bg-background space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-main">{req.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(req.preferredDate)} - {req.preferredTime}
                      </div>
                      <Badge variant="info">{req.type}</Badge>
                    </div>
                    <Badge variant="warning">
                      {language === 'tr' ? 'Beklemede' : 'Pending'}
                    </Badge>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-text-secondary bg-card rounded p-2">
                      {req.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      icon={Check}
                      className="bg-health-green text-white hover:bg-health-green/90"
                      onClick={() => handleApprove(req.id)}
                    >
                      {language === 'tr' ? 'Onayla' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={X}
                      onClick={() => handleReject(req.id)}
                    >
                      {language === 'tr' ? 'Reddet' : 'Reject'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Recently resolved requests */}
      {resolvedRequests.length > 0 && (
        <Card>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-semibold text-text-main">
              {language === 'tr' ? 'Son İşlemler' : 'Recent Actions'}{' '}
              <span className="text-text-secondary font-normal">({resolvedRequests.length})</span>
            </h4>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-4">
                  {resolvedRequests.map((req) => {
                    const cfg = statusConfig[req.status];
                    return (
                      <div
                        key={req.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/30 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-medium text-text-main truncate">
                            {req.patientName}
                          </span>
                          <span className="text-xs text-text-secondary whitespace-nowrap">
                            {formatDate(req.preferredDate)} {req.preferredTime}
                          </span>
                        </div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${confirmAction.action === 'approve' ? 'bg-health-green/10' : 'bg-danger/10'}`}>
                  {confirmAction.action === 'approve' ? (
                    <Check className="h-7 w-7 text-health-green" />
                  ) : (
                    <X className="h-7 w-7 text-danger" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main">
                    {confirmAction.action === 'approve'
                      ? (language === 'tr' ? 'Randevuyu Onayla' : 'Approve Appointment')
                      : (language === 'tr' ? 'Randevuyu Reddet' : 'Reject Appointment')}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {confirmAction.action === 'approve'
                      ? (language === 'tr' ? 'Bu randevu talebini onaylamak istediğinize emin misiniz?' : 'Are you sure you want to approve this request?')
                      : (language === 'tr' ? 'Bu randevu talebini reddetmek istediğinize emin misiniz?' : 'Are you sure you want to reject this request?')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setConfirmAction(null)}
                  >
                    {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                  </Button>
                  <Button
                    className={`flex-1 ${confirmAction.action === 'approve' ? 'bg-health-green text-white hover:bg-health-green/90' : 'bg-danger text-white hover:bg-danger/90'}`}
                    onClick={handleConfirm}
                  >
                    {confirmAction.action === 'approve'
                      ? (language === 'tr' ? 'Evet, Onayla' : 'Yes, Approve')
                      : (language === 'tr' ? 'Evet, Reddet' : 'Yes, Reject')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
