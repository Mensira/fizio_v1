'use client';

import { Droplets, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useStore } from '@/lib/store';

const TARGET_GLASSES = 8;

export default function WaterIntakeWidget() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const waterIntake = useStore((s) => s.waterIntake);
  const addWaterGlass = useStore((s) => s.addWaterGlass);
  const tr = language === 'tr';

  const today = new Date().toISOString().split('T')[0];
  const key = `${loggedInPatientId}-${today}`;
  const glasses = waterIntake[key] || 0;
  const progress = Math.min((glasses / TARGET_GLASSES) * 100, 100);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Droplets className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-text-main">
          {tr ? 'Su Takibi' : 'Water Intake'}
        </h3>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <div className="relative h-20 w-20">
            {/* Circular progress */}
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="var(--color-primary)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="h-4 w-4 text-primary mb-0.5" />
              <span className="text-sm font-bold text-text-main">{glasses}</span>
              <span className="text-[9px] text-text-secondary">/ {TARGET_GLASSES}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => loggedInPatientId && addWaterGlass(loggedInPatientId)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
          <span className="text-[10px] text-text-secondary text-center">
            {tr ? 'Bardak Ekle' : 'Add Glass'}
          </span>
        </div>
      </div>

      {glasses >= TARGET_GLASSES && (
        <p className="text-xs text-primary font-medium text-center mt-1">
          {tr ? 'Günlük hedefinize ulaştınız!' : 'Daily target reached!'}
        </p>
      )}
    </Card>
  );
}
