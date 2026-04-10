'use client';

import { useMemo } from 'react';
import { progressRecords } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Activity, Smile, ArrowRight } from 'lucide-react';

interface BeforeAfterComparisonProps {
  patientId?: string;
}

const moodEmojis: Record<number, string> = {
  1: '\uD83D\uDE1E',
  2: '\uD83D\uDE41',
  3: '\uD83D\uDE10',
  4: '\uD83D\uDE42',
  5: '\uD83D\uDE04',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

interface MetricRowProps {
  label: string;
  icon: React.ReactNode;
  startValue: string;
  nowValue: string;
  startDate: string;
  nowDate: string;
  improved: boolean;
  changeText: string;
}

function MetricRow({ label, icon, startValue, nowValue, startDate, nowDate, improved, changeText }: MetricRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${improved ? 'bg-health-green/10' : 'bg-danger/10'}`}>
        <span className={improved ? 'text-health-green' : 'text-danger'}>{icon}</span>
      </div>

      {/* Label + change */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-main">{label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {improved ? (
            <TrendingUp className="h-3 w-3 text-health-green" />
          ) : (
            <TrendingDown className="h-3 w-3 text-danger" />
          )}
          <span className={`text-xs font-medium ${improved ? 'text-health-green' : 'text-danger'}`}>
            {changeText}
          </span>
        </div>
      </div>

      {/* Before -> After values */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-text-secondary">{startValue}</p>
          <p className="text-[10px] text-text-secondary/70">{formatDate(startDate)}</p>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-text-secondary/50" />
        <div className="text-right">
          <p className="text-sm font-bold text-text-main">{nowValue}</p>
          <p className="text-[10px] text-text-secondary/70">{formatDate(nowDate)}</p>
        </div>
      </div>
    </div>
  );
}

export default function BeforeAfterComparison({ patientId }: BeforeAfterComparisonProps) {
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const moodEntries = useStore((s) => s.moodEntries);
  const language = useStore((s) => s.language);

  const resolvedPatientId = patientId || loggedInPatientId;
  const isTr = language === 'tr';

  const patientRecords = useMemo(() => {
    if (!resolvedPatientId) return [];
    return progressRecords
      .filter((r) => r.patientId === resolvedPatientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resolvedPatientId]);

  const patientMoods = useMemo(() => {
    if (!resolvedPatientId) return [];
    return moodEntries
      .filter((m) => m.patientId === resolvedPatientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resolvedPatientId, moodEntries]);

  const firstRecord = patientRecords[0] ?? null;
  const latestRecord = patientRecords[patientRecords.length - 1] ?? null;
  const firstMood = patientMoods[0] ?? null;
  const latestMood = patientMoods[patientMoods.length - 1] ?? null;

  // Overall improvement score
  const overallScore = useMemo(() => {
    if (!firstRecord || !latestRecord) return 0;
    const scores: number[] = [];

    if (firstRecord.painLevel > 0) {
      const painImprovement = ((firstRecord.painLevel - latestRecord.painLevel) / firstRecord.painLevel) * 100;
      scores.push(Math.max(0, painImprovement));
    }

    if (firstRecord.rangeOfMotion > 0) {
      const romImprovement = ((latestRecord.rangeOfMotion - firstRecord.rangeOfMotion) / firstRecord.rangeOfMotion) * 100;
      scores.push(Math.max(0, Math.min(100, romImprovement)));
    }

    if (firstMood && latestMood && firstMood.mood > 0) {
      const moodImprovement = ((latestMood.mood - firstMood.mood) / (5 - firstMood.mood || 1)) * 100;
      scores.push(Math.max(0, Math.min(100, moodImprovement)));
    }

    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [firstRecord, latestRecord, firstMood, latestMood]);

  if (!resolvedPatientId) {
    return (
      <Card>
        <p className="text-text-secondary text-sm text-center py-8">
          {isTr ? 'Hasta bilgisi bulunamadı.' : 'No patient information found.'}
        </p>
      </Card>
    );
  }

  if (!firstRecord || !latestRecord || firstRecord.id === latestRecord.id) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-text-main">
            {isTr ? 'Tedavi Öncesi vs Şimdi' : 'Before vs Now'}
          </h3>
        </div>
        <p className="text-text-secondary text-sm text-center py-6">
          {isTr
            ? 'Karşılaştırma için yeterli veri bulunmuyor.'
            : 'Not enough data for comparison.'}
        </p>
      </Card>
    );
  }

  const painDiff = firstRecord.painLevel - latestRecord.painLevel;
  const romDiff = latestRecord.rangeOfMotion - firstRecord.rangeOfMotion;
  const moodDiff = firstMood && latestMood ? latestMood.mood - firstMood.mood : 0;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-main">
            {isTr ? 'Tedavi Öncesi vs Şimdi' : 'Before vs Now'}
          </h3>
        </div>

        {/* Overall score pill */}
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          overallScore >= 50
            ? 'bg-health-green/10 text-health-green'
            : overallScore >= 20
            ? 'bg-warning/10 text-warning'
            : 'bg-primary/10 text-primary'
        }`}>
          <span>%{Math.round(overallScore)}</span>
          <span className="font-normal">{isTr ? 'iyileşme' : 'improvement'}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-2">
        {/* Pain */}
        <MetricRow
          label={isTr ? 'Ağrı Seviyesi' : 'Pain Level'}
          icon={<Activity size={16} />}
          startValue={`${firstRecord.painLevel}/10`}
          nowValue={`${latestRecord.painLevel}/10`}
          startDate={firstRecord.date}
          nowDate={latestRecord.date}
          improved={painDiff > 0}
          changeText={painDiff > 0
            ? `${painDiff} ${isTr ? 'puan azaldı' : 'pts decreased'}`
            : painDiff < 0
            ? `${Math.abs(painDiff)} ${isTr ? 'puan arttı' : 'pts increased'}`
            : isTr ? 'Değişim yok' : 'No change'
          }
        />

        {/* ROM */}
        <MetricRow
          label={isTr ? 'Hareket Açıklığı' : 'Range of Motion'}
          icon={<TrendingUp size={16} />}
          startValue={`${firstRecord.rangeOfMotion}\u00B0`}
          nowValue={`${latestRecord.rangeOfMotion}\u00B0`}
          startDate={firstRecord.date}
          nowDate={latestRecord.date}
          improved={romDiff > 0}
          changeText={romDiff > 0
            ? `+${romDiff}\u00B0 ${isTr ? 'artış' : 'increase'}`
            : romDiff < 0
            ? `${romDiff}\u00B0 ${isTr ? 'azalış' : 'decrease'}`
            : isTr ? 'Değişim yok' : 'No change'
          }
        />

        {/* Mood */}
        {firstMood && latestMood && (
          <MetricRow
            label={isTr ? 'Ruh Hali' : 'Mood'}
            icon={<Smile size={16} />}
            startValue={`${moodEmojis[firstMood.mood] || firstMood.mood} ${firstMood.mood}/5`}
            nowValue={`${moodEmojis[latestMood.mood] || latestMood.mood} ${latestMood.mood}/5`}
            startDate={firstMood.date}
            nowDate={latestMood.date}
            improved={moodDiff > 0}
            changeText={moodDiff > 0
              ? `+${moodDiff} ${isTr ? 'puan' : 'pts'}`
              : moodDiff < 0
              ? `${moodDiff} ${isTr ? 'puan' : 'pts'}`
              : isTr ? 'Değişim yok' : 'No change'
            }
          />
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-secondary">
            {isTr ? 'Genel İyileşme' : 'Overall Recovery'}
          </span>
          <span className="text-xs font-semibold text-text-main">%{Math.round(overallScore)}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-background overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-health-green transition-all duration-700"
            style={{ width: `${Math.max(2, Math.round(overallScore))}%` }}
          />
        </div>
        <p className="text-[10px] text-text-secondary mt-1.5">
          {isTr
            ? 'Ağrı azalması, hareket açıklığı ve ruh hali değişimlerine göre hesaplanır.'
            : 'Based on pain reduction, range of motion, and mood changes.'}
        </p>
      </div>
    </Card>
  );
}
