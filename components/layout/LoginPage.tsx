'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ChevronRight, Eye, EyeOff, Shield,
  CalendarCheck, TrendingUp, Users, Clock, Sparkles,
  Stethoscope, UserPlus, Heart,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import ParticleField from '@/components/auth/ParticleField';
import PhysioScene from '@/components/auth/PhysioScene';
import FloatingIcon from '@/components/auth/FloatingIcon';
import PatientRegisterModal from '@/components/auth/PatientRegisterModal';

/* ───────── Main ───────── */
export default function LoginPage() {
  const login = useStore((s) => s.login);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMode, setLoginMode] = useState<'doctor' | 'patient'>('doctor');
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    if (loginMode === 'doctor') {
      setTimeout(() => login('doctor'), 800);
    } else {
      // Patient login - use first mock patient as demo
      setTimeout(() => login('patient', 'p1'), 800);
    }
  };

  const tr = language === 'tr';

  return (
    <div className="flex min-h-screen">
      {/* ════════════ LEFT PANEL ════════════ */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2b5e] via-[#1A5DBF] to-[#2F80ED]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(91,158,244,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(39,174,96,0.1),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        <ParticleField />
        <FloatingIcon icon={CalendarCheck} x="6%" y="18%" delay={0.6} />
        <FloatingIcon icon={TrendingUp} x="80%" y="12%" delay={1.0} />
        <FloatingIcon icon={Users} x="85%" y="50%" delay={1.4} />
        <FloatingIcon icon={Clock} x="4%" y="60%" delay={1.8} />
        <FloatingIcon icon={Sparkles} x="78%" y="82%" delay={2.2} />

        <motion.div className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FizyoPanel</span>
        </motion.div>

        <div className="relative z-10 flex flex-1 items-center justify-center -mt-4">
          <PhysioScene />
        </div>

        <div className="relative z-10 space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-3xl font-bold text-white leading-tight whitespace-pre-line">
              {tr ? 'Profesyonel Fizyoterapi\nKlinik Yönetimi' : 'Professional Physiotherapy\nClinic Management'}
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-sm leading-relaxed">
              {tr ? 'Tedavi seansları, hasta takibi ve randevu yönetimi tek platformda.' : 'Treatment sessions, patient tracking, and appointments in one platform.'}
            </p>
          </motion.div>

          <motion.div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 max-w-xs"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary text-white font-bold text-lg shadow-lg shadow-primary/20">C</div>
            <div>
              <p className="text-sm font-semibold text-white">Fzt.Dr. Ceydanur Congaz</p>
              <p className="text-xs text-white/50">{tr ? 'Nörolojik Rehabilitasyon' : 'Neurological Rehab.'}</p>
            </div>
          </motion.div>

          <motion.div className="flex gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            {[
              { val: '10', lbl: tr ? 'Hasta' : 'Patients' },
              { val: '98%', lbl: tr ? 'Memnuniyet' : 'Satisfaction' },
              { val: '24/7', lbl: tr ? 'Erişim' : 'Access' },
            ].map((s) => (
              <div key={s.lbl}>
                <p className="text-lg font-bold text-white">{s.val}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider">{s.lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-health-green/5 blur-3xl" />

        {/* Language switcher */}
        <motion.div className="absolute top-6 right-6 flex gap-1 rounded-xl bg-white border border-border p-1 shadow-sm"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {(['tr', 'en'] as const).map((lang) => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300 ${language === lang ? 'text-white' : 'text-text-secondary hover:text-text-main'}`}>
              {language === lang && (
                <motion.div layoutId="lang-pill" className="absolute inset-0 rounded-lg bg-primary shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
              )}
              <span className="relative z-10">{lang.toUpperCase()}</span>
            </button>
          ))}
        </motion.div>

        <motion.div className="w-full max-w-[400px] space-y-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>

          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <motion.div className="flex lg:hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/25"
              whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <Activity className="h-7 w-7 text-white" />
            </motion.div>
            <div className="text-center lg:text-left">
              <motion.h1 className="text-2xl font-bold text-text-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {t('login.title', language)}
              </motion.h1>
              <motion.p className="text-sm text-text-secondary mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                {t('login.subtitle', language)}
              </motion.p>
            </div>
          </div>

          {/* ── Role Tabs ── */}
          <motion.div className="flex gap-2 rounded-xl bg-white border border-border p-1 shadow-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {[
              { id: 'doctor' as const, icon: Stethoscope, label: tr ? 'Doktor Girişi' : 'Doctor Login' },
              { id: 'patient' as const, icon: Heart, label: tr ? 'Hasta Girişi' : 'Patient Login' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setLoginMode(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${loginMode === tab.id ? 'text-white' : 'text-text-secondary hover:text-text-main'}`}>
                {loginMode === tab.id && (
                  <motion.div layoutId="login-tab" className="absolute inset-0 rounded-lg bg-primary shadow-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* ── Form Card ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loginMode}
              className="rounded-2xl bg-white border border-border p-7 shadow-lg shadow-black/[0.03] space-y-5"
              initial={{ opacity: 0, x: loginMode === 'doctor' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: loginMode === 'doctor' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Doctor badge or Patient icon */}
              {loginMode === 'doctor' ? (
                <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3 -mt-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">C</div>
                  <div>
                    <p className="text-xs font-semibold text-text-main">Fzt.Dr. Ceydanur Congaz</p>
                    <p className="text-[11px] text-text-secondary">{tr ? 'Nörolojik Rehabilitasyon' : 'Neurological Rehab.'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-health-green/5 border border-health-green/10 p-3 -mt-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-health-green text-white">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-main">{tr ? 'Hasta Portalı' : 'Patient Portal'}</p>
                    <p className="text-[11px] text-text-secondary">{tr ? 'Randevularınızı ve tedavi sürecinizi takip edin' : 'Track your appointments and treatment progress'}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-main">{t('login.email', language)}</label>
                <input type="email"
                  placeholder={tr ? 'E-posta adresiniz' : 'Your email address'}
                  className="h-12 w-full rounded-xl border border-border bg-background/60 px-4 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 focus:bg-white" />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-main">{t('login.password', language)}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'}
                    placeholder={tr ? 'Şifreniz' : 'Your password'}
                    className="h-12 w-full rounded-xl border border-border bg-background/60 px-4 pr-11 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 focus:bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-main transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button onClick={handleLogin} disabled={isLoggingIn}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm overflow-hidden disabled:opacity-80"
                whileHover={{ scale: 1.015, boxShadow: '0 8px 30px rgba(47,128,237,0.35)' }} whileTap={{ scale: 0.985 }}>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.6 }} />
                <AnimatePresence mode="wait">
                  {isLoggingIn ? (
                    <motion.div key="spin" className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      initial={{ opacity: 0, scale: 0.5 }} exit={{ opacity: 0 }} />
                  ) : (
                    <motion.span key="label" className="flex items-center gap-2"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {t('login.button', language)}
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Demo text or Register link */}
              {loginMode === 'doctor' ? (
                <p className="text-xs text-center text-text-secondary/70">{t('login.demo', language)}</p>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-xs text-text-secondary/70">
                    {tr ? 'Henüz hesabınız yok mu?' : "Don't have an account yet?"}
                  </p>
                  <button onClick={() => setRegisterOpen(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-health-green hover:text-health-green/80 transition-colors">
                    <UserPlus className="h-4 w-4" />
                    {tr ? 'Kaydol' : 'Register'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Feature pills */}
          <div className="flex justify-center gap-2.5">
            {[
              { icon: CalendarCheck, label: tr ? 'Randevu' : 'Appointments' },
              { icon: TrendingUp, label: tr ? 'İlerleme' : 'Progress' },
              { icon: Shield, label: tr ? 'Güvenli' : 'Secure' },
            ].map((f, i) => (
              <motion.div key={f.label}
                className="flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2.5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-default"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}>
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-text-main">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div className="flex items-center justify-center gap-2 text-text-secondary/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Shield className="h-3 w-3" />
            <span className="text-[11px]">{tr ? 'SSL ile korunan güvenli bağlantı' : 'Secured with SSL encryption'}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Register Modal */}
      <PatientRegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} language={language} />
    </div>
  );
}
