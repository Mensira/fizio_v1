'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  FolderOpen, FileText, Image, FlaskConical, Pill, Download,
  Search, Calendar, Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DocType = 'all' | 'mr' | 'xray' | 'lab' | 'prescription' | 'report';

interface PatientDocument {
  id: string;
  title: string;
  type: 'mr' | 'xray' | 'lab' | 'prescription' | 'report';
  date: string;
  description: string;
  uploadedBy: string;
  fileSize: string;
}

const MOCK_DOCUMENTS: Record<string, PatientDocument[]> = {
  p1: [
    { id: 'd1', title: 'Lomber MR Görüntüleme', type: 'mr', date: '2024-01-10', description: 'L4-L5 disk hernisi tespit edildi. Posterior disk protrüzyonu mevcut.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '15.2 MB' },
    { id: 'd2', title: 'Lomber Röntgen (AP/Lateral)', type: 'xray', date: '2024-01-10', description: 'Lomber lordoz azalmış. Disk mesafelerinde daralma.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '3.4 MB' },
    { id: 'd3', title: 'Kan Tahlili Sonuçları', type: 'lab', date: '2024-01-12', description: 'Tam kan sayımı, CRP, sedimentasyon. Tüm değerler normal sınırlarda.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '245 KB' },
    { id: 'd4', title: 'Fizik Tedavi Reçetesi', type: 'prescription', date: '2024-01-15', description: '10 seans fizik tedavi. TENS, ultrason, manuel terapi.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '120 KB' },
    { id: 'd5', title: 'Tedavi İlerleme Raporu (1. Ay)', type: 'report', date: '2024-02-15', description: 'Ağrı seviyesi 8/10\'dan 5/10\'a düştü. ROM artışı gözlemlendi. Tedaviye devam önerilir.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '340 KB' },
    { id: 'd6', title: 'Kontrol MR Görüntüleme', type: 'mr', date: '2024-03-01', description: 'Disk protrüzyonunda gerileme gözlemlendi. Tedavi yanıtı olumlu.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '14.8 MB' },
    { id: 'd7', title: 'İlaç Raporu', type: 'prescription', date: '2024-02-01', description: 'Ibuprofen 400mg (günde 2), Vitamin D 1000IU (günde 1), Magnezyum 200mg (günde 1).', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '95 KB' },
    { id: 'd8', title: 'Tedavi İlerleme Raporu (2. Ay)', type: 'report', date: '2024-03-15', description: 'Ağrı 3/10 seviyesine indi. Kor stabilitesi belirgin şekilde arttı. Spora dönüş planlanıyor.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '410 KB' },
  ],
  p2: [
    { id: 'd9', title: 'Omuz MR Görüntüleme', type: 'mr', date: '2024-02-05', description: 'Sağ omuz supraspinatus tendonu sıkışması. Subakromial bursit.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '12.1 MB' },
    { id: 'd10', title: 'Omuz Röntgen', type: 'xray', date: '2024-02-05', description: 'Akromion tipi II. Subakromial mesafe daralmış.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '2.8 MB' },
    { id: 'd11', title: 'Fizik Tedavi Reçetesi', type: 'prescription', date: '2024-02-10', description: '12 seans fizik tedavi. Manuel terapi, buz, egzersiz.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '110 KB' },
  ],
  p3: [
    { id: 'd12', title: 'Diz MR Görüntüleme', type: 'mr', date: '2024-01-20', description: 'Sol diz medial menisküs yırtığı. Artroskopi sonrası kontrol.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '13.5 MB' },
    { id: 'd13', title: 'Ameliyat Raporu', type: 'report', date: '2024-01-22', description: 'Artroskopik menisküs tamiri başarıyla tamamlandı.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '520 KB' },
    { id: 'd14', title: 'Postoperatif Kontrol', type: 'lab', date: '2024-02-01', description: 'CRP normal, enfeksiyon bulgusu yok. Yara iyileşmesi iyi.', uploadedBy: 'Fzt.Dr. Ceydanur Congaz', fileSize: '180 KB' },
  ],
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  mr: { label: 'MR Görüntü', icon: Image, color: 'text-primary', bg: 'bg-primary/10' },
  xray: { label: 'Röntgen', icon: Image, color: 'text-info', bg: 'bg-info/10' },
  lab: { label: 'Laboratuvar', icon: FlaskConical, color: 'text-health-green', bg: 'bg-health-green/10' },
  prescription: { label: 'Reçete', icon: Pill, color: 'text-warning', bg: 'bg-warning/10' },
  report: { label: 'Rapor', icon: FileText, color: 'text-danger', bg: 'bg-danger/10' },
};

const FILTER_OPTIONS: { value: DocType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'mr', label: 'MR Görüntü' },
  { value: 'xray', label: 'Röntgen' },
  { value: 'lab', label: 'Laboratuvar' },
  { value: 'prescription', label: 'Reçete' },
  { value: 'report', label: 'Rapor' },
];

export default function BelgelerimPage() {
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const language = useStore((s) => s.language);
  const showToast = useStore((s) => s.showToast);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocType>('all');
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);

  const documents = useMemo(() => {
    const docs = MOCK_DOCUMENTS[loggedInPatientId || ''] || [];
    return docs
      .filter((d) => typeFilter === 'all' || d.type === typeFilter)
      .filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [loggedInPatientId, typeFilter, search]);

  const typeCounts = useMemo(() => {
    const docs = MOCK_DOCUMENTS[loggedInPatientId || ''] || [];
    const counts: Record<string, number> = { all: docs.length };
    docs.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });
    return counts;
  }, [loggedInPatientId]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { // locale kept intentional
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('documents.title', language)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('documents.subtitle', language)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FILTER_OPTIONS.map((opt) => {
          const cfg = opt.value !== 'all' ? TYPE_CONFIG[opt.value] : null;
          const Icon = cfg?.icon || FolderOpen;
          return (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                typeFilter === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/50 bg-card hover:border-primary/30'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${cfg?.color || 'text-primary'}`} />
              <p className="text-lg font-bold text-text-main">{typeCounts[opt.value] || 0}</p>
              <p className="text-[11px] text-text-secondary">{opt.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          placeholder={t('documents.searchPlaceholder', language)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary">
              {t('documents.notFound', language)}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {documents.map((doc, idx) => {
              const cfg = TYPE_CONFIG[doc.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                        <Icon className={`h-6 w-6 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-text-main">{doc.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="info">{cfg.label}</Badge>
                              <span className="flex items-center gap-1 text-xs text-text-secondary">
                                <Calendar className="h-3 w-3" />
                                {formatDate(doc.date)}
                              </span>
                              <span className="text-xs text-text-secondary">{doc.fileSize}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="rounded-lg p-2 text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                              title={t('common.preview', language)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => showToast(t('documents.uploading', language))}
                              className="rounded-lg p-2 text-text-secondary hover:bg-health-green/10 hover:text-health-green transition-colors"
                              title={t('common.download', language)}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary mt-2 leading-relaxed">{doc.description}</p>
                        <p className="text-[11px] text-text-secondary mt-1.5 opacity-70">
                          {t('documents.uploadedBy', language)}: {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewDoc(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-1.5 ${TYPE_CONFIG[previewDoc.type].bg.replace('/10', '')}`} style={{ backgroundColor: previewDoc.type === 'mr' ? '#2F80ED' : previewDoc.type === 'xray' ? '#3498DB' : previewDoc.type === 'lab' ? '#27AE60' : previewDoc.type === 'prescription' ? '#F39C12' : '#E74C3C' }} />
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TYPE_CONFIG[previewDoc.type].bg}`}>
                    {(() => { const I = TYPE_CONFIG[previewDoc.type].icon; return <I className={`h-5 w-5 ${TYPE_CONFIG[previewDoc.type].color}`} />; })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-text-main">{previewDoc.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info">{TYPE_CONFIG[previewDoc.type].label}</Badge>
                      <span className="text-xs text-text-secondary">{formatDate(previewDoc.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-sm text-text-main leading-relaxed">{previewDoc.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider mb-1">
                      {t('documents.fileSize', language)}
                    </p>
                    <p className="font-medium text-text-main">{previewDoc.fileSize}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider mb-1">
                      {t('documents.uploadedBy2', language)}
                    </p>
                    <p className="font-medium text-text-main">{previewDoc.uploadedBy}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-background border border-border text-text-main hover:bg-background/80 transition-colors"
                  >
                    {t('documents.close', language)}
                  </button>
                  <button
                    onClick={() => { showToast(t('documents.downloading', language)); setPreviewDoc(null); }}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t('common.download', language)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
