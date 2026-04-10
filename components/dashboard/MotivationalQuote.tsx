'use client';

import { useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import { MOTIVATIONAL_QUOTES } from '@/lib/constants';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const INITIAL_INDEX = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);

export default function MotivationalQuote() {
  const language = useStore((s) => s.language);
  const [quoteIndex, setQuoteIndex] = useState(INITIAL_INDEX);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-health-green/5 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5" />
      <div className="absolute -left-2 -bottom-2 h-14 w-14 rounded-full bg-health-green/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-green/10">
              <Heart className="h-4 w-4 text-health-green" />
            </div>
            <h3 className="text-sm font-semibold text-text-main">{t('dashboard.quoteOfDay', language)}</h3>
          </div>
          <button
            onClick={nextQuote}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-main transition-colors"
            title={t('dashboard.anotherQuote', language)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm italic text-text-secondary leading-relaxed pl-1 border-l-2 border-health-green/30 ml-1">
          &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
        </p>
      </div>
    </Card>
  );
}
