'use client';

import { useStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '@/components/ui/Toast';
import ChatWidget from '@/components/patient/ChatWidget';
import LoginPage from './LoginPage';

const PATIENT_ALLOWED_PATHS = ['/', '/randevular', '/tedavi-planlari', '/egzersiz-programlari', '/ilerleme', '/odemeler', '/ayarlar', '/belgelerim', '/bilgilendirme', '/seans-ozetleri', '/basarilarim', '/geri-bildirim', '/profilim'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const theme = useStore((s) => s.theme);
  const fontSize = useStore((s) => s.fontSize);
  const pathname = usePathname();
  const router = useRouter();

  const isPatient = userRole === 'patient';

  // Allow patient to view only their own detail page
  const isAllowedPatientDetail = isPatient && pathname.startsWith('/hastalar/') && pathname === `/hastalar/${loggedInPatientId}`;
  const isRestrictedPath = isPatient && !isAllowedPatientDetail && !PATIENT_ALLOWED_PATHS.some(p => p === '/' ? pathname === '/' : pathname.startsWith(p));

  useEffect(() => {
    if (isLoggedIn && isRestrictedPath) {
      router.replace('/');
    }
  }, [isLoggedIn, isRestrictedPath, router]);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // Apply font size to html element
  useEffect(() => {
    const sizes = { small: '14px', normal: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  useEffect(() => {
    if (!isLoggedIn && pathname !== '/') {
      router.replace('/');
    }
  }, [isLoggedIn, pathname, router]);

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        {/* Mobile backdrop overlay — shown when sidebar is open on mobile */}
        {sidebarCollapsed && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        <div className="flex flex-1 flex-col pl-0 lg:pl-64">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-3 lg:p-6">
            {isRestrictedPath ? null : children}
          </main>
        </div>
      </div>
      <ChatWidget />
      <Toast />
    </>
  );
}
