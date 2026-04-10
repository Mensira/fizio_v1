'use client';

import { CheckCircle2, Circle, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function DailyGoalsWidget() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const dailyGoals = useStore((s) => s.dailyGoals);
  const toggleDailyGoal = useStore((s) => s.toggleDailyGoal);
  const tr = language === 'tr';

  const today = new Date().toISOString().split('T')[0];
  const myGoals = dailyGoals.filter((g) => g.patientId === loggedInPatientId);
  const completedCount = myGoals.filter((g) => g.completedDates.includes(today)).length;
  const progress = myGoals.length > 0 ? Math.round((completedCount / myGoals.length) * 100) : 0;

  if (myGoals.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-green/10">
            <Target className="h-4 w-4 text-health-green" />
          </div>
          <h3 className="text-sm font-semibold text-text-main">
            {tr ? 'Günlük Hedefler' : 'Daily Goals'}
          </h3>
        </div>
        <span className="text-xs font-semibold text-health-green">{completedCount}/{myGoals.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-background mb-3 overflow-hidden">
        <div
          className="h-2 rounded-full bg-health-green transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {myGoals.map((goal) => {
          const done = goal.completedDates.includes(today);
          return (
            <button
              key={goal.id}
              onClick={() => toggleDailyGoal(goal.id, today)}
              className={`flex w-full items-center gap-3 rounded-lg border p-2.5 transition-all ${
                done
                  ? 'border-health-green/30 bg-health-green/5'
                  : 'border-border/50 hover:border-health-green/30'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-health-green flex-shrink-0" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-text-secondary flex-shrink-0" />
              )}
              <span className={`text-xs font-medium ${done ? 'text-health-green line-through' : 'text-text-main'}`}>
                {goal.text}
              </span>
            </button>
          );
        })}
      </div>

      {progress === 100 && (
        <p className="text-xs text-health-green font-medium text-center mt-3">
          {tr ? 'Tebrikler! Tüm hedeflerinizi tamamladınız!' : 'Congratulations! All goals completed!'}
        </p>
      )}
    </Card>
  );
}
