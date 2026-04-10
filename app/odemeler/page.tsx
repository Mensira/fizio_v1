'use client';

import { useStore } from '@/lib/store';
import PatientPaymentView from '@/components/payments/PatientPaymentView';
import DoctorPaymentView from '@/components/payments/DoctorPaymentView';

// ============ MAIN EXPORT ============

export default function OdemelerPage() {
  const userRole = useStore((s) => s.userRole);

  if (userRole === 'patient') {
    return <PatientPaymentView />;
  }

  return <DoctorPaymentView />;
}
