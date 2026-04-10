'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, X, Timer, ChevronRight, Check } from 'lucide-react';
import { useStore } from '@/lib/store';

interface ExerciseTimerProps {
  exerciseName: string;
  sets: number;
  reps: number;
  onClose: () => void;
}

export default function ExerciseTimer({ exerciseName, sets, reps, onClose }: ExerciseTimerProps) {
  const language = useStore((s) => s.language);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';

  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(30);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rest countdown
  useEffect(() => {
    if (isResting && restTime > 0) {
      intervalRef.current = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            setIsResting(false);
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isResting, restTime]);

  const addRep = () => {
    if (completed) return;
    const newRep = currentRep + 1;
    if (newRep >= reps) {
      if (currentSet >= sets) {
        setCurrentRep(reps);
        setCompleted(true);
        showToast(tr ? 'Egzersiz tamamlandı!' : 'Exercise completed!');
      } else {
        setCurrentRep(0);
        setCurrentSet((s) => s + 1);
        setIsResting(true);
      }
    } else {
      setCurrentRep(newRep);
    }
  };

  const reset = () => {
    setCurrentSet(1);
    setCurrentRep(0);
    setIsResting(false);
    setRestTime(30);
    setCompleted(false);
  };

  const progress = ((currentSet - 1) * reps + currentRep) / (sets * reps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-text-main">{exerciseName}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-text-secondary hover:bg-background transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Progress ring */}
          <div className="flex justify-center">
            <div className="relative h-36 w-36">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="62" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                <circle
                  cx="72" cy="72" r="62" fill="none"
                  stroke={completed ? 'var(--color-health-green)' : isResting ? 'var(--color-warning)' : 'var(--color-primary)'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {completed ? (
                  <>
                    <Check className="h-10 w-10 text-health-green mb-1" />
                    <span className="text-xs font-medium text-health-green">{tr ? 'Bitti!' : 'Done!'}</span>
                  </>
                ) : isResting ? (
                  <>
                    <span className="text-3xl font-bold text-warning">{restTime}</span>
                    <span className="text-xs text-text-secondary">{tr ? 'Dinlenme' : 'Rest'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-text-main">{currentRep}</span>
                    <span className="text-xs text-text-secondary">/ {reps} {tr ? 'tekrar' : 'reps'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Set indicators */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: sets }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 w-8 rounded-full transition-colors ${
                  i < currentSet - 1 || (i === currentSet - 1 && completed)
                    ? 'bg-health-green'
                    : i === currentSet - 1
                    ? 'bg-primary'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-text-secondary text-center">
            Set {currentSet}/{sets}
          </p>

          {/* Controls */}
          {!completed && !isResting && (
            <div className="flex justify-center gap-3">
              <button
                onClick={addRep}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all active:scale-95"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>
          )}

          {isResting && (
            <button
              onClick={() => { setIsResting(false); setRestTime(30); }}
              className="w-full rounded-xl bg-warning/10 border border-warning/20 py-2.5 text-xs font-medium text-warning hover:bg-warning/20 transition-colors"
            >
              {tr ? 'Dinlenmeyi Atla' : 'Skip Rest'}
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-medium text-text-secondary hover:bg-background transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {tr ? 'Sıfırla' : 'Reset'}
            </button>
            {completed && (
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-health-green py-2.5 text-xs font-medium text-white hover:bg-health-green/90 transition-colors"
              >
                {tr ? 'Kapat' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
