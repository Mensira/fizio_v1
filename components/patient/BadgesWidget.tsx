'use client';

import { useMemo } from 'react';
import {
  Flame,
  Footprints,
  Zap,
  Star,
  Droplets,
  Swords,
  CalendarCheck,
  Target,
  Crown,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { useStore } from '@/lib/store';

interface BadgeDefinition {
  id: string;
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  check: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  streak: number;
  exerciseCompletionCount: number;
  maxWaterInDay: number;
  painPointCount: number;
  completedSessionCount: number;
  hasAllGoalsDay: boolean;
}

function calculateStreak(
  completions: { patientId: string; date: string }[],
  patientId: string | null
): number {
  if (!patientId) return 0;

  const dates = new Set(
    completions
      .filter((c) => c.patientId === patientId)
      .map((c) => c.date)
  );

  let streak = 0;
  const day = new Date();
  // Start from today and go backwards
  while (true) {
    const key = day.toISOString().split('T')[0];
    if (dates.has(key)) {
      streak++;
      day.setDate(day.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const BADGE_DEFS: BadgeDefinition[] = [
  {
    id: 'first-step',
    name: { tr: 'İlk Adım', en: 'First Step' },
    description: { tr: 'İlk egzersiz seansını tamamla', en: 'Complete your first exercise session' },
    icon: <Footprints className="h-5 w-5" />,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    check: (ctx) => ctx.exerciseCompletionCount >= 1,
  },
  {
    id: '3-day-streak',
    name: { tr: '3 Gün Serisi', en: '3 Day Streak' },
    description: { tr: '3 gün üst üste egzersiz yap', en: '3 consecutive days of exercise' },
    icon: <Zap className="h-5 w-5" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    check: (ctx) => ctx.streak >= 3,
  },
  {
    id: 'weekly-star',
    name: { tr: 'Haftalık Yıldız', en: 'Weekly Star' },
    description: { tr: '7 gün üst üste egzersiz yap', en: '7 consecutive days of exercise' },
    icon: <Star className="h-5 w-5" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    check: (ctx) => ctx.streak >= 7,
  },
  {
    id: 'water-master',
    name: { tr: 'Su Ustası', en: 'Water Master' },
    description: { tr: 'Bir günde 8 bardak su iç', en: 'Drink 8 glasses of water in a day' },
    icon: <Droplets className="h-5 w-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    check: (ctx) => ctx.maxWaterInDay >= 8,
  },
  {
    id: 'pain-warrior',
    name: { tr: 'Ağrı Savaşçısı', en: 'Pain Warrior' },
    description: { tr: '3+ ağrı noktası kaydet', en: 'Log 3+ pain points' },
    icon: <Swords className="h-5 w-5" />,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    check: (ctx) => ctx.painPointCount >= 3,
  },
  {
    id: 'regular-patient',
    name: { tr: 'Düzenli Hasta', en: 'Regular Patient' },
    description: { tr: '5+ seans tamamla', en: 'Complete 5+ sessions' },
    icon: <CalendarCheck className="h-5 w-5" />,
    color: 'text-health-green',
    bgColor: 'bg-health-green/10',
    check: (ctx) => ctx.completedSessionCount >= 5,
  },
  {
    id: 'goal-hunter',
    name: { tr: 'Hedef Avcısı', en: 'Goal Hunter' },
    description: { tr: 'Bir günde tüm hedefleri tamamla', en: 'Complete all daily goals in a day' },
    icon: <Target className="h-5 w-5" />,
    color: 'text-health-green',
    bgColor: 'bg-health-green/10',
    check: (ctx) => ctx.hasAllGoalsDay,
  },
  {
    id: 'motivation-king',
    name: { tr: 'Motivasyon Kralı', en: 'Motivation King' },
    description: { tr: '14 gün üst üste egzersiz yap', en: '14 consecutive days of exercise' },
    icon: <Crown className="h-5 w-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    check: (ctx) => ctx.streak >= 14,
  },
];

export default function BadgesWidget() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const exerciseCompletions = useStore((s) => s.exerciseCompletions);
  const waterIntake = useStore((s) => s.waterIntake);
  const painPoints = useStore((s) => s.painPoints);
  const sessions = useStore((s) => s.sessions);
  const dailyGoals = useStore((s) => s.dailyGoals);

  const tr = language === 'tr';

  const { streak, context } = useMemo(() => {
    const s = calculateStreak(exerciseCompletions, loggedInPatientId);

    const exerciseCompletionCount = exerciseCompletions.filter(
      (c) => c.patientId === loggedInPatientId
    ).length;

    // Max water intake in any single day for this patient
    let maxWaterInDay = 0;
    if (loggedInPatientId) {
      for (const [key, value] of Object.entries(waterIntake)) {
        if (key.startsWith(`${loggedInPatientId}-`)) {
          if (value > maxWaterInDay) maxWaterInDay = value;
        }
      }
    }

    const painPointCount = painPoints.filter(
      (p) => p.patientId === loggedInPatientId
    ).length;

    const completedSessionCount = sessions.filter(
      (sess) => sess.patientId === loggedInPatientId && sess.completed
    ).length;

    // Check if patient completed all daily goals on any single day
    const myGoals = dailyGoals.filter((g) => g.patientId === loggedInPatientId);
    let hasAllGoalsDay = false;
    if (myGoals.length > 0) {
      // Collect all dates where any goal was completed
      const allDates = new Set<string>();
      myGoals.forEach((g) => g.completedDates.forEach((d) => allDates.add(d)));
      for (const date of allDates) {
        if (myGoals.every((g) => g.completedDates.includes(date))) {
          hasAllGoalsDay = true;
          break;
        }
      }
    }

    const ctx: BadgeContext = {
      streak: s,
      exerciseCompletionCount,
      maxWaterInDay,
      painPointCount,
      completedSessionCount,
      hasAllGoalsDay,
    };

    return { streak: s, context: ctx };
  }, [exerciseCompletions, waterIntake, painPoints, sessions, dailyGoals, loggedInPatientId]);

  const badges = BADGE_DEFS.map((def) => ({
    ...def,
    earned: def.check(context),
  }));

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card>
      {/* Header with streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
            <Flame className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-main">
              {tr ? 'Rozetler & Seri' : 'Badges & Streak'}
            </h3>
            <p className="text-xs text-text-secondary">
              {earnedCount}/{badges.length} {tr ? 'rozet kazanıldı' : 'badges earned'}
            </p>
          </div>
        </div>

        {/* Streak display */}
        <motion.div
          className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5"
          animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-bold text-warning">{streak}</span>
          <span className="text-xs text-warning/70">{tr ? 'gün' : 'days'}</span>
        </motion.div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-4 gap-2">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative flex flex-col items-center"
          >
            {/* Icon circle */}
            <div
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                badge.earned
                  ? `${badge.bgColor} ${badge.color}`
                  : 'bg-background text-text-secondary/40'
              }`}
            >
              {badge.earned ? (
                badge.icon
              ) : (
                <>
                  <div className="opacity-30">{badge.icon}</div>
                  <Lock className="absolute h-3 w-3 text-text-secondary/60 bottom-0 right-0" />
                </>
              )}
            </div>

            {/* Badge name */}
            <span
              className={`mt-1 text-center text-[10px] leading-tight font-medium ${
                badge.earned ? 'text-text-main' : 'text-text-secondary/50'
              }`}
            >
              {tr ? badge.name.tr : badge.name.en}
            </span>

            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-text-main px-2 py-1 text-[10px] text-card opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {tr ? badge.description.tr : badge.description.en}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
