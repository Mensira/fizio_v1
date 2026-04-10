'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Star, Trash2, Check, CheckCheck, FileText, Image as ImageIcon, Download } from 'lucide-react';
import type { ChatMessage } from '@/lib/store';

function AttachmentDisplay({ attachment, isMine }: { attachment: ChatMessage['attachment']; isMine: boolean }) {
  if (!attachment) return null;

  if (attachment.type === 'image') {
    return (
      <div className={`mt-1.5 rounded-lg overflow-hidden border ${isMine ? 'border-white/20' : 'border-[var(--color-border)]'}`}>
        <div className={`flex items-center gap-2 px-2.5 py-1.5 ${isMine ? 'bg-white/10' : 'bg-[var(--color-background)]'}`}>
          <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-[11px] font-medium truncate flex-1">{attachment.name}</span>
          <span className={`text-[9px] ${isMine ? 'text-white/50' : 'text-[var(--color-text-secondary)]'}`}>{attachment.size}</span>
        </div>
        <div className={`h-28 flex items-center justify-center ${isMine ? 'bg-white/5' : 'bg-[var(--color-background)]/50'}`}>
          <ImageIcon className={`h-8 w-8 ${isMine ? 'text-white/20' : 'text-[var(--color-text-secondary)]/20'}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-1.5 flex items-center gap-2 rounded-lg px-2.5 py-2 ${isMine ? 'bg-white/10' : 'bg-[var(--color-background)] border border-[var(--color-border)]'}`}>
      <FileText className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{attachment.name}</p>
        {attachment.size && <p className={`text-[9px] ${isMine ? 'text-white/50' : 'text-[var(--color-text-secondary)]'}`}>{attachment.size}</p>}
      </div>
      <Download className="h-3.5 w-3.5 cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
    </div>
  );
}

export function MessageBubble({
  msg,
  isMine,
  tr,
  onReply,
  onDelete,
  onStar,
  replyToMsg,
}: {
  msg: ChatMessage;
  isMine: boolean;
  tr: boolean;
  onReply: () => void;
  onDelete: () => void;
  onStar: () => void;
  replyToMsg?: ChatMessage;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex group relative ${isMine ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative max-w-[80%]">
        {/* Action bar on hover */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              className={`absolute -top-7 ${isMine ? 'right-0' : 'left-0'} flex items-center gap-0.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg px-0.5 py-0.5 z-10`}
            >
              <button onClick={onReply} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)] transition-colors" title={tr ? 'Yanıtla' : 'Reply'}>
                <Reply className="h-3 w-3" />
              </button>
              <button onClick={onStar} className={`rounded p-1 transition-colors ${msg.starred ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-warning)]'} hover:bg-[var(--color-background)]`} title={tr ? 'Yıldızla' : 'Star'}>
                {msg.starred ? <Star className="h-3 w-3 fill-current" /> : <Star className="h-3 w-3" />}
              </button>
              {isMine && (
                <button onClick={onDelete} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-colors" title={tr ? 'Sil' : 'Delete'}>
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply reference */}
        {replyToMsg && (
          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
            <div className={`text-[10px] px-2.5 py-1 rounded-lg border-l-2 max-w-full truncate ${
              isMine
                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]/70'
                : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
            }`}>
              <Reply className="h-2.5 w-2.5 inline mr-1" />
              {replyToMsg.text.slice(0, 50)}{replyToMsg.text.length > 50 ? '...' : ''}
            </div>
          </div>
        )}

        {/* Starred indicator */}
        {msg.starred && (
          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-0.5`}>
            <Star className="h-2.5 w-2.5 text-[var(--color-warning)] fill-[var(--color-warning)]" />
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2 ${
          isMine
            ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
            : 'bg-[var(--color-background)] text-[var(--color-text-main)] rounded-bl-sm border border-[var(--color-border)]/50'
        }`}>
          {msg.text && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

          {msg.attachment && <AttachmentDisplay attachment={msg.attachment} isMine={isMine} />}

          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? 'text-white/50' : 'text-[var(--color-text-secondary)]/60'}`}>
            <span className="text-[10px]">
              {new Date(msg.date).toLocaleTimeString(tr ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMine && (
              msg.read
                ? <CheckCheck className="h-3 w-3 text-sky-200" />
                : <Check className="h-3 w-3" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-[var(--color-background)] rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--color-text-secondary)]/40"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export function PatientListItem({
  name,
  diagnosis,
  lastMessage,
  lastDate,
  unread,
  active,
  onClick,
  tr,
  timeAgoFn,
}: {
  name: string;
  diagnosis: string;
  lastMessage: string;
  lastDate: string;
  unread: number;
  active: boolean;
  onClick: () => void;
  tr: boolean;
  timeAgoFn: (date: string, tr: boolean) => string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-[var(--color-background)] ${
        active ? 'bg-[var(--color-primary)]/5 border-l-2 border-[var(--color-primary)]' : 'border-l-2 border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-[var(--color-primary)]/15' : 'bg-[var(--color-background)]'}`}>
          <svg className={`h-5 w-5 ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        {/* Online dot */}
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[var(--color-card)] flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[var(--color-health-green)]" />
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[8px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--color-text-main)] truncate">{name}</span>
          <span className="text-[9px] text-[var(--color-text-secondary)] flex-shrink-0 ml-2">
            {timeAgoFn(lastDate, tr)}
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{diagnosis}</p>
        <p className={`text-[11px] truncate mt-0.5 ${unread > 0 ? 'text-[var(--color-text-main)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
          {lastMessage}
        </p>
      </div>
    </button>
  );
}
