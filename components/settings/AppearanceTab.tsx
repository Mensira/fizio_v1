'use client';

import { useState } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/lib/store';

export default function AppearanceTab({ language }: { language: 'tr' | 'en' }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const fontSize = useStore((s) => s.fontSize);
  const setFontSize = useStore((s) => s.setFontSize);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';
  const [prefs, setPrefs] = useState({ animations: true, compact: false, sounds: true });

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-main">{tr ? 'Görünüm Ayarları' : 'Appearance Settings'}</h3>
          <p className="text-xs text-text-secondary">{tr ? 'Tema ve görünüm tercihlerinizi ayarlayın' : 'Customize theme and appearance preferences'}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-text-main mb-3">{tr ? 'Tema Seçimi' : 'Theme Selection'}</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Light theme preview */}
          <div
            className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
              theme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/30'
            }`}
            onClick={() => { setTheme('light'); showToast(tr ? 'Açık tema uygulandı.' : 'Light theme applied.'); }}
          >
            <div className="rounded-lg bg-[#F5F7FA] p-3 mb-3">
              <div className="flex gap-2 mb-2">
                <div className="h-2 w-12 rounded bg-[#2F80ED]" />
                <div className="h-2 w-8 rounded bg-[#E2E8F0]" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-full rounded bg-white border border-[#E2E8F0]" />
                <div className="h-8 w-full rounded bg-white border border-[#E2E8F0]" />
              </div>
              <div className="h-3 w-20 rounded bg-[#E2E8F0] mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-primary' : 'text-text-secondary'}`} />
              <span className="text-sm font-medium text-text-main">{tr ? 'Açık Tema' : 'Light Theme'}</span>
              {theme === 'light' && <Badge variant="info" className="ml-auto">{tr ? 'Aktif' : 'Active'}</Badge>}
            </div>
          </div>

          {/* Dark theme preview */}
          <div
            className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
              theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/30'
            }`}
            onClick={() => { setTheme('dark'); showToast(tr ? 'Koyu tema uygulandı.' : 'Dark theme applied.'); }}
          >
            <div className="rounded-lg bg-[#1A1D23] p-3 mb-3">
              <div className="flex gap-2 mb-2">
                <div className="h-2 w-12 rounded bg-[#2F80ED]" />
                <div className="h-2 w-8 rounded bg-[#333842]" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-full rounded bg-[#23272F] border border-[#333842]" />
                <div className="h-8 w-full rounded bg-[#23272F] border border-[#333842]" />
              </div>
              <div className="h-3 w-20 rounded bg-[#333842] mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-text-secondary'}`} />
              <span className="text-sm font-medium text-text-main">{tr ? 'Koyu Tema' : 'Dark Theme'}</span>
              {theme === 'dark' && <Badge variant="info" className="ml-auto">{tr ? 'Aktif' : 'Active'}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs font-semibold text-text-main mb-3">{tr ? 'Arayüz Tercihleri' : 'Interface Preferences'}</p>
        <div className="space-y-3">
          {[
            { key: 'animations' as const, label: tr ? 'Animasyonları Göster' : 'Show Animations', desc: tr ? 'Sayfa geçişleri ve modal animasyonları' : 'Page transitions and modal animations' },
            { key: 'compact' as const, label: tr ? 'Kompakt Görünüm' : 'Compact View', desc: tr ? 'Daha sıkışık düzen, daha fazla içerik' : 'Tighter layout, more content' },
            { key: 'sounds' as const, label: tr ? 'Bildirim Sesleri' : 'Notification Sounds', desc: tr ? 'Bildirim geldiğinde ses çal' : 'Play sound on notifications' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium text-text-main">{item.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                  prefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs font-semibold text-text-main mb-3">{tr ? 'Yazı Boyutu' : 'Font Size'}</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'small' as const, label: tr ? 'Küçük' : 'Small', size: 'text-xs' },
            { key: 'normal' as const, label: tr ? 'Normal' : 'Normal', size: 'text-sm' },
            { key: 'large' as const, label: tr ? 'Büyük' : 'Large', size: 'text-base' },
          ]).map((item) => (
            <div
              key={item.key}
              onClick={() => { setFontSize(item.key); showToast(tr ? `Yazı boyutu: ${item.label}` : `Font size: ${item.label}`); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                fontSize === item.key ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'
              }`}
            >
              <span className={`font-medium text-text-main ${item.size}`}>Aa</span>
              <span className="text-[10px] text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
