'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';

const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x: (Math.random() - 0.5) * 200,
  y: (Math.random() - 0.5) * 200,
  color: ['#27AE60', '#2F80ED', '#F39C12', '#E74C3C', '#9B59B6'][i % 5],
}));

export default function PatientRegisterModal({ isOpen, onClose, language }: { isOpen: boolean; onClose: () => void; language: 'tr' | 'en' }) {
  const addPatient = useStore((s) => s.addPatient);
  const showToast = useStore((s) => s.showToast);
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    birthDate: '', gender: 'Erkek' as 'Erkek' | 'Kadin',
    diagnosis: '', notes: '',
  });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      showToast(language === 'tr' ? 'Lütfen zorunlu alanları doldurun.' : 'Please fill in required fields.', 'error');
      return;
    }
    setStep('loading');
    setTimeout(() => {
      addPatient({
        id: `p${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      });
      setStep('success');
      setTimeout(() => {
        setStep('form');
        setForm({ firstName: '', lastName: '', phone: '', email: '', birthDate: '', gender: 'Erkek', diagnosis: '', notes: '' });
        onClose();
      }, 2500);
    }, 1200);
  };

  const handleClose = () => {
    if (step === 'success' || step === 'loading') return;
    setStep('form');
    onClose();
  };

  const tr = language === 'tr';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AnimatePresence mode="wait">
              {/* Success Screen */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-16 px-6"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="relative flex h-20 w-20 items-center justify-center rounded-full bg-health-green/10 mb-6"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <motion.div className="absolute inset-0 rounded-full bg-health-green/10"
                      animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 rounded-full bg-health-green/10"
                      animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                      transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }} />
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-health-green shadow-lg shadow-health-green/30"
                      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.2 }}
                    >
                      <motion.div
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Check className="h-8 w-8 text-white" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.h3 className="text-lg font-bold text-text-main mb-1"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  >
                    {tr ? 'Kayıt Başarılı!' : 'Registration Successful!'}
                  </motion.h3>
                  <motion.p className="text-sm text-text-secondary text-center"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  >
                    {tr ? 'Hasta kaydı başarıyla oluşturuldu. Artık giriş yapabilirsiniz.' : 'Patient record created successfully. You can now sign in.'}
                  </motion.p>

                  {CONFETTI_PARTICLES.map((p, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color, top: '40%', left: '50%' }}
                      animate={{ x: [0, p.x], y: [0, p.y], opacity: [1, 0], scale: [1, 0] }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Loading Screen */}
              {step === 'loading' && (
                <motion.div
                  key="loading"
                  className="flex flex-col items-center justify-center py-20 px-6"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-text-secondary mt-4">
                    {tr ? 'Kayıt oluşturuluyor...' : 'Creating registration...'}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
                        <UserPlus className="h-5 w-5 text-health-green" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-text-main">
                          {tr ? 'Hasta Kaydı' : 'Patient Registration'}
                        </h2>
                        <p className="text-xs text-text-secondary">
                          {tr ? 'Yeni hasta hesabı oluşturun' : 'Create a new patient account'}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-main transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-main">{tr ? 'Ad' : 'First Name'} *</label>
                        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-main">{tr ? 'Soyad' : 'Last Name'} *</label>
                        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-main">{tr ? 'Telefon' : 'Phone'} *</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0532 000 0000"
                        className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-main">{tr ? 'E-posta' : 'Email'}</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-main">{tr ? 'Doğum Tarihi' : 'Birth Date'}</label>
                        <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                          className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-text-main">{tr ? 'Cinsiyet' : 'Gender'}</label>
                        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'Erkek' | 'Kadin' })}
                          className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
                          <option value="Erkek">{tr ? 'Erkek' : 'Male'}</option>
                          <option value="Kadin">{tr ? 'Kadın' : 'Female'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-main">{tr ? 'Tanı / Şikâyet' : 'Diagnosis / Complaint'}</label>
                      <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                        placeholder={tr ? 'Örn: Bel ağrısı, omuz sıkışması...' : 'E.g: Back pain, shoulder impingement...'}
                        className="h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-main">{tr ? 'Notlar' : 'Notes'}</label>
                      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-3 px-6 pb-5 pt-2 border-t border-border">
                    <button onClick={handleClose}
                      className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-text-main hover:bg-background transition-colors">
                      {tr ? 'İptal' : 'Cancel'}
                    </button>
                    <motion.button onClick={handleSubmit}
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-health-green to-health-green-light text-white text-sm font-semibold shadow-lg shadow-health-green/20"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      {tr ? 'Kaydol' : 'Register'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
