'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  Award, Flame, Droplets, Dumbbell, Calendar,
  TrendingUp, Star, Heart, Zap, Target,
  Trophy, Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';

const MODULE_NOW = Date.now();

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'exercise' | 'attendance' | 'progress' | 'hydration' | 'special';
  color: string;
  bg: string;
  check: (data: AchievementData) => { earned: boolean; progress: number; max: number };
}

interface AchievementData {
  completedSessions: number;
  exerciseDaysLast30: number;
  waterDaysReached: number;
  totalPainReduction: number;
  streakDays: number;
  messageCount: number;
  progressNoteCount: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1', title: 'İlk Adım', description: 'İlk seansınızı tamamlayın',
    icon: Star, category: 'attendance', color: 'text-warning', bg: 'bg-warning/10',
    check: (d) => ({ earned: d.completedSessions >= 1, progress: Math.min(d.completedSessions, 1), max: 1 }),
  },
  {
    id: 'a2', title: 'Düzenli Hasta', description: '5 seans tamamlayın',
    icon: Calendar, category: 'attendance', color: 'text-primary', bg: 'bg-primary/10',
    check: (d) => ({ earned: d.completedSessions >= 5, progress: Math.min(d.completedSessions, 5), max: 5 }),
  },
  {
    id: 'a3', title: 'Tedavi Kahramanı', description: '10 seans tamamlayın',
    icon: Trophy, category: 'attendance', color: 'text-warning', bg: 'bg-warning/10',
    check: (d) => ({ earned: d.completedSessions >= 10, progress: Math.min(d.completedSessions, 10), max: 10 }),
  },
  {
    id: 'a4', title: 'Egzersiz Savaşçısı', description: '7 gün üst üste egzersiz yapın',
    icon: Flame, category: 'exercise', color: 'text-danger', bg: 'bg-danger/10',
    check: (d) => ({ earned: d.streakDays >= 7, progress: Math.min(d.streakDays, 7), max: 7 }),
  },
  {
    id: 'a5', title: 'Egzersiz Ustası', description: '30 günde 20 gün egzersiz yapın',
    icon: Dumbbell, category: 'exercise', color: 'text-primary', bg: 'bg-primary/10',
    check: (d) => ({ earned: d.exerciseDaysLast30 >= 20, progress: Math.min(d.exerciseDaysLast30, 20), max: 20 }),
  },
  {
    id: 'a6', title: 'Su Perisi', description: '7 gün su hedefinize ulaşın',
    icon: Droplets, category: 'hydration', color: 'text-info', bg: 'bg-info/10',
    check: (d) => ({ earned: d.waterDaysReached >= 7, progress: Math.min(d.waterDaysReached, 7), max: 7 }),
  },
  {
    id: 'a7', title: 'Ağrı Avcısı', description: 'Toplam 10 puan ağrı azalması sağlayın',
    icon: TrendingUp, category: 'progress', color: 'text-health-green', bg: 'bg-health-green/10',
    check: (d) => ({ earned: d.totalPainReduction >= 10, progress: Math.min(d.totalPainReduction, 10), max: 10 }),
  },
  {
    id: 'a8', title: 'İyileşme Yolunda', description: 'Toplam 5 puan ağrı azalması',
    icon: Heart, category: 'progress', color: 'text-danger', bg: 'bg-danger/10',
    check: (d) => ({ earned: d.totalPainReduction >= 5, progress: Math.min(d.totalPainReduction, 5), max: 5 }),
  },
  {
    id: 'a10', title: 'İletişim Uzmanı', description: 'Doktorunuzla 10 mesaj alışverişi yapın',
    icon: Zap, category: 'special', color: 'text-primary', bg: 'bg-primary/10',
    check: (d) => ({ earned: d.messageCount >= 10, progress: Math.min(d.messageCount, 10), max: 10 }),
  },
  {
    id: 'a11', title: 'Günlük Takipçi', description: '5 ilerleme notu yazın',
    icon: Target, category: 'progress', color: 'text-health-green', bg: 'bg-health-green/10',
    check: (d) => ({ earned: d.progressNoteCount >= 5, progress: Math.min(d.progressNoteCount, 5), max: 5 }),
  },
  {
    id: 'a12', title: 'Şampiyon', description: 'Tüm rozetlerin yarısını kazanın',
    icon: Crown, category: 'special', color: 'text-warning', bg: 'bg-warning/10',
    check: () => ({ earned: false, progress: 0, max: 6 }), // will be computed
  },
];

const CATEGORY_LABELS: Record<string, { tr: string; en: string }> = {
  exercise: { tr: 'Egzersiz', en: 'Exercise' },
  attendance: { tr: 'Katılım', en: 'Attendance' },
  progress: { tr: 'İlerleme', en: 'Progress' },
  hydration: { tr: 'Hidrasyon', en: 'Hydration' },
  special: { tr: 'Özel', en: 'Special' },
};

