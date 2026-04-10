'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MessageCircle, Send, X, ChevronLeft, Search,
  Stethoscope, User, Smile, Paperclip, MoreVertical,
  Phone, Video, Star, FileText, Image as ImageIcon,
  ArrowDown, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { MessageBubble, TypingIndicator, PatientListItem } from '@/components/patient/ChatMessageBubble';
import {
  timeAgo, formatDateLabel, groupMessagesByDate,
  QUICK_REPLIES_TR, QUICK_REPLIES_EN, EMOJI_LIST,
} from '@/components/patient/ChatHelpers';

export default function ChatWidget() {
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patients = useStore((s) => s.patients);
  const chatMessages = useStore((s) => s.chatMessages);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const markMessagesRead = useStore((s) => s.markMessagesRead);
  const deleteChatMessage = useStore((s) => s.deleteChatMessage);
  const toggleStarMessage = useStore((s) => s.toggleStarMessage);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [doctorView, setDoctorView] = useState<'list' | 'chat'>('list');
  const [filterStarred, setFilterStarred] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPatient = userRole === 'patient';
  const effectivePatientId = isPatient ? loggedInPatientId : selectedPatientId;

  const quickReplies = tr ? QUICK_REPLIES_TR : QUICK_REPLIES_EN;

  const patientConversations = useMemo(() => {
    const patientIds = [...new Set(chatMessages.map((m) => m.patientId))];
    return patientIds
      .map((pid) => {
        const patient = patients.find((p) => p.id === pid);
        if (!patient) return null;
        const msgs = chatMessages.filter((m) => m.patientId === pid);
        const lastMsg = msgs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const unread = msgs.filter((m) => m.sender === 'patient' && !m.read).length;
        return {
          id: pid,
          name: `${patient.firstName} ${patient.lastName}`,
          diagnosis: patient.diagnosis,
          lastMessage: lastMsg?.text || (lastMsg?.attachment ? `[${lastMsg.attachment.type === 'image' ? 'Fotoğraf' : 'Dosya'}]` : ''),
          lastDate: lastMsg?.date || '',
          unread,
        };
      })
      .filter(Boolean)
      .filter((c) => !searchQuery || c!.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (a!.unread > 0 && b!.unread === 0) return -1;
        if (a!.unread === 0 && b!.unread > 0) return 1;
        return new Date(b!.lastDate).getTime() - new Date(a!.lastDate).getTime();
      }) as { id: string; name: string; diagnosis: string; lastMessage: string; lastDate: string; unread: number }[];
  }, [chatMessages, patients, searchQuery]);

  const messages = useMemo(() => {
    let msgs = chatMessages
      .filter((m) => m.patientId === effectivePatientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (chatSearch) msgs = msgs.filter((m) => m.text.toLowerCase().includes(chatSearch.toLowerCase()));
    if (filterStarred) msgs = msgs.filter((m) => m.starred);
    return msgs;
  }, [chatMessages, effectivePatientId, chatSearch, filterStarred]);

  const messageGroups = groupMessagesByDate(messages);

  const unreadCount = isPatient
    ? chatMessages.filter((m) => m.patientId === loggedInPatientId && m.sender === 'doctor' && !m.read).length
    : chatMessages.filter((m) => m.sender === 'patient' && !m.read).length;

  const selectedPatient = patients.find((p) => p.id === effectivePatientId);
  const selectedPatientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages.length, open, isTyping, scrollToBottom]);

  useEffect(() => {
    if (open && effectivePatientId) {
      markMessagesRead(effectivePatientId, isPatient ? 'patient' : 'doctor');
    }
  }, [open, effectivePatientId, messages.length, markMessagesRead, isPatient]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 80);
  };

  const simulateReply = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000 + Math.random() * 2000);
  };

  const sendMessage = () => {
    if (!text.trim() || !effectivePatientId) return;
    addChatMessage({
      id: `cm-${Date.now()}`,
      patientId: effectivePatientId,
      text: text.trim(),
      sender: isPatient ? 'patient' : 'doctor',
      date: new Date().toISOString(),
      read: false,
      replyTo: replyingTo || undefined,
    });
    setText('');
    setReplyingTo(null);
    setShowQuickReplies(false);
    setShowEmoji(false);
    if (messages.length < 30) simulateReply();
  };

  const sendAttachment = (type: 'image' | 'file') => {
    if (!effectivePatientId) return;
    addChatMessage({
      id: `cm-${Date.now()}`,
      patientId: effectivePatientId,
      text: '',
      sender: isPatient ? 'patient' : 'doctor',
      date: new Date().toISOString(),
      read: false,
      attachment: {
        type,
        name: type === 'image' ? `fotograf_${Date.now()}.jpg` : `dosya_${Date.now()}.pdf`,
        size: type === 'image' ? '1.5 MB' : '320 KB',
      },
    });
    showToast(tr ? 'Dosya gönderildi' : 'File sent');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const replyToMessage = chatMessages.find((m) => m.id === replyingTo);

  const openChat = (patientId: string) => {
    setSelectedPatientId(patientId);
    setDoctorView('chat');
    setChatSearch('');
    setShowChatSearch(false);
    setFilterStarred(false);
    setShowInfoPanel(false);
  };

  const showChatView = isPatient || doctorView === 'chat';

  const sharedFiles = chatMessages.filter((m) => m.patientId === effectivePatientId && m.attachment);
  const starredCount = chatMessages.filter((m) => m.patientId === effectivePatientId && m.starred).length;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 right-0 left-0 mx-4 sm:left-auto sm:mx-0 sm:right-6 sm:bottom-24 z-50 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex"
            style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 'auto' : (showInfoPanel && showChatView ? '620px' : '420px'), height: '600px', maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Doctor: Patient List View */}
            {!isPatient && doctorView === 'list' && (
              <div className="w-full flex flex-col">
                <div className="bg-[var(--color-primary)] px-4 py-3 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold">{tr ? 'Mesajlar' : 'Messages'}</h3>
                      <span className="text-[11px] text-white/70">
                        {patientConversations.length} {tr ? 'görüşme' : 'conversations'}
                        {unreadCount > 0 && ` · ${unreadCount} ${tr ? 'okunmamış' : 'unread'}`}
                      </span>
                    </div>
                    <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2.5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={tr ? 'Hasta ara...' : 'Search patients...'}
                      className="w-full rounded-lg bg-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/25 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {patientConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
                      <MessageCircle className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm">{tr ? 'Henüz mesaj yok' : 'No messages yet'}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                      {patientConversations.map((conv) => (
                        <PatientListItem
                          key={conv.id}
                          name={conv.name}
                          diagnosis={conv.diagnosis}
                          lastMessage={conv.lastMessage}
                          lastDate={conv.lastDate}
                          unread={conv.unread}
                          active={conv.id === selectedPatientId}
                          onClick={() => openChat(conv.id)}
                          tr={tr}
                          timeAgoFn={timeAgo}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat View */}
            {showChatView && (
              <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="bg-[var(--color-primary)] px-4 py-3 text-white">
                  <div className="flex items-center gap-3">
                    {!isPatient && (
                      <button
                        onClick={() => { setDoctorView('list'); setSelectedPatientId(''); setShowChatSearch(false); setChatSearch(''); setFilterStarred(false); setShowInfoPanel(false); }}
                        className="rounded-lg p-1 hover:bg-white/20 transition-colors -ml-1"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                    <div className="relative flex-shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                        {isPatient ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[var(--color-primary)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">
                        {isPatient ? (tr ? 'Doktorunuz' : 'Your Doctor') : selectedPatientName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-white/70">{tr ? 'Çevrimiçi' : 'Online'}</span>
                        {selectedPatient && !isPatient && (
                          <span className="text-[11px] text-white/50">· {selectedPatient.diagnosis}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setFilterStarred(!filterStarred)}
                        className={`rounded-lg p-1.5 transition-colors ${filterStarred ? 'bg-white/30' : 'hover:bg-white/20'}`}
                        title={tr ? 'Yıldızlı mesajlar' : 'Starred'}
                      >
                        <Star className={`h-3.5 w-3.5 ${filterStarred ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => { setShowChatSearch(!showChatSearch); setChatSearch(''); }}
                        className={`rounded-lg p-1.5 transition-colors ${showChatSearch ? 'bg-white/30' : 'hover:bg-white/20'}`}
                      >
                        <Search className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                        <Video className="h-3.5 w-3.5" />
                      </button>
                      {!isPatient && (
                        <button
                          onClick={() => setShowInfoPanel(!showInfoPanel)}
                          className={`rounded-lg p-1.5 transition-colors ${showInfoPanel ? 'bg-white/30' : 'hover:bg-white/20'}`}
                          title={tr ? 'Hasta bilgileri' : 'Patient info'}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showChatSearch && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2.5 relative flex items-center gap-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                          <input
                            value={chatSearch}
                            onChange={(e) => setChatSearch(e.target.value)}
                            placeholder={tr ? 'Mesajlarda ara...' : 'Search messages...'}
                            className="w-full rounded-lg bg-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/25 transition-colors"
                            autoFocus
                          />
                          {chatSearch && (
                            <span className="text-[10px] text-white/50 whitespace-nowrap flex-shrink-0 pr-1">
                              {messages.length} {tr ? 'sonuç' : 'results'}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {filterStarred && (
                  <div className="px-4 py-1.5 bg-[var(--color-warning)]/5 border-b border-[var(--color-border)] flex items-center gap-2">
                    <Star className="h-3 w-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                    <span className="text-[10px] text-[var(--color-warning)] font-medium">
                      {tr ? 'Yıldızlı mesajlar gösteriliyor' : 'Showing starred'}
                    </span>
                    <button onClick={() => setFilterStarred(false)} className="ml-auto text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-4 py-3 relative"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
                      <MessageCircle className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">
                        {filterStarred
                          ? (tr ? 'Yıldızlı mesaj yok' : 'No starred messages')
                          : chatSearch
                            ? (tr ? 'Sonuç bulunamadı' : 'No results')
                            : (tr ? 'Henüz mesaj yok' : 'No messages yet')
                        }
                      </p>
                      {!filterStarred && !chatSearch && (
                        <p className="text-xs mt-1 text-[var(--color-text-secondary)]/60">
                          {tr ? 'İlk mesajınızı gönderin' : 'Send your first message'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {messageGroups.map((group) => (
                        <div key={group.label}>
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-[var(--color-border)]" />
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-medium bg-[var(--color-card)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                              {formatDateLabel(group.dateStr, tr)}
                            </span>
                            <div className="flex-1 h-px bg-[var(--color-border)]" />
                          </div>

                          <div className="space-y-2">
                            {group.messages.map((msg) => {
                              const isMine = (isPatient && msg.sender === 'patient') || (!isPatient && msg.sender === 'doctor');
                              const replyMsg = msg.replyTo ? chatMessages.find((m) => m.id === msg.replyTo) : undefined;
                              return (
                                <MessageBubble
                                  key={msg.id}
                                  msg={msg}
                                  isMine={isMine}
                                  tr={tr}
                                  onReply={() => { setReplyingTo(msg.id); inputRef.current?.focus(); }}
                                  onDelete={() => { deleteChatMessage(msg.id); showToast(tr ? 'Mesaj silindi' : 'Message deleted'); }}
                                  onStar={() => toggleStarMessage(msg.id)}
                                  replyToMsg={replyMsg}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {isTyping && <TypingIndicator />}
                    </>
                  )}
                  <div ref={messagesEndRef} />

                  <AnimatePresence>
                    {showScrollDown && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        className="sticky bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full px-2.5 py-1.5 shadow-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <ArrowDown className="h-3 w-3" />
                        <span className="text-[10px] font-medium">{tr ? 'Alta in' : 'Bottom'}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Replies */}
                <AnimatePresence>
                  {showQuickReplies && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--color-border)] overflow-hidden"
                    >
                      <div className="px-3 py-2 flex flex-wrap gap-1.5">
                        {quickReplies.map((reply) => (
                          <button
                            key={reply}
                            onClick={() => { setText(reply); setShowQuickReplies(false); inputRef.current?.focus(); }}
                            className="rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-3 py-1 text-[11px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--color-border)] overflow-hidden"
                    >
                      <div className="px-3 py-2 flex flex-wrap gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { setText((prev) => prev + emoji); setShowEmoji(false); inputRef.current?.focus(); }}
                            className="rounded-lg p-1.5 text-lg hover:bg-[var(--color-background)] transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reply indicator */}
                <AnimatePresence>
                  {replyingTo && replyToMessage && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--color-border)] overflow-hidden"
                    >
                      <div className="px-4 py-2 flex items-center gap-2 bg-[var(--color-primary)]/5">
                        <div className="w-0.5 h-7 rounded-full bg-[var(--color-primary)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-semibold text-[var(--color-primary)]">
                            {replyToMessage.sender === (isPatient ? 'patient' : 'doctor')
                              ? (tr ? 'Kendinize yanıtla' : 'Reply to yourself')
                              : (isPatient ? (tr ? 'Doktora yanıtla' : 'Reply to doctor') : selectedPatientName)
                            }
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                            {replyToMessage.text.slice(0, 60)}{replyToMessage.text.length > 60 ? '...' : ''}
                          </p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="rounded p-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input area */}
                <div className="border-t border-[var(--color-border)] p-3">
                  <div className="flex items-end gap-2">
                    <div className="flex items-center gap-0.5 pb-0.5">
                      <button
                        onClick={() => sendAttachment('file')}
                        className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        title={tr ? 'Dosya gönder' : 'Send file'}
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => sendAttachment('image')}
                        className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        title={tr ? 'Fotoğraf gönder' : 'Send photo'}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setShowEmoji(!showEmoji); setShowQuickReplies(false); }}
                        className={`rounded-lg p-1.5 transition-colors ${showEmoji ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'}`}
                        title="Emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setShowQuickReplies(!showQuickReplies); setShowEmoji(false); }}
                        className={`rounded-lg p-1.5 transition-colors ${showQuickReplies ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'}`}
                        title={tr ? 'Hızlı Yanıt' : 'Quick Reply'}
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tr ? 'Mesajınızı yazın...' : 'Type a message...'}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]/30 transition-all resize-none"
                        rows={1}
                        style={{ minHeight: '40px', maxHeight: '100px' }}
                        disabled={!effectivePatientId}
                      />
                    </div>

                    <motion.button
                      onClick={sendMessage}
                      disabled={!text.trim() || !effectivePatientId}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all disabled:opacity-30 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Panel (Doctor only) */}
            <AnimatePresence>
              {showInfoPanel && showChatView && !isPatient && selectedPatient && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-l border-[var(--color-border)] flex flex-col overflow-hidden bg-[var(--color-card)]"
                >
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-5 text-center border-b border-[var(--color-border)]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 mx-auto mb-2">
                        <User className="h-7 w-7 text-[var(--color-primary)]" />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--color-text-main)]">{selectedPatientName}</h4>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{selectedPatient.diagnosis}</p>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-health-green)]" />
                        <span className="text-[9px] text-[var(--color-health-green)] font-medium">{tr ? 'Çevrimiçi' : 'Online'}</span>
                      </div>
                    </div>

                    <div className="px-3 py-3 border-b border-[var(--color-border)]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-primary)]/5 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                          <span className="text-[9px] font-medium text-[var(--color-text-secondary)]">{tr ? 'Ara' : 'Call'}</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-primary)]/5 transition-colors">
                          <Video className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                          <span className="text-[9px] font-medium text-[var(--color-text-secondary)]">{tr ? 'Görüntülü' : 'Video'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="px-3 py-3 border-b border-[var(--color-border)]">
                      <p className="text-[9px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                        {tr ? 'Hasta Bilgileri' : 'Patient Info'}
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[9px] text-[var(--color-text-secondary)]">{tr ? 'Telefon' : 'Phone'}</p>
                          <p className="text-[10px] font-medium text-[var(--color-text-main)]">{selectedPatient.phone}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[var(--color-text-secondary)]">{tr ? 'Doğum Tarihi' : 'Birth Date'}</p>
                          <p className="text-[10px] font-medium text-[var(--color-text-main)]">
                            {new Date(selectedPatient.birthDate).toLocaleDateString(tr ? 'tr-TR' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-3 border-b border-[var(--color-border)]">
                      <p className="text-[9px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                        {tr ? 'İstatistikler' : 'Stats'}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">{tr ? 'Mesajlar' : 'Messages'}</span>
                          <span className="text-[10px] font-bold text-[var(--color-text-main)]">
                            {chatMessages.filter((m) => m.patientId === effectivePatientId).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">{tr ? 'Yıldızlı' : 'Starred'}</span>
                          <span className="text-[10px] font-bold text-[var(--color-warning)]">{starredCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-secondary)]">{tr ? 'Dosyalar' : 'Files'}</span>
                          <span className="text-[10px] font-bold text-[var(--color-text-main)]">{sharedFiles.length}</span>
                        </div>
                      </div>
                    </div>

                    {sharedFiles.length > 0 && (
                      <div className="px-3 py-3">
                        <p className="text-[9px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                          {tr ? 'Dosyalar' : 'Files'}
                        </p>
                        <div className="space-y-1.5">
                          {sharedFiles.slice(0, 4).map((msg) => (
                            <div key={msg.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--color-background)]">
                              {msg.attachment?.type === 'image' ? (
                                <ImageIcon className="h-3 w-3 text-[var(--color-primary)] flex-shrink-0" />
                              ) : (
                                <FileText className="h-3 w-3 text-[var(--color-primary)] flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-medium text-[var(--color-text-main)] truncate">{msg.attachment?.name}</p>
                                <p className="text-[8px] text-[var(--color-text-secondary)]">{msg.attachment?.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
