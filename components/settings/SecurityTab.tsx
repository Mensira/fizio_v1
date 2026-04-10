'use client';

import { useState } from 'react';
import { Shield, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';

export default function SecurityTab({ language }: { language: 'tr' | 'en' }) {
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const canSave = currentPw.length > 0 && newPw.length >= 6 && newPw === confirmPw;

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
          <Shield className="h-5 w-5 text-danger" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-main">{tr ? 'Güvenlik Ayarları' : 'Security Settings'}</h3>
          <p className="text-xs text-text-secondary">{tr ? 'Şifre ve hesap güvenliği' : 'Password and account security'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-text-secondary" />
          {tr ? 'Şifre Değiştir' : 'Change Password'}
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main">{tr ? 'Mevcut Şifre' : 'Current Password'}</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main">{tr ? 'Yeni Şifre' : 'New Password'}</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder={tr ? 'En az 6 karakter' : 'At least 6 characters'}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPw.length > 0 && newPw.length < 6 && (
            <p className="text-xs text-danger">{tr ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters'}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main">{tr ? 'Yeni Şifre (Tekrar)' : 'Confirm New Password'}</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="••••••••"
          />
          {confirmPw.length > 0 && newPw !== confirmPw && (
            <p className="text-xs text-danger">{tr ? 'Şifreler eşleşmiyor' : 'Passwords do not match'}</p>
          )}
        </div>

        <Button
          type="button"
          icon={Lock}
          disabled={!canSave}
          onClick={() => {
            setCurrentPw('');
            setNewPw('');
            setConfirmPw('');
            showToast(tr ? 'Şifreniz başarıyla değiştirildi.' : 'Password changed successfully.');
          }}
        >
          {tr ? 'Şifreyi Değiştir' : 'Change Password'}
        </Button>
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs font-semibold text-text-main mb-3">{tr ? 'Oturum Bilgileri' : 'Session Info'}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-background p-3">
            <span className="text-xs text-text-secondary">{tr ? 'Son Giriş' : 'Last Login'}</span>
            <span className="text-xs font-medium text-text-main">
              {new Date().toLocaleDateString(tr ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-background p-3">
            <span className="text-xs text-text-secondary">{tr ? 'Cihaz' : 'Device'}</span>
            <span className="text-xs font-medium text-text-main">Windows - Chrome</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-background p-3">
            <span className="text-xs text-text-secondary">{tr ? 'IP Adresi' : 'IP Address'}</span>
            <span className="text-xs font-medium text-text-main">192.168.1.***</span>
          </div>
        </div>
      </div>
    </>
  );
}
