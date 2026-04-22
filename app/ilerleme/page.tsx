'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { progressRecords } from '@/lib/mock-data';
import { formatShortDate } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function IlerlemePage() {
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const storePatients = useStore((s) => s.patients);
  const showToast = useStore((s) => s.showToast);
  const isPatient = userRole === 'patient';
  const tr = language === 'tr';

  const patientsWithProgress = storePatients.filter((p) =>
    progressRecords.some((r) => r.patientId === p.id)
  );
  const moodEntries = useStore((s) => s.moodEntries);
  const addMoodEntry = useStore((s) => s.addMoodEntry);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Effective patient: for patient role always own ID, for doctor use selection
  const effectivePatient = isPatient && loggedInPatientId
    ? loggedInPatientId
    : selectedPatient || patientsWithProgress[0]?.id || '';

  const data = progressRecords
    .filter((r) => r.patientId === effectivePatient)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: formatShortDate(r.date),
      rom: r.rangeOfMotion,
    }));

  return (
    <div className="space-y-3 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {isPatient ? t('progress.myProgress', language) : t('progress.title', language)}
          </h2>
          <p className="text-sm text-text-secondary">
            {isPatient ? t('progress.myProgressDesc', language) : t('progress.subtitle', language)}
          </p>
        </div>
        {!isPatient && (
          <div className="w-full sm:w-64">
            <Select
              value={effectivePatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              options={patientsWithProgress.map((p) => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`,
              }))}
            />
          </div>
        )}
      </div>

      <Card>
        <h3 className="text-sm lg:text-base font-semibold text-text-main mb-1">{t('progress.rom', language)}</h3>
        <p className="text-xs text-text-secondary mb-3 lg:mb-4">{t('progress.romDesc', language)}</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="rom"
              name={t('progress.rom', language)}
              stroke="#27AE60"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#fff', stroke: '#27AE60', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#27AE60' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Mood Quick Entry (Patient) / Mood History (Doctor) */}
      {effectivePatient && (() => {
        const MOODS = [
          { value: 1, emoji: '😞', label: t('progress.veryBad', language) },
          { value: 2, emoji: '😕', label: t('progress.bad', language) },
          { value: 3, emoji: '😐', label: t('progress.okay', language) },
          { value: 4, emoji: '🙂', label: t('progress.good', language) },
          { value: 5, emoji: '😊', label: t('progress.great', language) },
        ];

        const patientMoods = moodEntries
          .filter((m) => m.patientId === effectivePatient)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const todayStr = new Date().toDateString();
        const todayEntry = patientMoods.find((m) => new Date(m.date).toDateString() === todayStr);

        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6">
            {/* Quick entry for patient / summary for doctor */}
            <Card>
              <h3 className="text-base font-semibold text-text-main mb-1">
                {isPatient ? t('progress.howDoYouFeel', language) : t('progress.dailyMood', language)}
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                {isPatient
                  ? t('progress.selectMood', language)
                  : t('progress.patientAssessments', language)
                }
              </p>

              {isPatient && !todayEntry ? (
                <div className="space-y-4">
                  {/* Mood selection */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-2">{t('progress.mood', language)}</p>
                    <div className="flex gap-2">
                      {MOODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setSelectedMood(m.value)}
                          className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 border-2 transition-all ${
                            selectedMood === m.value
                              ? 'border-primary bg-primary/5 scale-105'
                              : 'border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-2xl">{m.emoji}</span>
                          <span className="text-[10px] text-text-secondary">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (!selectedMood) return;
                      addMoodEntry({
                        id: `me-${Date.now()}`,
                        patientId: effectivePatient,
                        date: new Date().toISOString(),
                        mood: selectedMood,
                      });
                      setSelectedMood(null);
                      showToast(t('progress.saved', language));
                    }}
                    disabled={!selectedMood}
                    className="w-full"
                  >
                    {t('common.save2', language)}
                  </Button>
                </div>
              ) : isPatient && todayEntry ? (
                <div className="flex flex-col items-center py-4">
                  <div className="flex gap-6 mb-3">
                    <div className="text-center">
                      <span className="text-3xl">{MOODS.find((m) => m.value === todayEntry.mood)?.emoji}</span>
                      <p className="text-xs text-text-secondary mt-1">{MOODS.find((m) => m.value === todayEntry.mood)?.label}</p>
                    </div>
                  </div>
                  <p className="text-xs text-health-green font-medium">
                    {t('progress.todayRecorded', language)}
                  </p>
                </div>
              ) : null}

              {/* Doctor: show recent mood entries */}
              {!isPatient && (
                <div className="space-y-2">
                  {patientMoods.length === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-4">
                      {t('progress.noAssessments', language)}
                    </p>
                  ) : (
                    patientMoods.slice(0, 7).map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-border/30 p-2.5">
                        <span className="text-xs text-text-secondary w-20">
                          {new Date(entry.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>
                          <span className="text-[11px] text-text-secondary">{MOODS.find((m) => m.value === entry.mood)?.label}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Mood trend (last 7 days) */}
            <Card>
              <h3 className="text-base font-semibold text-text-main mb-1">
                {t('progress.last7Days', language)}
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                {tr ? 'Ruh hali değişimi' : 'Mood changes'}
              </p>
              {patientMoods.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">
                  {t('common.noData', language)}
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Visual bar chart */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-2">{t('progress.mood', language)} (1-5)</p>
                    <div className="flex items-end gap-1.5 h-24">
                      {patientMoods.slice(0, 7).reverse().map((entry) => (
                        <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs">{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>
                          <div
                            className="w-full rounded-t-md bg-primary/70 transition-all"
                            style={{ height: `${(entry.mood / 5) * 60}px` }}
                          />
                          <span className="text-[9px] text-text-secondary">
                            {new Date(entry.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      })()}

    </div>
  );
}
