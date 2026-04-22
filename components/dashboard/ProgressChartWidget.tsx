'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { progressRecords } from '@/lib/mock-data';
import { formatShortDate } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function ProgressChartWidget() {
  const language = useStore((s) => s.language);
  const storePatients = useStore((s) => s.patients);

  const patientsWithProgress = storePatients.filter((p) =>
    progressRecords.some((r) => r.patientId === p.id)
  );

  const [selectedPatient, setSelectedPatient] = useState(patientsWithProgress[0]?.id || '');

  const effectivePatient = selectedPatient || patientsWithProgress[0]?.id || '';

  const patientInfo = storePatients.find((p) => p.id === effectivePatient);

  const data = progressRecords
    .filter((r) => r.patientId === effectivePatient)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: formatShortDate(r.date),
      rom: r.rangeOfMotion,
    }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-main">{t('dashboard.progressChart', language)}</h3>
      </div>
      <div className="mb-3">
        <Select
          value={effectivePatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          options={patientsWithProgress.map((p) => ({
            value: p.id,
            label: `${p.firstName} ${p.lastName}`,
          }))}
        />
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-text-secondary text-center py-6">
          {language === 'tr' ? 'İlerleme kaydı bulunamadı.' : 'No progress records found.'}
        </p>
      ) : (
        <>
          <p className="text-xs text-text-secondary mb-3">
            {patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : ''} - {t('progress.rom', language)}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27AE60" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#636E72' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="rom" stroke="#27AE60" fill="url(#colorRom)" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#27AE60', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}
