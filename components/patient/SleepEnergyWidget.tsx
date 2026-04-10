'use client';

import { useState, useMemo } from 'react';
import { Moon, Zap, Plus, Minus, AlertTriangle, BedDouble } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import type { SleepEntry } from '@/lib/store';

const ENERGY_LABELS_EN = ['', 'Very Low', 'Low', 'Normal', 'High', 'Very High'];
const MODULE_NOW_MS = Date.now();
const ENERGY_EMOJIS = ['', '😴', '😪', '😐', '😊', '⚡'];
const DAY_LABELS_TR = ['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getEnergyColor(level: number): string {
  if (level <= 2) return 'var(--color-danger)';
  if (level === 3) return 'var(--color-warning)';
  return 'var(--color-health-green)';
}

export default function SleepEnergyWidget() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const sleepEntries = useStore((s) => s.sleepEntries);
  const addSleepEntry = useStore((s) => s.addSleepEntry);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';

  const [sleepHours, setSleepHours] = useState(7.5);
  const [energyLevel, setEnergyLevel] = useState(3);

  const today = useMemo(() => new Date(MODULE_NOW_MS).toISOString().split('T')[0], []);
  const nowMs = MODULE_NOW_MS;

  const todayEntry = useMemo(() => {
    if (!loggedInPatientId) return null;
    return sleepEntries.find(
      (e) => e.patientId === loggedInPatientId && e.date.split('T')[0] === today
    ) ?? null;
  }, [sleepEntries, loggedInPatientId, today]);

  const last7Days = useMemo(() => {
    if (!loggedInPatientId) return [];
    const days: { date: Date; entry: SleepEntry | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const entry = sleepEntries.find(
        (e) => e.patientId === loggedInPatientId && e.date.split('T')[0] === dateStr
      ) ?? null;
      days.push({ date: d, entry });
    }
    return days;
  }, [sleepEntries, loggedInPatientId, nowMs]);

  const averages = useMemo(() => {
    const entries = last7Days.filter((d) => d.entry !== null).map((d) => d.entry!);
    if (entries.length === 0) return { sleep: 0, energy: 0 };
    const avgSleep = entries.reduce((s, e) => s + e.sleepHours, 0) / entries.length;
    const avgEnergy = entries.reduce((s, e) => s + e.energyLevel, 0) / entries.length;
    return { sleep: Math.round(avgSleep * 10) / 10, energy: Math.round(avgEnergy * 10) / 10 };
  }, [last7Days]);

  const handleSubmit = () => {
    if (!loggedInPatientId) return;
    const entry: SleepEntry = {
      id: `sl-${Date.now()}`,
      patientId: loggedInPatientId,
      date: new Date().toISOString(),
      sleepHours,
      energyLevel,
    };
    addSleepEntry(entry);
    showToast(tr ? 'Uyku verisi kaydedildi' : 'Sleep data saved', 'success');
  };

  const adjustSleep = (delta: number) => {
    setSleepHours((h) => Math.min(12, Math.max(3, Math.round((h + delta) * 2) / 2)));
  };

  const dayLabels = tr ? DAY_LABELS_TR : DAY_LABELS_EN;
  const energyLabels = tr
    ? ['', 'Çok Düşük', 'Düşük', 'Normal', 'Yüksek', 'Çok Yüksek']
    : ENERGY_LABELS_EN;

  const maxBarHeight = 48; // px

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Moon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-text-main">
          {tr ? 'Uyku & Enerji' : 'Sleep & Energy'}
        </h3>
      </div>

      {/* Today's entry or form */}
      {todayEntry ? (
        <div className="flex items-center justify-between bg-background rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-text-main">
              {todayEntry.sleepHours} {tr ? 'saat' : 'hrs'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4" style={{ color: getEnergyColor(todayEntry.energyLevel) }} />
            <span className="text-sm font-medium text-text-main">
              {energyLabels[todayEntry.energyLevel]}
            </span>
            <span className="text-base">{ENERGY_EMOJIS[todayEntry.energyLevel]}</span>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-lg p-3 mb-3 space-y-3">
          {/* Sleep hours input */}
          <div>
            <label className="text-xs text-text-secondary mb-1 block">
              {tr ? 'Uyku Süresi' : 'Sleep Hours'}
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => adjustSleep(-0.5)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border text-text-secondary hover:bg-border/50 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-text-main">{sleepHours}</span>
                <span className="text-xs text-text-secondary">{tr ? 'saat' : 'hrs'}</span>
              </div>
              <button
                onClick={() => adjustSleep(0.5)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border text-text-secondary hover:bg-border/50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Energy level selector */}
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">
              {tr ? 'Enerji Seviyesi' : 'Energy Level'}
            </label>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex flex-col items-center gap-0.5 flex-1 rounded-lg py-1.5 transition-all text-center ${
                    energyLevel === level
                      ? 'bg-primary/10 ring-1 ring-primary'
                      : 'bg-card hover:bg-border/30'
                  }`}
                >
                  <span className="text-base">{ENERGY_EMOJIS[level]}</span>
                  <span className="text-[9px] text-text-secondary leading-tight">
                    {energyLabels[level]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button size="sm" className="w-full" onClick={handleSubmit}>
            {tr ? 'Kaydet' : 'Save'}
          </Button>
        </div>
      )}

      {/* Mini bar chart - last 7 days */}
      <div className="mb-3">
        <p className="text-xs text-text-secondary mb-2">
          {tr ? 'Son 7 Gün' : 'Last 7 Days'}
        </p>
        <div className="flex items-end justify-between gap-1" style={{ height: maxBarHeight + 16 }}>
          {last7Days.map(({ date, entry }, i) => {
            const hours = entry?.sleepHours ?? 0;
            const energy = entry?.energyLevel ?? 0;
            const barH = hours > 0 ? Math.max(4, (hours / 12) * maxBarHeight) : 0;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-0.5">
                {hours > 0 && (
                  <span className="text-[9px] font-medium text-text-secondary">
                    {hours}
                  </span>
                )}
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: barH,
                    backgroundColor: hours > 0 ? getEnergyColor(energy) : 'var(--color-border)',
                    opacity: hours > 0 ? 0.85 : 0.3,
                    minHeight: hours > 0 ? 4 : 2,
                  }}
                />
                <span className="text-[9px] text-text-secondary">
                  {dayLabels[date.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Averages */}
      {averages.sleep > 0 && (
        <div className="flex items-center justify-between text-xs border-t border-border pt-2 mb-2">
          <div className="flex items-center gap-1 text-text-secondary">
            <Moon className="h-3 w-3" />
            <span>{tr ? 'Ort. Uyku:' : 'Avg Sleep:'}</span>
            <span className="font-semibold text-text-main">{averages.sleep} {tr ? 'saat' : 'hrs'}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Zap className="h-3 w-3" />
            <span>{tr ? 'Ort. Enerji:' : 'Avg Energy:'}</span>
            <span className="font-semibold text-text-main">{averages.energy}/5</span>
          </div>
        </div>
      )}

      {/* Low sleep warning */}
      {averages.sleep > 0 && averages.sleep < 7 && (
        <div className="flex items-start gap-2 bg-warning/10 rounded-lg p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-secondary leading-tight">
            {tr
              ? 'Uyku ortalamanız 7 saatin altında. Yeterli uyku, iyileşme sürecini hızlandırır ve ağrıyı azaltır.'
              : 'Your average sleep is below 7 hours. Adequate sleep accelerates recovery and reduces pain.'}
          </p>
        </div>
      )}
    </Card>
  );
}
