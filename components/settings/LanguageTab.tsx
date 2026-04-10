'use client';

import { Globe } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function LanguageTab({ language }: { language: 'tr' | 'en' }) {
  const setLanguage = useStore((s) => s.setLanguage);

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-main">{t('settings.languageTitle', language)}</h3>
          <p className="text-xs text-text-secondary">{t('settings.languageDesc', language)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            language === 'tr' ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-background'
          }`}
          onClick={() => setLanguage('tr')}
        >
          <input type="radio" checked={language === 'tr'} readOnly className="accent-primary" />
          <div>
            <p className="text-sm font-medium text-text-main">{t('settings.turkish', language)}</p>
            <p className="text-xs text-text-secondary">Türkçe</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            language === 'en' ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-background'
          }`}
          onClick={() => setLanguage('en')}
        >
          <input type="radio" checked={language === 'en'} readOnly className="accent-primary" />
          <div>
            <p className="text-sm font-medium text-text-main">{t('settings.english', language)}</p>
            <p className="text-xs text-text-secondary">English</p>
          </div>
        </div>
      </div>
    </>
  );
}
