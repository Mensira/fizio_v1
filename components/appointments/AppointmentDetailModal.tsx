'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Clock, Calendar, FileText, Stethoscope,
  CheckCircle2, XCircle, AlertTriangle, CircleDot,
  Phone, MapPin,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Appointment } from '@/lib/types';
import { useStore } from '@/lib/store';
import { t, translateDiagnosis } from '@/lib/i18n';
import Badge from '@/components/ui/Badge';

interface Props {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { icon: React.ElementType; variant: 'success' | 'info' | 'danger' | 'warning'; color: string }> = {
  Planlandi: { icon: CircleDot, variant: 'info', color: 'text-primary' },
  Tamamlandi: { icon: CheckCircle2, variant: 'success', color: 'text-health-green' },
  Iptal: { icon: XCircle, variant: 'warning', color: 'text-warning' },
  Gelmedi: { icon: AlertTriangle, variant: 'danger', color: 'text-danger' },
};

const statusActions: Record<string, Appointment['status'][]> = {
  Planlandi: ['Tamamlandi', 'Iptal', 'Gelmedi'],
  Tamamlandi: ['Planlandi'],
  Iptal: ['Planlandi'],
  Gelmedi: ['Planlandi'],
};

const statusActionLabels: Record<string, { tr: string; en: string }> = {
  Tamamlandi: { tr: 'Tamamlandı', en: 'Completed' },
  Iptal: { tr: 'İptal Et', en: 'Cancel' },
  Gelmedi: { tr: 'Gelmedi', en: 'No Show' },
  Planlandi: { tr: 'Tekrar Planla', en: 'Reschedule' },
};

const statusActionColors: Record<string, string> = {
  Tamamlandi: 'bg-health-green hover:bg-health-green/90 text-white',
  Iptal: 'bg-warning/10 hover:bg-warning/20 text-warning',
  Gelmedi: 'bg-danger/10 hover:bg-danger/20 text-danger',
  Planlandi: 'bg-primary/10 hover:bg-primary/20 text-primary',
};

export default function AppointmentDetailModal({ appointment, isOpen, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const language = useStore((s) => s.language);
  const updateStatus = useStore((s) => s.updateAppointmentStatus);
  const patients = useStore((s) => s.patients);
  const showToast = useStore((s) => s.showToast);
  const userRole = useStore((s) => s.userRole);
  const isPatient = userRole === 'patient';
  const [confirmStatus, setConfirmStatus] = useState<Appointment['status'] | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!appointment) return null;

  const patient = patients.find((p) => p.id === appointment.patientId);
  const config = statusConfig[appointment.status] || statusConfig.Planlandi;
  const StatusIcon = config.icon;
  const actions = statusActions[appointment.status] || [];

  const dateObj = new Date(appointment.date);
  const endObj = new Date(appointment.endDate);
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  const dateStr = dateObj.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = `${dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - ${endObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;

  const handleStatusClick = (newStatus: Appointment['status']) => {
    setConfirmStatus(newStatus);
  };

  const handleStatusConfirm = () => {
    if (!confirmStatus || !appointment) return;
    updateStatus(appointment.id, confirmStatus);
    const statusDisplay: Record<string, { tr: string; en: string }> = {
      Planlandi: { tr: 'Planlandı', en: 'Planned' },
      Tamamlandi: { tr: 'Tamamlandı', en: 'Completed' },
      Iptal: { tr: 'İptal', en: 'Cancelled' },
      Gelmedi: { tr: 'Gelmedi', en: 'No Show' },
    };
    const label = statusDisplay[confirmStatus]?.[language] || confirmStatus;
    const msg = language === 'tr'
      ? `Randevu durumu "${label}" olarak güncellendi.`
      : `Appointment status updated to "${label}".`;
    showToast(msg);
    setConfirmStatus(null);
    onClose();
  };

  const confirmMessages: Record<string, { tr: string; en: string }> = {
    Tamamlandi: { tr: 'Bu randevuyu tamamlandı olarak işaretlemek istediğinize emin misiniz?', en: 'Are you sure you want to mark this appointment as completed?' },
    Iptal: { tr: 'Bu randevuyu iptal etmek istediğinize emin misiniz?', en: 'Are you sure you want to cancel this appointment?' },
    Gelmedi: { tr: 'Bu randevuyu "gelmedi" olarak işaretlemek istediğinize emin misiniz?', en: 'Are you sure you want to mark this as no-show?' },
    Planlandi: { tr: 'Bu randevuyu tekrar planlamak istediğinize emin misiniz?', en: 'Are you sure you want to reschedule this appointment?' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Colored header strip */}
            <div className="h-1.5" style={{ backgroundColor: statusConfig[appointment.status]?.variant === 'success' ? '#27AE60' : statusConfig[appointment.status]?.variant === 'info' ? '#2F80ED' : statusConfig[appointment.status]?.variant === 'warning' ? '#F39C12' : '#E74C3C' }} />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.variant === 'success' ? 'bg-health-green/10' : config.variant === 'info' ? 'bg-primary/10' : config.variant === 'warning' ? 'bg-warning/10' : 'bg-danger/10'}`}>
                  <StatusIcon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-main">{appointment.type}</h2>
                  <Badge variant={config.variant}>
                    {language === 'tr'
                      ? ({ Planlandi: 'Planlandı', Tamamlandi: 'Tamamlandı', Iptal: 'İptal Edildi', Gelmedi: 'Gelmedi' }[appointment.status] || appointment.status)
                      : ({ Planlandi: 'Planned', Tamamlandi: 'Completed', Iptal: 'Cancelled', Gelmedi: 'No Show' }[appointment.status] || appointment.status)}
                  </Badge>
                </div>
              </div>
              <button onClick={onClose}
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-text-main"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              {/* Patient info card */}
              <motion.div
                className="rounded-xl border border-border bg-background/50 p-4"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-main">{appointment.patientName}</p>
                    {patient && (
                      <p className="text-xs text-text-secondary">{translateDiagnosis(patient.diagnosis, language)}</p>
                    )}
                  </div>
                  {patient && (
                    <a href={`tel:${patient.phone}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-green/10 text-health-green hover:bg-health-green/20 transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Details grid */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              >
                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                      {t('appointments.date', language)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-main capitalize">{dateStr}</p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                      {t('appointments.time', language)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-main">{timeStr}</p>
                  <p className="text-xs text-text-secondary">{appointment.duration} {t('appointments.minutes', language)}</p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                      {t('appointments.therapist', language)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-main">{appointment.therapistName}</p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                      {t('appointments.type', language)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-main">{appointment.type}</p>
                </div>
              </motion.div>

              {/* Notes */}
              {appointment.notes && (
                <motion.div
                  className="rounded-xl border border-border bg-background/50 p-4"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                      {t('appointments.note', language)}
                    </span>
                  </div>
                  <p className="text-sm text-text-main leading-relaxed">{appointment.notes}</p>
                </motion.div>
              )}

              {/* Action buttons - doctor only */}
              {!isPatient && actions.length > 0 && (
                <motion.div
                  className="flex gap-2 pt-2"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                >
                  {actions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusClick(status)}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${statusActionColors[status]}`}
                    >
                      {statusActionLabels[status]?.[language] || status}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Confirmation overlay inside modal */}
            <AnimatePresence>
              {confirmStatus && (
                <motion.div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmStatus(null)}
                >
                  <motion.div
                    className="bg-card rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center space-y-4">
                      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${confirmStatus === 'Iptal' || confirmStatus === 'Gelmedi' ? 'bg-danger/10' : confirmStatus === 'Tamamlandi' ? 'bg-health-green/10' : 'bg-primary/10'}`}>
                        {confirmStatus === 'Iptal' ? (
                          <XCircle className="h-6 w-6 text-danger" />
                        ) : confirmStatus === 'Gelmedi' ? (
                          <AlertTriangle className="h-6 w-6 text-danger" />
                        ) : confirmStatus === 'Tamamlandi' ? (
                          <CheckCircle2 className="h-6 w-6 text-health-green" />
                        ) : (
                          <CircleDot className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-text-main">
                          {language === 'tr' ? 'Emin misiniz?' : 'Are you sure?'}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {confirmMessages[confirmStatus]?.[language] || ''}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-background border border-border text-text-main hover:bg-background/80 transition-colors"
                          onClick={() => setConfirmStatus(null)}
                        >
                          {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                        </button>
                        <button
                          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${confirmStatus === 'Iptal' || confirmStatus === 'Gelmedi' ? 'bg-danger text-white hover:bg-danger/90' : confirmStatus === 'Tamamlandi' ? 'bg-health-green text-white hover:bg-health-green/90' : 'bg-primary text-white hover:bg-primary/90'}`}
                          onClick={handleStatusConfirm}
                        >
                          {language === 'tr' ? 'Evet, Onayla' : 'Yes, Confirm'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
