'use client';

import { useState, useMemo } from 'react';
import {
  CreditCard, Banknote, ArrowUpDown,
  AlertCircle, CheckCircle, XCircle, Clock,
  Receipt, Shield, ChevronRight, ChevronLeft, Lock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/lib/store';
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

type PayStep = 'method' | 'details' | 'confirm';

export default function PatientPaymentView() {
  const payments = useStore((s) => s.payments);
  const completePayment = useStore((s) => s.completePayment);
  const requestCashPayment = useStore((s) => s.requestCashPayment);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const language = useStore((s) => s.language);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [payStep, setPayStep] = useState<PayStep>('method');
  const [payMethod, setPayMethod] = useState<Payment['method']>('Kredi Karti');
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [transferForm, setTransferForm] = useState({ senderName: '', iban: '', reference: '' });

  const myPayments = useMemo(() => {
    return payments
      .filter((p) => p.patientId === loggedInPatientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, loggedInPatientId]);

  const pendingPayments = myPayments.filter((p) => p.status === 'Bekliyor');
  const cashAwaitingPayments = myPayments.filter((p) => p.status === 'NakitOnayBekliyor');
  const paidPayments = myPayments.filter((p) => p.status === 'Odendi');
  const totalPaid = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0);

  const selectedPayment = payments.find((p) => p.id === selectedPaymentId);

  const resetModal = () => {
    setPayModalOpen(false);
    setSelectedPaymentId(null);
    setPayStep('method');
    setPayMethod('Kredi Karti');
    setCardForm({ name: '', number: '', expiry: '', cvv: '' });
    setTransferForm({ senderName: '', iban: '', reference: '' });
  };

  const handlePay = () => {
    if (!selectedPaymentId) return;
    if (payMethod === 'Nakit') {
      requestCashPayment(selectedPaymentId);
      showToast(tr ? 'Nakit ödeme talebiniz doktora iletildi. Onay bekleniyor.' : 'Cash payment request sent to doctor. Awaiting approval.');
    } else {
      completePayment(selectedPaymentId, payMethod);
      showToast(tr ? 'Ödeme başarıyla tamamlandı!' : 'Payment completed successfully!');
    }
    resetModal();
  };

  const openPayModal = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setPayStep('method');
    setPayMethod('Kredi Karti');
    setCardForm({ name: '', number: '', expiry: '', cvv: '' });
    setTransferForm({ senderName: '', iban: '', reference: '' });
    setPayModalOpen(true);
  };

  const canProceedToConfirm = () => {
    if (payMethod === 'Kredi Karti') {
      return cardForm.name.trim() && cardForm.number.replace(/\s/g, '').length >= 16 && cardForm.expiry.length >= 5 && cardForm.cvv.length >= 3;
    }
    if (payMethod === 'Havale') {
      return transferForm.senderName.trim() && transferForm.iban.trim().length >= 10;
    }
    return true;
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const maskedCard = cardForm.number.replace(/\s/g, '').length >= 4
    ? `**** **** **** ${cardForm.number.replace(/\s/g, '').slice(-4)}`
    : '';

  const methodLabel = (m: Payment['method']) => {
    if (m === 'Kredi Karti') return tr ? 'Kredi Kartı' : 'Credit Card';
    if (m === 'Havale') return tr ? 'Havale/EFT' : 'Bank Transfer';
    return tr ? 'Nakit' : 'Cash';
  };

  return (
    <div className="space-y-3 lg:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-main">{tr ? 'Ödemelerim' : 'My Payments'}</h2>
        <p className="text-sm text-text-secondary">{tr ? 'Ödeme geçmişiniz ve bekleyen ödemeleriniz' : 'Your payment history and pending payments'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{tr ? 'Bekleyen Ödeme' : 'Pending'}</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(totalPending)}</p>
              <p className="text-[10px] text-text-secondary">{pendingPayments.length} {tr ? 'adet' : 'items'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-green/10">
              <CheckCircle className="h-5 w-5 text-health-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{tr ? 'Toplam Ödenen' : 'Total Paid'}</p>
              <p className="text-xl font-bold text-health-green">{formatCurrency(totalPaid)}</p>
              <p className="text-[10px] text-text-secondary">{paidPayments.length} {tr ? 'ödeme' : 'payments'}</p>
            </div>
          </div>
        </Card>
      </div>

      {cashAwaitingPayments.length > 0 && (
        <Card padding={false}>
          <div className="px-5 py-3 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">
                {tr ? 'Doktor Onayı Bekleniyor' : 'Awaiting Doctor Approval'}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {cashAwaitingPayments.map((payment) => (
              <div key={payment.id} className="px-3 lg:px-5 py-3 lg:py-4">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">{payment.description}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pl-12 lg:pl-14">
                  <p className="text-sm lg:text-lg font-bold text-primary">{formatCurrency(payment.amount)}</p>
                  <Badge variant="default">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tr ? 'Onay Bekliyor' : 'Pending'}
                    </span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pendingPayments.length > 0 && (
        <Card padding={false}>
          <div className="px-5 py-3 bg-warning/5 border-b border-warning/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-warning">
                {tr ? 'Bekleyen Ödemeler' : 'Pending Payments'}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="px-3 lg:px-5 py-3 lg:py-4">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 shrink-0">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">{payment.description}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pl-12 lg:pl-14">
                  <p className="text-sm lg:text-lg font-bold text-warning">{formatCurrency(payment.amount)}</p>
                  <Button size="sm" onClick={() => openPayModal(payment.id)}>
                    {tr ? 'Öde' : 'Pay'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding={false}>
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-main">{tr ? 'Ödeme Geçmişi' : 'Payment History'}</h3>
        </div>
        {myPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <Receipt className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">{tr ? 'Henüz ödeme yok' : 'No payments yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {myPayments.map((payment) => {
              const statusCfg = STATUS_CONFIG[payment.status];
              return (
                <div key={payment.id} className="px-3 lg:px-5 py-2.5 lg:py-3 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background shrink-0">
                      {METHOD_ICONS[payment.method]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">{payment.description}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{formatDate(payment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pl-11 lg:pl-13">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusCfg.variant}>
                        <span className="flex items-center gap-1">
                          {statusCfg.icon}
                          {tr ? statusCfg.label : statusCfg.labelEn}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${payment.status === 'Odendi' ? 'text-health-green' : payment.status === 'Bekliyor' ? 'text-warning' : payment.status === 'NakitOnayBekliyor' ? 'text-primary' : 'text-text-secondary line-through'}`}>
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.status === 'Bekliyor' && (
                        <Button size="sm" onClick={() => openPayModal(payment.id)}>
                          {tr ? 'Öde' : 'Pay'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={payModalOpen}
        onClose={resetModal}
        title={
          payStep === 'method' ? (tr ? 'Ödeme Yöntemi' : 'Payment Method') :
          payStep === 'details' ? (tr ? 'Ödeme Bilgileri' : 'Payment Details') :
          (tr ? 'Ödeme Onayı' : 'Payment Confirmation')
        }
      >
        {selectedPayment && (
          <div className="space-y-5">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {(['method', 'details', 'confirm'] as PayStep[]).map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    payStep === step ? 'bg-primary text-white' :
                    (['method', 'details', 'confirm'].indexOf(payStep) > i) ? 'bg-health-green text-white' :
                    'bg-border/50 text-text-secondary'
                  }`}>
                    {(['method', 'details', 'confirm'].indexOf(payStep) > i) ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded ${(['method', 'details', 'confirm'].indexOf(payStep) > i) ? 'bg-health-green' : 'bg-border/50'}`} />}
                </div>
              ))}
            </div>

            {/* Payment summary */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-main">{selectedPayment.description}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{formatDate(selectedPayment.date)}</p>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(selectedPayment.amount)}</p>
              </div>
            </div>

            {/* Step 1: Method Selection */}
            {payStep === 'method' && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">{tr ? 'Ödeme yönteminizi seçin:' : 'Select your payment method:'}</p>
                {([
                  { value: 'Kredi Karti' as Payment['method'], icon: <CreditCard className="h-5 w-5" />, label: tr ? 'Kredi Kartı' : 'Credit Card', desc: tr ? 'Visa, Mastercard, Troy' : 'Visa, Mastercard, Troy' },
                  { value: 'Havale' as Payment['method'], icon: <ArrowUpDown className="h-5 w-5" />, label: tr ? 'Havale / EFT' : 'Bank Transfer', desc: tr ? 'Banka havalesi ile ödeme' : 'Pay via bank transfer' },
                  { value: 'Nakit' as Payment['method'], icon: <Banknote className="h-5 w-5" />, label: tr ? 'Nakit' : 'Cash', desc: tr ? 'Klinikte nakit ödeme' : 'Pay cash at clinic' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPayMethod(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      payMethod === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/30 hover:bg-background'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${payMethod === opt.value ? 'bg-primary/10 text-primary' : 'bg-background text-text-secondary'}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-main">{opt.label}</p>
                      <p className="text-xs text-text-secondary">{opt.desc}</p>
                    </div>
                    {payMethod === opt.value && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={resetModal}>{t('common.cancel', language)}</Button>
                  <Button icon={ChevronRight} onClick={() => setPayStep(payMethod === 'Nakit' ? 'confirm' : 'details')}>
                    {tr ? 'Devam Et' : 'Continue'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Credit Card Details */}
            {payStep === 'details' && payMethod === 'Kredi Karti' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Kart Üzerindeki İsim' : 'Name on Card'}</label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    placeholder={tr ? 'Ad Soyad' : 'Full Name'}
                    className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Kart Numarası' : 'Card Number'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full rounded-lg border border-border/50 bg-background py-2.5 pl-3 pr-10 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-wider"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Son Kullanma' : 'Expiry'}</label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                      placeholder="AA/YY"
                      maxLength={5}
                      className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{tr ? 'Ödeme bilgileriniz güvenli şekilde işlenir.' : 'Your payment details are processed securely.'}</span>
                </div>
                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="secondary" icon={ChevronLeft} onClick={() => setPayStep('method')}>
                    {tr ? 'Geri' : 'Back'}
                  </Button>
                  <Button icon={ChevronRight} onClick={() => setPayStep('confirm')} disabled={!canProceedToConfirm()}>
                    {tr ? 'Onayla' : 'Review'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Transfer Details */}
            {payStep === 'details' && payMethod === 'Havale' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-1">{tr ? 'Klinik Banka Bilgileri' : 'Clinic Bank Info'}</p>
                  <p className="text-xs text-text-secondary">FizyoPanel Sağlık Hiz. A.Ş.</p>
                  <p className="text-xs text-text-main font-mono mt-1">TR00 0000 0000 0000 0000 0000 00</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Gönderen Ad Soyad' : 'Sender Name'}</label>
                  <input
                    type="text"
                    value={transferForm.senderName}
                    onChange={(e) => setTransferForm({ ...transferForm, senderName: e.target.value })}
                    placeholder={tr ? 'Ad Soyad' : 'Full Name'}
                    className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Gönderen IBAN' : 'Sender IBAN'}</label>
                  <input
                    type="text"
                    value={transferForm.iban}
                    onChange={(e) => setTransferForm({ ...transferForm, iban: e.target.value })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">{tr ? 'Açıklama / Referans' : 'Reference'}</label>
                  <input
                    type="text"
                    value={transferForm.reference}
                    onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })}
                    placeholder={tr ? 'Opsiyonel' : 'Optional'}
                    className="w-full rounded-lg border border-border/50 bg-background py-2.5 px-3 text-sm text-text-main placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="secondary" icon={ChevronLeft} onClick={() => setPayStep('method')}>
                    {tr ? 'Geri' : 'Back'}
                  </Button>
                  <Button icon={ChevronRight} onClick={() => setPayStep('confirm')} disabled={!canProceedToConfirm()}>
                    {tr ? 'Onayla' : 'Review'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {payStep === 'confirm' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 divide-y divide-border/30">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-text-secondary">{tr ? 'Ödeme Yöntemi' : 'Method'}</span>
                    <span className="text-sm font-medium text-text-main">{methodLabel(payMethod)}</span>
                  </div>
                  {payMethod === 'Kredi Karti' && (
                    <>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-text-secondary">{tr ? 'Kart Sahibi' : 'Cardholder'}</span>
                        <span className="text-sm font-medium text-text-main">{cardForm.name}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-text-secondary">{tr ? 'Kart No' : 'Card'}</span>
                        <span className="text-sm font-medium text-text-main font-mono">{maskedCard}</span>
                      </div>
                    </>
                  )}
                  {payMethod === 'Havale' && (
                    <>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-text-secondary">{tr ? 'Gönderen' : 'Sender'}</span>
                        <span className="text-sm font-medium text-text-main">{transferForm.senderName}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-text-secondary">IBAN</span>
                        <span className="text-sm font-medium text-text-main font-mono truncate max-w-[200px]">{transferForm.iban}</span>
                      </div>
                    </>
                  )}
                  {payMethod === 'Nakit' && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-text-secondary">{tr ? 'Nakit ödemenizi klinikte gerçekleştirebilirsiniz.' : 'You can make your cash payment at the clinic.'}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                    <span className="text-sm font-semibold text-text-main">{tr ? 'Toplam Tutar' : 'Total Amount'}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-health-green/5 border border-health-green/20">
                  <Shield className="h-4 w-4 text-health-green shrink-0" />
                  <p className="text-xs text-text-secondary">
                    {tr ? 'Ödeme butonuna basarak ödemeyi onaylıyorsunuz.' : 'By clicking pay, you confirm this payment.'}
                  </p>
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="secondary" icon={ChevronLeft} onClick={() => setPayStep(payMethod === 'Nakit' ? 'method' : 'details')}>
                    {tr ? 'Geri' : 'Back'}
                  </Button>
                  <Button onClick={handlePay} icon={Lock}>
                    {tr ? `${formatCurrency(selectedPayment.amount)} Öde` : `Pay ${formatCurrency(selectedPayment.amount)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
