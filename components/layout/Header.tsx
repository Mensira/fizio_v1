'use client';

import { useState } from 'react';
import { Search, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import NotificationCenter from './NotificationCenter';

function getPageTitle(pathname: string, lang: 'tr' | 'en'): string {
  if (pathname === '/') return t('nav.dashboard', lang);
  if (pathname.startsWith('/hastalar/')) return t('header.patientDetail', lang);
  const map: Record<string, Parameters<typeof t>[0]> = {
    '/randevular': 'nav.appointments',
    '/hastalar': 'nav.patients',
    '/tedavi-planlari': 'nav.treatmentPlans',
    '/seanslar': 'nav.sessions',
    '/egzersiz-programlari': 'nav.exercises',
    '/ilerleme': 'nav.progress',
    '/odemeler': 'nav.payments',
    '/raporlar': 'nav.reports',
    '/ayarlar': 'nav.settings',
  };
  for (const [path, key] of Object.entries(map)) {
    if (pathname.startsWith(path)) return t(key, lang);
  }
  return 'FizyoPanel';
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const logout = useStore((s) => s.logout);
  const showToast = useStore((s) => s.showToast);
  const userRole = useStore((s) => s.userRole);
  const patients = useStore((s) => s.patients);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const title = getPageTitle(pathname, language);

  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const profile = useStore((s) => s.profile);
  const isPatient = userRole === 'patient';
  const loggedInPatient = isPatient ? patients.find(p => p.id === loggedInPatientId) : null;
  const doctorName = profile.fullName || 'FizyoPanel Doktor';
  const doctorInitials = doctorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredResults = searchQuery.length > 1
    ? patients
        .filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery))
        .slice(0, 5)
        .map(p => ({ name: `${p.firstName} ${p.lastName}`, type: t('header.patient', language), href: `/hastalar/${p.id}` }))
    : [];

  const handleLogout = () => {
    setShowUserMenu(false);
    showToast(t('logout.message', language));
    setTimeout(() => logout(), 500);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-main transition-colors"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-xl font-semibold text-text-main truncate max-w-[140px] sm:max-w-none">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search - doctor only */}
        {!isPatient && <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder', language)}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="h-9 w-72 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {showSearchResults && filteredResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50">
              {filteredResults.map((result) => (
                <button
                  key={result.href}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-background transition-colors"
                  onMouseDown={() => { router.push(result.href); setSearchQuery(''); }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {result.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main">{result.name}</p>
                    <p className="text-xs text-text-secondary">{result.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>}

        {/* Language toggle */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setLanguage('tr')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${language === 'tr' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-main'}`}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${language === 'en' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-main'}`}
          >
            EN
          </button>
        </div>

        {/* Notifications */}
        <NotificationCenter />

        <div className="h-6 w-px bg-border" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-background"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white ${isPatient ? 'bg-gradient-to-br from-health-green to-health-green-light' : 'bg-gradient-to-br from-primary to-primary-dark'}`}>
              {isPatient && loggedInPatient
                ? `${loggedInPatient.firstName[0]}${loggedInPatient.lastName[0]}`
                : doctorInitials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-text-main">
                {isPatient && loggedInPatient
                  ? `${loggedInPatient.firstName} ${loggedInPatient.lastName}`
                  : doctorName}
              </p>
              <p className="text-xs text-text-secondary">
                {isPatient
                  ? t('header.patientRole', language)
                  : 'Nörolojik Rehabilitasyon'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-background/50">
                <p className="text-sm font-medium text-text-main">
                  {isPatient && loggedInPatient
                    ? `${loggedInPatient.firstName} ${loggedInPatient.lastName}`
                    : doctorName}
                </p>
                <p className="text-xs text-text-secondary">
                  {isPatient && loggedInPatient
                    ? (loggedInPatient.email || loggedInPatient.phone)
                    : (profile.email || 'info@fizyopanel.com')}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { router.push(isPatient ? '/profilim' : '/ayarlar'); setShowUserMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-background hover:text-text-main transition-colors"
                >
                  <User className="h-4 w-4" /> {t('header.profile', language)}
                </button>
                <button
                  onClick={() => { router.push('/ayarlar'); setShowUserMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-background hover:text-text-main transition-colors"
                >
                  <Settings className="h-4 w-4" /> {t('header.settings', language)}
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> {t('header.logout', language)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
