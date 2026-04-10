'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Sparkles, X } from 'lucide-react';
import { NAV_ITEMS, PATIENT_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { t, TranslationKey } from '@/lib/i18n';

const NAV_KEYS: TranslationKey[] = [
  'nav.dashboard', 'nav.appointments', 'nav.patients',
  'nav.treatmentPlans', 'nav.sessions', 'nav.exercises',
  'nav.progress', 'nav.payments', 'nav.reports', 'nav.settings',
];

const PATIENT_NAV_KEYS: TranslationKey[] = [
  'nav.myDocuments', 'nav.information', 'nav.sessionSummaries',
  'nav.achievements', 'nav.myProfile',
];


// Patient-visible route paths
const PATIENT_VISIBLE_PATHS = ['/', '/randevular', '/tedavi-planlari', '/egzersiz-programlari', '/ilerleme', '/odemeler', '/ayarlar'];

export default function Sidebar() {
  const pathname = usePathname();
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  const isPatient = userRole === 'patient';

  const handleNavClick = () => {
    // On mobile, close the sidebar after navigating (sidebarCollapsed=true means it's open on mobile)
    if (sidebarCollapsed) {
      toggleSidebar();
    }
  };

  const renderNavItems = (items: typeof NAV_ITEMS) =>
    items
      .filter((item) => !isPatient || PATIENT_VISIBLE_PATHS.includes(item.href))
      .map((item) => {
        const origIndex = NAV_ITEMS.indexOf(item);
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-background hover:text-text-main'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{t(NAV_KEYS[origIndex], language)}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          </li>
        );
      });

  // For patients, use simplified menu grouping
  const mainItems = isPatient ? NAV_ITEMS.slice(0, 2) : NAV_ITEMS.slice(0, 3);
  const clinicItems = isPatient ? NAV_ITEMS.slice(2, 8) : NAV_ITEMS.slice(3, 8);
  const systemItems = NAV_ITEMS.slice(8);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out',
        // Desktop: always visible
        'lg:translate-x-0 lg:z-30',
        // Mobile: hidden by default (sidebarCollapsed=false → off-screen), shown when toggled open (sidebarCollapsed=true)
        sidebarCollapsed ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark shadow-sm">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <span className="text-lg font-bold text-text-main">FizyoPanel</span>
          <p className="text-[10px] text-text-secondary -mt-0.5">
            {isPatient ? t('sidebar.patientPortal', language) : t('sidebar.subtitle', language)}
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-main transition-colors"
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          {t('sidebar.mainMenu', language)}
        </p>
        <ul className="space-y-0.5">
          {renderNavItems(mainItems)}
        </ul>

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          {isPatient ? t('sidebar.myTreatment', language) : t('sidebar.clinicManagement', language)}
        </p>
        <ul className="space-y-0.5">
          {renderNavItems(clinicItems)}
        </ul>

        {isPatient && (
          <>
            <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              {t('sidebar.infoExperience', language)}
            </p>
            <ul className="space-y-0.5">
              {PATIENT_NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-text-secondary hover:bg-background hover:text-text-main'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{t(PATIENT_NAV_KEYS[idx], language)}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          {t('sidebar.system', language)}
        </p>
        <ul className="space-y-0.5">
          {renderNavItems(systemItems)}
        </ul>
      </nav>

      <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-health-green/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-text-main">{t('sidebar.tip', language)}</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          {isPatient ? t('sidebar.patientTipText', language) : t('sidebar.tipText', language)}
        </p>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-text-secondary">FizyoPanel v1.0</p>
          <span className="flex h-2 w-2 rounded-full bg-health-green" title={t('sidebar.systemActive', language)} />
        </div>
      </div>
    </aside>
  );
}
