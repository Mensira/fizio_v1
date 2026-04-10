'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, CreditCard, Banknote, ArrowUpDown,
  TrendingUp, CheckCircle, XCircle, Clock,
  Receipt,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useStore } from '@/lib/store';
import { patients } from '@/lib/mock-data';
import { formatDate, formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Payment } from '@/lib/types';

const METHOD_ICONS: Record<Payment['method'], React.ReactNode> = {
  Nakit: <Banknote className="h-4 w-4 text-health-green" />,
  'Kredi Karti': <CreditCard className="h-4 w-4 text-primary" />,
  Havale: <ArrowUpDown className="h-4 w-4 text-info" />,
};

const STATUS_CONFIG: Record<Payment['status'], { icon: React.ReactNode; variant: 'success' | 'warning' | 'danger' | 'default'; label: string; labelEn: string }> = {
  Odendi: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'success', label: 'Ödendi', labelEn: 'Paid' },
  Bekliyor: { icon: <Clock className="h-3.5 w-3.5" />, variant: 'warning', label: 'Bekliyor', labelEn: 'Pending' },
  NakitOnayBekliyor: { icon: <Clock className="h-3.5 w-3.5" />, variant: 'default', label: 'Onay Bekliyor', labelEn: 'Awaiting Approval' },
  Iptal: { icon: <XCircle className="h-3.5 w-3.5" />, variant: 'danger', label: 'İptal', labelEn: 'Cancelled' },
};

