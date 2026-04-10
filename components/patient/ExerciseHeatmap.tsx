'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import { Flame, Activity } from 'lucide-react';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const TR_DAY_LABELS = ['Pzt', 'Sal', '\u00c7ar', 'Per', 'Cum', 'Cmt', 'Paz'];
const EN_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TR_MONTH_LABELS = ['Oca', '\u015eub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'A\u011fu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const EN_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WEEKS = 12;
const DAYS = 7;

export default function ExerciseHeatmap() {
  const exerciseCompletions = useStore((s) => s.exerciseCompletions);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const language = useStore((s) => s.language);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const isTr = language === 'tr';
  const dayLabels = isTr ? TR_DAY_LABELS : EN_DAY_LABELS;
  const monthLabels = isTr ? TR_MONTH_LABELS : EN_MONTH_LABELS;

  // Build set of completed dates for the logged-in patient
  const completedDates = useMemo(() => {
    if (!loggedInPatientId) return new Set<string>();
    const set = new Set<string>();
    for (const c of exerciseCompletions) {
      if (c.patientId === loggedInPatientId) {
        set.add(c.date);
      }
    }
    return set;
  }, [exerciseCompletions, loggedInPatientId]);

  // Build grid: 12 weeks x 7 days, most recent on the right
  // Each cell is a Date object
  const { grid, monthHeaders } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Monday of the current week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - mondayOffset);

    // Start from (WEEKS - 1) weeks before the current Monday
    const startMonday = new Date(currentMonday);
    startMonday.setDate(currentMonday.getDate() - (WEEKS - 1) * 7);

    const g: (Date | null)[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: (Date | null)[] = [];
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(startMonday);
        date.setDate(startMonday.getDate() + w * 7 + d);
        // Don't show future dates
        if (date > today) {
          week.push(null);
        } else {
          week.push(date);
        }
      }
      g.push(week);
    }

    // Month headers: for each week column, check if a new month starts
    const headers: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      // Use the Monday of each week for month labeling
      const mondayOfWeek = g[w][0];
      if (mondayOfWeek) {
        const month = mondayOfWeek.getMonth();
        if (month !== lastMonth) {
          headers.push({ col: w, label: monthLabels[month] });
          lastMonth = month;
        }
      }
    }

    return { grid: g, monthHeaders: headers };
  }, [monthLabels]);

  // Stats: total exercise days and current streak
  const { totalDays, currentStreak } = useMemo(() => {
    const total = completedDates.size;

    // Current streak: count consecutive days backwards from today
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(today);
    while (true) {
      const key = formatDate(d);
      if (completedDates.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    return { totalDays: total, currentStreak: streak };
  }, [completedDates]);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    date: Date | null
  ) => {
    if (!date) return;
    const dateStr = formatDate(date);
    const done = completedDates.has(dateStr);
    const dayName = dayLabels[(date.getDay() + 6) % 7]; // convert Sun=0 to Mon=0 index
    const formatted = `${date.getDate()} ${monthLabels[date.getMonth()]}`;
    const status = done
      ? (isTr ? 'Egzersiz yapıldı' : 'Exercise done')
      : (isTr ? 'Egzersiz yapılmadı' : 'No exercise');

    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('[data-heatmap-container]')?.getBoundingClientRect();
    if (parentRect) {
      setTooltip({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 4,
        text: `${dayName}, ${formatted} - ${status}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const CELL_SIZE = 14;
  const CELL_GAP = 3;

  return (
    <Card>
      {/* Header stats */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-main">
          {isTr ? 'Egzersiz Geçmişi' : 'Exercise History'}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-text-secondary">
              <span className="font-semibold text-text-main">{totalDays}</span>{' '}
              {isTr ? 'gün' : 'days'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-text-secondary">
              <span className="font-semibold text-text-main">{currentStreak}</span>{' '}
              {isTr ? 'gün seri' : 'day streak'}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative" data-heatmap-container>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.text}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid rgb(31, 41, 55)',
              }}
            />
          </div>
        )}

        {/* Month labels */}
        <div className="flex ml-8" style={{ gap: `${CELL_GAP}px` }}>
          {Array.from({ length: WEEKS }).map((_, w) => {
            const header = monthHeaders.find((h) => h.col === w);
            return (
              <div
                key={w}
                className="text-[10px] text-text-secondary"
                style={{ width: `${CELL_SIZE}px`, textAlign: 'left' }}
              >
                {header ? header.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid with day labels */}
        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div
            className="flex flex-col justify-between shrink-0"
            style={{
              width: '28px',
              height: `${DAYS * CELL_SIZE + (DAYS - 1) * CELL_GAP}px`,
            }}
          >
            {dayLabels.map((label, i) => (
              <div
                key={label}
                className="text-[10px] text-text-secondary leading-none flex items-center"
                style={{ height: `${CELL_SIZE}px` }}
              >
                {i % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>

          {/* Cells: iterate weeks (columns) then days (rows) */}
          <div className="flex" style={{ gap: `${CELL_GAP}px` }}>
            {grid.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: `${CELL_GAP}px` }}>
                {week.map((date, d) => {
                  const dateStr = date ? formatDate(date) : null;
                  const done = dateStr ? completedDates.has(dateStr) : false;
                  const isFuture = date === null;

                  return (
                    <div
                      key={d}
                      className={`rounded-[3px] transition-colors ${
                        isFuture
                          ? 'bg-transparent'
                          : done
                          ? 'bg-primary hover:ring-1 hover:ring-primary/50'
                          : 'bg-border/60 hover:ring-1 hover:ring-border'
                      }`}
                      style={{
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        opacity: isFuture ? 0 : done ? 1 : 0.5,
                        cursor: isFuture ? 'default' : 'pointer',
                      }}
                      onMouseEnter={(e) => handleMouseEnter(e, date)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-[10px] text-text-secondary">
            {isTr ? 'Az' : 'Less'}
          </span>
          <div
            className="rounded-[3px] bg-border/60"
            style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, opacity: 0.5 }}
          />
          <div
            className="rounded-[3px] bg-primary"
            style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
          />
          <span className="text-[10px] text-text-secondary">
            {isTr ? 'Çok' : 'More'}
          </span>
        </div>
      </div>
    </Card>
  );
}
