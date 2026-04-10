import type { ChatMessage } from '@/lib/store';

export function timeAgo(date: string, tr: boolean): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return tr ? 'az önce' : 'just now';
  if (diffMin < 60) return tr ? `${diffMin} dk` : `${diffMin}m`;
  if (diffHour < 24) return tr ? `${diffHour} saat` : `${diffHour}h`;
  if (diffDay === 1) return tr ? 'dün' : 'yesterday';
  if (diffDay < 7) return tr ? `${diffDay} gün` : `${diffDay}d`;
  return new Date(date).toLocaleDateString(tr ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' });
}

export function formatDateLabel(dateStr: string, tr: boolean): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return tr ? 'Bugün' : 'Today';
  if (date.toDateString() === yesterday.toDateString()) return tr ? 'Dün' : 'Yesterday';
  return date.toLocaleDateString(tr ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' });
}

export function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: { label: string; dateStr: string; messages: ChatMessage[] }[] = [];
  let currentLabel = '';

  for (const msg of messages) {
    const label = new Date(msg.date).toDateString();
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, dateStr: msg.date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

export const QUICK_REPLIES_TR = [
  'Teşekkürler', 'Anladım', 'Ağrım arttı', 'Ağrım azaldı',
  'Egzersizleri yaptım', 'Sorum var', 'Randevu almak istiyorum', 'Tamam',
];
export const QUICK_REPLIES_EN = [
  'Thank you', 'I understand', 'Pain increased', 'Pain decreased',
  'Did my exercises', 'I have a question', 'I want an appointment', 'OK',
];

export const EMOJI_LIST = ['👍', '🙏', '😊', '💪', '❤️', '👏', '🤔', '😅', '✅', '⭐', '🎉', '👋'];