export default function DoctorPaymentView() {
  const payments = useStore((s) => s.payments);
  const addPayment = useStore((s) => s.addPayment);
  const approveCashPayment = useStore((s) => s.approveCashPayment);
  const rejectCashPayment = useStore((s) => s.rejectCashPayment);
  const showToast = useStore((s) => s.showToast);
  const language = useStore((s) => s.language);

  const tr = language === 'tr';

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | Payment['method']>('all');

  const [form, setForm] = useState({
    patientId: patients[0]?.id || '',
    amount: '',
    method: 'Nakit' as Payment['method'],
    status: 'Odendi' as Payment['status'],
    description: '',
  });

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'Odendi');
    const pending = payments.filter((p) => p.status === 'Bekliyor');
    const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
    const totalPending = pending.reduce((s, p) => s + p.amount, 0);

    const now = new Date();
    const thisMonthPaid = paid
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + p.amount, 0);

    return { totalPaid, totalPending, thisMonthPaid, paidCount: paid.length, pendingCount: pending.length };
  }, [payments]);

  const filtered = useMemo(() => {
    let list = [...payments];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.patientName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (methodFilter !== 'all') list = list.filter((p) => p.method === methodFilter);

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return list;
  }, [payments, search, statusFilter, methodFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient || !form.amount) return;

    addPayment({
      id: `pay${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString(),
      amount: parseFloat(form.amount),
      method: form.method,
      status: form.status,
      description: form.description,
    });
    showToast(t('payments.saved', language));
    setModalOpen(false);
    setForm({ patientId: patients[0]?.id || '', amount: '', method: 'Nakit', status: 'Odendi', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">{t('payments.title', language)}</h2>
          <p className="text-sm text-text-secondary">{filtered.length} / {payments.length} {t('payments.count', language)}</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>{t('payments.new', language)}</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
              <CheckCircle className="h-5 w-5 text-health-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{tr ? 'Toplam Ödenen' : 'Total Paid'}</p>
              <p className="text-xl font-bold text-health-green">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-[10px] text-text-secondary">{stats.paidCount} {tr ? 'ödeme' : 'payments'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{tr ? 'Bekleyen' : 'Pending'}</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(stats.totalPending)}</p>
              <p className="text-[10px] text-text-secondary">{stats.pendingCount} {tr ? 'ödeme' : 'payments'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{tr ? 'Bu Ay Gelir' : 'This Month Revenue'}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(stats.thisMonthPaid)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Payment Approvals */}
      {payments.filter((p) => p.status === 'NakitOnayBekliyor').length > 0 && (
        <Card padding={false}>
          <div className="px-5 py-3 bg-warning/5 border-b border-warning/20">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-warning">
                {tr ? 'Nakit Ödeme Onayları' : 'Cash Payment Approvals'}
              </h3>
              <Badge variant="warning">{payments.filter((p) => p.status === 'NakitOnayBekliyor').length}</Badge>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {payments.filter((p) => p.status === 'NakitOnayBekliyor').map((payment) => (
              <div key={payment.id} className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 shrink-0">
                  <Banknote className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-main">{payment.patientName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{payment.description} · {formatDate(payment.date)}</p>
                </div>
                <p className="text-lg font-bold text-warning shrink-0">{formatCurrency(payment.amount)}</p>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      approveCashPayment(payment.id);
                      showToast(tr ? 'Nakit ödeme onaylandı.' : 'Cash payment approved.');
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {tr ? 'Alındı' : 'Received'}
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      rejectCashPayment(payment.id);
                      showToast(tr ? 'Nakit ödeme reddedildi.' : 'Cash payment rejected.');
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {tr ? 'Alınmadı' : 'Not Received'}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr ? 'Hasta veya açıklama ara...' : 'Search patient or description...'}
              className="w-full rounded-lg border border-border/50 bg-background py-2 pl-9 pr-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">{tr ? 'Tüm Durumlar' : 'All Status'}</option>
              <option value="Odendi">{tr ? 'Ödendi' : 'Paid'}</option>
              <option value="Bekliyor">{tr ? 'Bekliyor' : 'Pending'}</option>
              <option value="NakitOnayBekliyor">{tr ? 'Onay Bekliyor' : 'Awaiting Approval'}</option>
              <option value="Iptal">{tr ? 'İptal' : 'Cancelled'}</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)} className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">{tr ? 'Tüm Yöntemler' : 'All Methods'}</option>
              <option value="Nakit">{tr ? 'Nakit' : 'Cash'}</option>
              <option value="Kredi Karti">{tr ? 'Kredi Kartı' : 'Credit Card'}</option>
              <option value="Havale">{tr ? 'Havale/EFT' : 'Transfer'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payment List */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <Receipt className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">{tr ? 'Ödeme bulunamadı' : 'No payments found'}</p>
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-border/30">
            {filtered.map((payment) => {
              const statusCfg = STATUS_CONFIG[payment.status];
              return (
                <div key={payment.id} className="flex items-center gap-4 px-5 py-3 hover:bg-background/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background shrink-0">
                    {METHOD_ICONS[payment.method]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-main truncate">{payment.patientName}</p>
                      <Badge variant={statusCfg.variant}>
                        <span className="flex items-center gap-1">
                          {statusCfg.icon}
                          {tr ? statusCfg.label : statusCfg.labelEn}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-text-secondary">
                      <span>{formatDate(payment.date)}</span>
                      {payment.description && (
                        <>
                          <span className="text-border">·</span>
                          <span className="truncate">{payment.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block shrink-0">
                    <Badge variant="default">
                      {payment.method === 'Kredi Karti' ? (tr ? 'Kredi Kartı' : 'Credit Card') : payment.method === 'Havale' ? (tr ? 'Havale' : 'Transfer') : (tr ? 'Nakit' : 'Cash')}
                    </Badge>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${payment.status === 'Odendi' ? 'text-health-green' : payment.status === 'Bekliyor' ? 'text-warning' : payment.status === 'NakitOnayBekliyor' ? 'text-primary' : 'text-text-secondary line-through'}`}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('payments.new', language)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label={t('sessions.patient', language)}
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            options={patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
          />
          <Input label={t('payments.amountTL', language)} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('payments.methodSelect', language)}
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value as Payment['method'] })}
              options={[
                { value: 'Nakit', label: t('payments.cash', language) },
                { value: 'Kredi Karti', label: t('payments.creditCard', language) },
                { value: 'Havale', label: t('payments.transfer', language) },
              ]}
            />
            <Select
              label={tr ? 'Durum' : 'Status'}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Payment['status'] })}
              options={[
                { value: 'Odendi', label: tr ? 'Ödendi' : 'Paid' },
                { value: 'Bekliyor', label: tr ? 'Bekliyor' : 'Pending' },
              ]}
            />
          </div>
          <Input label={t('payments.description', language)} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={tr ? 'Ödeme açıklaması...' : 'Payment description...'} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>{t('common.cancel', language)}</Button>
            <Button type="submit">{t('payments.saveButton', language)}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
