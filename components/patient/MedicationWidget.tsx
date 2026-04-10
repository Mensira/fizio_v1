'use client';

import { Pill, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function MedicationWidget() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const medications = useStore((s) => s.medications);
  const toggleMedicationTaken = useStore((s) => s.toggleMedicationTaken);
  const tr = language === 'tr';

  const today = new Date().toISOString().split('T')[0];
  const myMeds = medications.filter((m) => m.patientId === loggedInPatientId);
  const takenCount = myMeds.filter((m) => m.takenDates.includes(today)).length;

  if (myMeds.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
            <Pill className="h-4 w-4 text-warning" />
          </div>
          <h3 className="text-sm font-semibold text-text-main">
            {tr ? 'İlaçlarım' : 'My Medications'}
          </h3>
        </div>
        <span className="text-xs font-medium text-text-secondary">{takenCount}/{myMeds.length}</span>
      </div>

      <div className="space-y-2">
        {myMeds.map((med) => {
          const taken = med.takenDates.includes(today);
          return (
            <div
              key={med.id}
              className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all ${
                taken ? 'border-health-green/30 bg-health-green/5' : 'border-border/50'
              }`}
            >
              <button
                onClick={() => toggleMedicationTaken(med.id, today)}
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  taken ? 'border-health-green bg-health-green text-white' : 'border-border hover:border-health-green/50'
                }`}
              >
                {taken && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${taken ? 'text-health-green line-through' : 'text-text-main'}`}>
                  {med.name}
                </p>
                <p className="text-[11px] text-text-secondary">{med.dosage} - {med.frequency}</p>
              </div>
            </div>
          );
        })}
      </div>

      {takenCount === myMeds.length && (
        <p className="text-xs text-health-green font-medium text-center mt-3">
          {tr ? 'Tüm ilaçlar alındı!' : 'All medications taken!'}
        </p>
      )}
    </Card>
  );
}
