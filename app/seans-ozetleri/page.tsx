'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  ClipboardCheck, Clock, TrendingDown,
  Stethoscope, Activity, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeansOzetleriPage() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const sessions = useStore((s) => s.sessions);

  const mySessions = useMemo(() => {
    return sessions
      .filter((s) => s.patientId === loggedInPatientId && s.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, loggedInPatientId]);

  const totalPainReduction = useMemo(() => {
    if (mySessions.length === 0) return 0;
    return mySessions.reduce((sum, s) => sum + (s.painLevelBefore - s.painLevelAfter), 0);
  }, [mySessions]);

  const avgPainBefore = useMemo(() => {
    if (mySessions.length === 0) return 0;
    return (mySessions.reduce((sum, s) => sum + s.painLevelBefore, 0) / mySessions.length).toFixed(1);
  }, [mySessions]);

  const avgPainAfter = useMemo(() => {
    if (mySessions.length === 0) return 0;
    return (mySessions.reduce((sum, s) => sum + s.painLevelAfter, 0) / mySessions.length).toFixed(1);
  }, [mySessions]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
      hour: '2-digit', minute: '2-digit',
    });

  // Generate doctor summaries for each session (mock enrichment)
  const sessionSummaries: Record<string, { summary: string; homeExercises: string[]; nextNotes: string }> = {
    s1: {
      summary: 'Manuel terapi ile bel bölgesine mobilizasyon uygulandı. TENS ile ağrı kontrolü sağlandı. Hasta tedaviye iyi yanıt veriyor.',
      homeExercises: ['Hamstring germe (3x10)', 'Bird dog (3x10)', 'Sırt üstü diz göğse çekme (3x10)'],
      nextNotes: 'Ultrason tedavisi eklenecek. Egzersiz yoğunluğu artırılacak.',
    },
    s2: {
      summary: 'Ultrason tedavisi uygulandı. Egzersiz programı uygulatıldı. Ağrı seviyesinde belirgin azalma gözlemlendi.',
      homeExercises: ['Hamstring germe (3x12)', 'Bird dog (3x12)', 'Plank (3x20sn)', 'Köprü egzersizi (3x10)'],
      nextNotes: 'Kor stabilite egzersizlerine geçiş planlanıyor.',
    },
    s3: {
      summary: 'Kor stabilite egzersizlerine başlandı. Hasta tüm egzersizleri doğru formda yapabiliyor. İlerleme çok olumlu.',
      homeExercises: ['Plank (3x30sn)', 'Side plank (3x15sn)', 'Dead bug (3x10)', 'Bird dog (3x12)'],
      nextNotes: 'Güçlendirme fazına geçilebilir. Direnç eklenmesi planlanıyor.',
    },
    s4: {
      summary: 'Omuz mobilizasyonu uygulandı. Buz tedavisi sonrası ağrı azaldı. Pendulum egzersizleri öğretildi.',
      homeExercises: ['Pendulum egzersizi (3x15)', 'Duvar yürüyüşü (3x10)', 'İzometrik dış rotasyon (3x10)'],
      nextNotes: 'Güçlendirme egzersizlerine geçiş planlanıyor.',
    },
    s5: {
      summary: 'Güçlendirme fazına başlandı. Elastik bant ile dış rotasyon ve wall slide egzersizleri uygulandı.',
      homeExercises: ['Bant ile dış rotasyon (3x12)', 'Wall slide (3x10)', 'Pendulum (3x15)', 'Skapula sıkıştırma (3x10)'],
      nextNotes: 'Bant direnci artırılacak. Aktif ROM ölçümü yapılacak.',
    },
    s6: {
      summary: 'ROM artışı gözlemlendi. Fleksiyon 120 dereceye ulaştı. Elektroterapi ve egzersiz programı uygulandı.',
      homeExercises: ['Kuadriseps güçlendirme (3x12)', 'Diz fleksiyonu (3x15)', 'Mini squat (3x10)'],
      nextNotes: 'Spora dönüş protokolüne başlanabilir.',
    },
    s7: {
      summary: 'Merdiven egzersizleri uygulandı. Manuel terapi ile diz mobilizasyonu yapıldı. Hasta bağımsız yürüyebiliyor.',
      homeExercises: ['Merdiven çıkma (2x10 basamak)', 'Tek ayak dengesi (3x30sn)', 'Hamstring curl (3x12)'],
      nextNotes: 'Rehabilitasyon programı son aşamada. Kontrol seansı planlanıyor.',
    },
    s8: {
      summary: 'Propriosepsiyon egzersizleri uygulandı. Denge tahtası kullanıldı. ACL rehabilitasyonu iyi ilerliyor.',
      homeExercises: ['Tek ayak dengesi (3x45sn)', 'Lateral step-up (3x10)', 'Hamstring curl (3x15)'],
      nextNotes: 'Koşu programına geçiş değerlendirilecek.',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('sessionSummaries.title', language)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('sessionSummaries.subtitle', language)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{mySessions.length}</p>
              <p className="text-xs text-text-secondary">{t('sessionSummaries.completed', language)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
              <TrendingDown className="h-5 w-5 text-health-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{totalPainReduction}</p>
              <p className="text-xs text-text-secondary">{t('sessionSummaries.painReduction', language)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
              <Activity className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{avgPainBefore}</p>
              <p className="text-xs text-text-secondary">{t('sessionSummaries.avgPainBefore', language)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
              <Activity className="h-5 w-5 text-health-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{avgPainAfter}</p>
              <p className="text-xs text-text-secondary">{t('sessionSummaries.avgPainAfter', language)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Session List */}
      {mySessions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary">
              {t('sessionSummaries.noSessions', language)}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {mySessions.map((session, idx) => {
            const extra = sessionSummaries[session.id];
            const painDiff = session.painLevelBefore - session.painLevelAfter;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card>
                  {/* Session Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <span className="text-lg font-bold text-primary">#{mySessions.length - idx}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-main capitalize">{formatDate(session.date)}</p>
                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(session.date)} - {session.duration} dk
                          <span className="mx-1">|</span>
                          <Stethoscope className="h-3 w-3" />
                          {session.therapistName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center px-3 py-1 rounded-lg bg-danger/10">
                        <p className="text-xs text-text-secondary">{t('sessionSummaries.before', language)}</p>
                        <p className="text-lg font-bold text-danger">{session.painLevelBefore}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-secondary" />
                      <div className="text-center px-3 py-1 rounded-lg bg-health-green/10">
                        <p className="text-xs text-text-secondary">{t('sessionSummaries.after', language)}</p>
                        <p className="text-lg font-bold text-health-green">{session.painLevelAfter}</p>
                      </div>
                      {painDiff > 0 && (
                        <Badge variant="success">-{painDiff}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Applied Techniques */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {session.applications.map((app) => (
                      <Badge key={app} variant="info">{app}</Badge>
                    ))}
                  </div>

                  {/* Doctor Summary */}
                  {extra ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-background/50 p-4">
                        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                          {t('sessionSummaries.doctorSummary', language)}
                        </p>
                        <p className="text-sm text-text-main leading-relaxed">{extra.summary}</p>
                      </div>

                      <div className="rounded-xl border border-health-green/20 bg-health-green/5 p-4">
                        <p className="text-[11px] font-semibold text-health-green uppercase tracking-wider mb-2">
                          {t('sessionSummaries.homeExercises', language)}
                        </p>
                        <ul className="space-y-1.5">
                          {extra.homeExercises.map((ex, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-text-main">
                              <span className="h-1.5 w-1.5 rounded-full bg-health-green shrink-0" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">
                          {t('sessionSummaries.nextSessionNotes', language)}
                        </p>
                        <p className="text-sm text-text-main">{extra.nextNotes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-background/50 p-4">
                      <p className="text-sm text-text-main">{session.notes || t('sessionSummaries.noNotes', language)}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
