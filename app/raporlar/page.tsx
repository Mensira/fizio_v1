'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, Wallet, Activity, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const MONTH_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RaporlarPage() {
  const language = useStore((s) => s.language);
  const allPayments = useStore((s) => s.payments);
  const allSessions = useStore((s) => s.sessions);
  const patients = useStore((s) => s.patients);
  const treatmentPlans = useStore((s) => s.treatmentPlans);
  const tr = language === 'tr';
  const monthLabels = tr ? MONTH_TR : MONTH_EN;

  // ─── Summary Stats ───
  const totalRevenue = useMemo(
    () => allPayments.filter((p) => p.status === 'Odendi').reduce((s, p) => s + p.amount, 0),
    [allPayments],
  );
  const totalPatients = patients.length;
  const activePlans = treatmentPlans.filter((tp) => tp.status === 'Aktif').length;
  const completedSessions = allSessions.filter((s) => s.completed).length;

  // ─── Monthly Revenue (last 6 months) ───
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const revenue = allPayments
        .filter((p) => {
          const pd = new Date(p.date);
          return pd.getFullYear() === year && pd.getMonth() === month && p.status === 'Odendi';
        })
        .reduce((s, p) => s + p.amount, 0);
      return { name: monthLabels[month], gelir: revenue };
    });
  }, [allPayments, monthLabels]);

  // ─── Key Metrics List ───
  const completionRate =
    allSessions.length > 0 ? Math.round((completedSessions / allSessions.length) * 100) : 0;
  const totalPending = useMemo(
    () => allPayments.filter((p) => p.status === 'Bekliyor').reduce((s, p) => s + p.amount, 0),
    [allPayments],
  );
  const avgPayment = useMemo(() => {
    const paid = allPayments.filter((p) => p.status === 'Odendi');
    return paid.length > 0 ? totalRevenue / paid.length : 0;
  }, [allPayments, totalRevenue]);

  const metrics = [
    {
      label: tr ? 'Seans Tamamlama Oranı' : 'Session Completion Rate',
      value: `%${completionRate}`,
      badge: completionRate >= 80 ? ('success' as const) : ('warning' as const),
      badgeLabel: completionRate >= 80 ? (tr ? 'İyi' : 'Good') : (tr ? 'Orta' : 'Fair'),
    },
    {
      label: tr ? 'Bekleyen Tahsilat' : 'Pending Collection',
      value: formatCurrency(totalPending),
      badge: 'warning' as const,
      badgeLabel: tr ? 'Bekliyor' : 'Pending',
    },
    {
      label: tr ? 'Ortalama Ödeme' : 'Average Payment',
      value: formatCurrency(avgPayment),
      badge: 'info' as const,
      badgeLabel: tr ? 'Ort.' : 'Avg',
    },
    {
      label: tr ? 'Toplam Seans' : 'Total Sessions',
      value: `${completedSessions} / ${allSessions.length}`,
      badge: 'default' as const,
      badgeLabel: tr ? 'Tamamlandı' : 'Completed',
    },
    {
      label: tr ? 'Aktif Tedavi Planı' : 'Active Treatment Plans',
      value: String(activePlans),
      badge: 'success' as const,
      badgeLabel: tr ? 'Aktif' : 'Active',
    },
    {
      label: tr ? 'Toplam Hasta' : 'Total Patients',
      value: String(totalPatients),
      badge: 'info' as const,
      badgeLabel: tr ? 'Kayıtlı' : 'Registered',
    },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-main">{t('reports.title', language)}</h2>
        <p className="text-sm text-text-secondary">{t('reports.subtitle', language)}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={tr ? 'Toplam Hasta' : 'Total Patients'}
          value={totalPatients}
          icon={Users}
          iconBgColor="bg-primary/10"
        />
        <StatCard
          title={t('reports.totalRevenue', language)}
          value={formatCurrency(totalRevenue)}
          icon={Wallet}
          iconBgColor="bg-health-green/10"
        />
        <StatCard
          title={t('reports.activePlans', language)}
          value={activePlans}
          icon={Target}
          iconBgColor="bg-warning/10"
        />
        <StatCard
          title={tr ? 'Tamamlanan Seans' : 'Completed Sessions'}
          value={completedSessions}
          icon={Activity}
          iconBgColor="bg-info/10"
        />
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-health-green" />
          <h3 className="text-sm font-semibold text-text-main">
            {tr ? 'Aylık Gelir Trendi (Son 6 Ay)' : 'Monthly Revenue Trend (Last 6 Months)'}
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatCurrency(value as number), t('reports.revenue', language)]}
              />
              <Bar dataKey="gelir" fill="#27AE60" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key Metrics Table */}
      <Card>
        <h3 className="text-sm font-semibold text-text-main mb-4">
          {tr ? 'Özet Metrikler' : 'Key Metrics'}
        </h3>
        <div className="divide-y divide-border/50">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between py-3">
              <p className="text-sm text-text-secondary">{m.label}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-main">{m.value}</span>
                <Badge variant={m.badge}>{m.badgeLabel}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
