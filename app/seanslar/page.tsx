'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, Circle, Search, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { formatDate, formatTime } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function SeanslarPage() {
  const sessions = useStore((s) => s.sessions);
  const toggleSessionComplete = useStore((s) => s.toggleSessionComplete);
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const isPatient = userRole === 'patient';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const allFiltered = useMemo(() => {
    let list = [...sessions];
    if (isPatient && loggedInPatientId) list = list.filter((s) => s.patientId === loggedInPatientId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.patientName.toLowerCase().includes(q) || s.applications.some((a) => a.toLowerCase().includes(q)));
    }
    if (statusFilter === 'completed') list = list.filter((s) => s.completed);
    if (statusFilter === 'pending') list = list.filter((s) => !s.completed);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, search, statusFilter, isPatient, loggedInPatientId]);

  // Today's pending sessions
  const today = new Date().toDateString();
  const todayPending = useMemo(() => {
    return allFiltered.filter((s) => !s.completed && new Date(s.date).toDateString() === today);
  }, [allFiltered, today]);

  const handleToggle = (id: string, done: boolean) => {
    toggleSessionComplete(id);
    if (!done) showToast(t('sessions.saved', language));
  };

  const SessionRow = ({ session, highlight }: { session: typeof sessions[0]; highlight?: boolean }) => (
    <div className={`flex items-start gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 ${highlight ? 'bg-warning/5' : 'hover:bg-background/50'} transition-colors`}>
      {!isPatient && (
        <button onClick={() => handleToggle(session.id, session.completed)} className="shrink-0 mt-0.5">
          {session.completed
            ? <CheckCircle className="h-5 w-5 text-health-green" />
            : <Circle className="h-5 w-5 text-text-secondary hover:text-primary transition-colors" />
          }
        </button>
      )}

      <div className="flex-1 min-w-0">
        {/* Line 1: Patient + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-text-main">{session.patientName}</p>
          <span className="text-xs text-text-secondary">{formatDate(session.date)}</span>
          <span className="text-xs text-text-secondary">{formatTime(session.date)}</span>
          <span className="text-xs text-text-secondary">· {session.duration} {t('common.min', language)}</span>
        </div>

        {/* Line 2: Applications */}
        <div className="flex flex-wrap gap-1 mt-1">
          {session.applications.map((app) => (
            <span key={app} className="rounded bg-primary/8 px-1.5 py-0.5 text-[11px] text-primary font-medium">{app}</span>
          ))}
        </div>

        {/* Line 3: Notes (if any) */}
        {session.notes && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-1">{session.notes}</p>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0 mt-0.5">
        {!session.completed && !isPatient ? (
          <Button size="sm" onClick={() => handleToggle(session.id, false)}>
            {t('sessions.done', language)}
          </Button>
        ) : (
          <Badge variant={session.completed ? 'success' : 'warning'}>
            {session.completed ? t('sessions.doneShort', language) : t('sessions.pendingShort', language)}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-main shrink-0">{t('sessions.title', language)}</h2>
        <div className="flex flex-col sm:flex-row flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('sessions.searchPlaceholder', language)}
              className="w-full rounded-lg border border-border/50 bg-card py-2 pl-9 pr-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          >
            <option value="all">{t('sessions.all', language)}</option>
            <option value="completed">{t('sessions.completedFilter', language)}</option>
            <option value="pending">{t('sessions.pendingFilter', language)}</option>
          </select>
        </div>
      </div>

      {/* Today's pending */}
      {todayPending.length > 0 && statusFilter !== 'completed' && (
        <Card padding={false}>
          <div className="px-4 py-2.5 border-b border-warning/20 bg-warning/5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-warning">
                {t('sessions.todayPending', language)} — {todayPending.length} {language === 'tr' ? 'bekleyen seans' : 'pending'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {todayPending.map((s) => <SessionRow key={s.id} session={s} highlight />)}
          </div>
        </Card>
      )}

      {/* All sessions */}
      {allFiltered.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary text-center py-8">{t('sessions.noFound', language)}</p>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-border/30">
            {allFiltered.map((s) => <SessionRow key={s.id} session={s} />)}
          </div>
        </Card>
      )}
    </div>
  );
}
