'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MapPin, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PainMapWidget from '@/components/patient/PainMapWidget';
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
  const painPoints = useStore((s) => s.painPoints);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedPain, setSelectedPain] = useState<number | null>(null);

  // Effective patient: for patient role always own ID, for doctor use selection
  const effectivePatient = isPatient && loggedInPatientId
    ? loggedInPatientId
    : selectedPatient || patientsWithProgress[0]?.id || '';

  const painPointsForPatient = painPoints.filter((p) => p.patientId === effectivePatient);

  const data = progressRecords
    .filter((r) => r.patientId === effectivePatient)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: formatShortDate(r.date),
      agri: r.painLevel,
      rom: r.rangeOfMotion,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {isPatient ? t('progress.myProgress', language) : t('progress.title', language)}
          </h2>
          <p className="text-sm text-text-secondary">
            {isPatient ? t('progress.myProgressDesc', language) : t('progress.subtitle', language)}
          </p>
        </div>
        {!isPatient && (
          <div className="w-64">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-text-main mb-1">{t('progress.painLevel', language)}</h3>
          <p className="text-xs text-text-secondary mb-4">{t('progress.painDesc', language)}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
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
                dataKey="agri"
                name={t('progress.painLevel', language)}
                stroke="#2F80ED"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#fff', stroke: '#2F80ED', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#2F80ED' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-text-main mb-1">{t('progress.rom', language)}</h3>
          <p className="text-xs text-text-secondary mb-4">{t('progress.romDesc', language)}</p>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* Pain Map + Notes */}
      {effectivePatient && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PainMapWidget />
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-danger" />
              <h3 className="text-sm font-semibold text-text-main">
                {t('progress.painNotes', language)}
              </h3>
              <span className="text-[11px] text-text-secondary ml-auto">
                {painPointsForPatient.length} {t('common.points', language)}
              </span>
            </div>

            {painPointsForPatient.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center py-8 text-text-secondary">
                  <MapPin className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">{t('progress.noPainPoints', language)}</p>
                  {isPatient && <p className="text-[11px] mt-1 text-text-secondary/60">{t('progress.clickToAdd', language)}</p>}
                </div>
              </Card>
            ) : (
              <div className="overflow-y-auto space-y-3 pr-1" style={{ maxHeight: '460px' }}>
              {painPointsForPatient
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((pt) => {
                  const colors = ['#27AE60','#F39C12','#E67E22','#E74C3C','#C0392B'];
                  const labels = language === 'tr' ? ['Çok Hafif','Hafif','Orta','Şiddetli','Çok Şiddetli'] : ['Very Mild','Mild','Moderate','Severe','Very Severe'];
                  const color = colors[pt.intensity - 1];
                  return (
                    <Card key={pt.id} className="relative overflow-hidden">
                      {/* Left color accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: color }} />
                      <div className="flex items-start gap-3 pl-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {pt.intensity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-main">{pt.label}</span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                              {labels[pt.intensity - 1]}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-1">
                            {new Date(pt.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {/* Intensity dots */}
                          <div className="flex gap-1 mt-2">
                            {[1,2,3,4,5].map((v) => (
                              <div
                                key={v}
                                className="h-2 w-6 rounded-full transition-colors"
                                style={{ backgroundColor: v <= pt.intensity ? color : 'var(--color-border)' }}
                              />
                            ))}
                          </div>
                        </div>
                        {isPatient && (
                          <button
                            onClick={() => { useStore.getState().removePainPoint(pt.id); useStore.getState().showToast(t('progress.removed', language)); }}
                            className="flex-shrink-0 rounded-lg p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood & Pain Quick Entry (Patient) / Mood History (Doctor) */}
      {effectivePatient && (() => {
        const MOODS = [
          { value: 1, emoji: '😞', label: t('progress.veryBad', language) },
          { value: 2, emoji: '😕', label: t('progress.bad', language) },
          { value: 3, emoji: '😐', label: t('progress.okay', language) },
          { value: 4, emoji: '🙂', label: t('progress.good', language) },
          { value: 5, emoji: '😊', label: t('progress.great', language) },
        ];
        const PAINS = [
          { value: 1, emoji: '😊', label: t('progress.none', language) },
          { value: 2, emoji: '🙂', label: t('progress.mild', language) },
          { value: 3, emoji: '😐', label: t('progress.moderate', language) },
          { value: 4, emoji: '😣', label: t('progress.severe', language) },
          { value: 5, emoji: '😫', label: t('progress.verySevere', language) },
        ];

        const patientMoods = moodEntries
          .filter((m) => m.patientId === effectivePatient)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const todayStr = new Date().toDateString();
        const todayEntry = patientMoods.find((m) => new Date(m.date).toDateString() === todayStr);

        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

                  {/* Pain selection */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-2">{t('progress.painStatus', language)}</p>
                    <div className="flex gap-2">
                      {PAINS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setSelectedPain(p.value)}
                          className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 border-2 transition-all ${
                            selectedPain === p.value
                              ? 'border-danger bg-danger/5 scale-105'
                              : 'border-border/50 hover:border-danger/30'
                          }`}
                        >
                          <span className="text-2xl">{p.emoji}</span>
                          <span className="text-[10px] text-text-secondary">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (!selectedMood || !selectedPain) return;
                      addMoodEntry({
                        id: `me-${Date.now()}`,
                        patientId: effectivePatient,
                        date: new Date().toISOString(),
                        mood: selectedMood,
                        painLevel: selectedPain,
                      });
                      setSelectedMood(null);
                      setSelectedPain(null);
                      showToast(t('progress.saved', language));
                    }}
                    disabled={!selectedMood || !selectedPain}
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
                    <div className="text-center">
                      <span className="text-3xl">{PAINS.find((p) => p.value === todayEntry.painLevel)?.emoji}</span>
                      <p className="text-xs text-text-secondary mt-1">{PAINS.find((p) => p.value === todayEntry.painLevel)?.label}</p>
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
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="text-lg">{PAINS.find((p) => p.value === entry.painLevel)?.emoji}</span>
                          <span className="text-[11px] text-text-secondary">{PAINS.find((p) => p.value === entry.painLevel)?.label}</span>
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
                {t('progress.moodPainChange', language)}
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
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-medium text-text-secondary mb-2">{t('progress.painStatus', language)} (1-5)</p>
                    <div className="flex items-end gap-1.5 h-24">
                      {patientMoods.slice(0, 7).reverse().map((entry) => (
                        <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs">{PAINS.find((p) => p.value === entry.painLevel)?.emoji}</span>
                          <div
                            className="w-full rounded-t-md bg-danger/70 transition-all"
                            style={{ height: `${(entry.painLevel / 5) * 60}px` }}
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