export default function BasarilarimPage() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const sessions = useStore((s) => s.sessions);
  const exerciseCompletions = useStore((s) => s.exerciseCompletions);
  const waterIntake = useStore((s) => s.waterIntake);
  const chatMessages = useStore((s) => s.chatMessages);
  const progressNotes = useStore((s) => s.progressNotes);

  const data: AchievementData = useMemo(() => {
    const pid = loggedInPatientId || '';
    const now = MODULE_NOW;
    const completedSessions = sessions.filter((s) => s.patientId === pid && s.completed).length;

    const myCompletions = exerciseCompletions.filter((c) => c.patientId === pid);
    const last30 = new Date(now - 30 * 86400000).toISOString().split('T')[0];
    const exerciseDaysLast30 = new Set(myCompletions.filter((c) => c.date >= last30).map((c) => c.date)).size;

    // Calculate streak
    let streakDays = 0;
    const completionDates = [...new Set(myCompletions.map((c) => c.date))].sort().reverse();
    for (let i = 0; i < completionDates.length; i++) {
      const expected = new Date(now - i * 86400000).toISOString().split('T')[0];
      if (completionDates[i] === expected) streakDays++;
      else break;
    }

    // Water days
    let waterDaysReached = 0;
    for (const key in waterIntake) {
      if (key.startsWith(pid) && waterIntake[key] >= 8) waterDaysReached++;
    }

    const totalPainReduction = sessions
      .filter((s) => s.patientId === pid && s.completed)
      .reduce((sum, s) => sum + (s.painLevelBefore - s.painLevelAfter), 0);

    const messageCount = chatMessages.filter((m) => m.patientId === pid).length;
    const progressNoteCount = progressNotes.filter((n) => n.patientId === pid && n.author === 'patient').length;

    return { completedSessions, exerciseDaysLast30, waterDaysReached, totalPainReduction, streakDays, messageCount, progressNoteCount };
  }, [loggedInPatientId, sessions, exerciseCompletions, waterIntake, chatMessages, progressNotes]);

  const results = useMemo(() => {
    const res = ACHIEVEMENTS.map((a) => {
      const result = a.check(data);
      return { ...a, ...result };
    });
    // Fix "champion" achievement
    const earnedCount = res.filter((r) => r.id !== 'a12' && r.earned).length;
    const champIdx = res.findIndex((r) => r.id === 'a12');
    if (champIdx >= 0) {
      res[champIdx] = { ...res[champIdx], earned: earnedCount >= 6, progress: Math.min(earnedCount, 6), max: 6 };
    }
    return res;
  }, [data]);

  const earnedCount = results.filter((r) => r.earned).length;
  const totalCount = results.length;
  const percentage = Math.round((earnedCount / totalCount) * 100);

  const categories = ['exercise', 'attendance', 'progress', 'hydration', 'special'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('achievements.title', language)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('achievements.subtitle', language)}
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
            <Award className="h-10 w-10 text-warning" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-main">{earnedCount}</span>
              <span className="text-lg text-text-secondary">/ {totalCount}</span>
            </div>
            <p className="text-sm text-text-secondary mb-2">
              {t('achievements.badgesEarned', language)}
            </p>
            <ProgressBar value={percentage} max={100} />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{data.streakDays}</p>
            <p className="text-xs text-text-secondary">
              {t('achievements.dayStreak', language)}
            </p>
          </div>
        </div>
      </Card>

      {/* Achievements by category */}
      {categories.map((cat) => {
        const catResults = results.filter((r) => r.category === cat);
        if (catResults.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[cat]?.[language] || cat}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catResults.map((achievement, idx) => {
                const Icon = achievement.icon;
                const progressPct = Math.round((achievement.progress / achievement.max) * 100);
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card>
                      <div className={`relative ${!achievement.earned ? 'opacity-60' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${achievement.bg} ${achievement.earned ? 'ring-2 ring-offset-2 ring-warning/30' : ''}`}>
                            <Icon className={`h-6 w-6 ${achievement.earned ? achievement.color : 'text-text-secondary'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-text-main truncate">{achievement.title}</h3>
                              {achievement.earned && (
                                <Badge variant="success">
                                  {t('achievements.earned', language)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">{achievement.description}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1">
                                <span>{achievement.progress}/{achievement.max}</span>
                                <span>{progressPct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-background overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${achievement.earned ? 'bg-warning' : 'bg-primary/40'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPct}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {achievement.earned && (
                          <div className="absolute -top-1 -right-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning text-white text-[10px]">
                              <Star className="h-3 w-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
