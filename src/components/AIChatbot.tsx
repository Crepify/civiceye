import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Mail, MessageSquare, Phone, Send, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useBrand } from '@/hooks/useBrand';
import { useAuth } from '@/hooks/useAuth';
import { isAmritaEmail } from '@/utils/auth';
import { supabase } from '@/lib/supabase';
import { CAMPUS_ADDRESS } from '@/data/amritaCampus/campusInfo';
import { AUTHORITIES } from '@/data/authorities';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatConfig {
  assistantName: string;
  subtitle: string;
  intro: string;
  placeholder: string;
  footer: string;
  accent: string;
  accentHover: string;
  panel: string;
  bubble: string;
  quickQuestions: string[];
}

const CHAT_CONFIG: Record<'civiceye' | 'amrita', ChatConfig> = {
  civiceye: {
    assistantName: 'CivicEye Assistant',
    subtitle: 'City reporting · BBMP · maps · AI',
    intro:
      'Hi! I’m the CivicEye Assistant. I can help with city reports, BBMP routing, AI photo analysis, maps, community verification, and report status.',
    placeholder: 'Ask about reporting, BBMP, maps, or AI…',
    footer: '112 emergency · BBMP 1533 · CivicEye support',
    accent: 'bg-[#ef6b59]',
    accentHover: 'active:bg-[#d95645]',
    panel: 'bg-[#fffdf4]',
    bubble: 'bg-[#fffdf4] text-[#172b44]',
    quickQuestions: ['How do I report?', 'BBMP contact?', 'How does AI work?', 'Track my report'],
  },
  amrita: {
    assistantName: 'Amrita Eye Assistant',
    subtitle: 'Campus map · Estate Office · student help',
    intro:
      'Hi! I’m the Amrita Eye Assistant. I can help you find rooms and faculty, use the campus map, report campus issues, and contact the right campus team.',
    placeholder: 'Ask about the campus map, rooms, or reporting…',
    footer: `112 emergency · Estate Office ${CAMPUS_ADDRESS.phone}`,
    accent: 'bg-[#A51636]',
    accentHover: 'active:bg-[#84122b]',
    panel: 'bg-[#FFF5F7]',
    bubble: 'bg-white text-slate-800',
    quickQuestions: ['How do I report?', 'Find a room', 'Find faculty', 'Mess / hygiene'],
  },
};

const CIVIC_KNOWLEDGE = [
  {
    q: 'what is civiceye',
    a: 'CivicEye is a city issue reporting platform. Add a clear photo, location, and description so the community and responsible civic authority can act on it.',
  },
  {
    q: 'how to report',
    a: 'Open Report → choose a category → add a clear photo → confirm the location → describe the issue → review and submit. Keep the report code so you can track it.',
  },
  {
    q: 'bbmp',
    a: 'BBMP handles many Bengaluru road, waste, street-light, and drainage issues. CivicEye routes city reports to the responsible authority and includes the map location and evidence.',
  },
  {
    q: 'ai',
    a: 'The photo analysis estimates the category, confidence, severity, and description. Review the result yourself before submitting because AI can be wrong.',
  },
  {
    q: 'community',
    a: 'Community reports can be searched, filtered, confirmed, reviewed, and tracked as their status changes from pending to verified, in progress, or resolved.',
  },
];

const AMRITA_KNOWLEDGE = [
  {
    q: 'what is amrita eye',
    a: 'Amrita Eye is the private campus issue and wayfinding portal for Amrita Bengaluru. It includes campus reports, official floor-plan-based maps, room and faculty search, and campus-team routing.',
  },
  {
    q: 'estate office',
    a: `The Estate Office handles campus maintenance such as roads, lights, water, waste, and building issues. Campus contact: ${CAMPUS_ADDRESS.email} · ${CAMPUS_ADDRESS.phone}.`,
  },
  {
    q: 'how to report',
    a: 'Open Report → select a campus category → add evidence → choose the block, floor, room, or map location → describe the issue → submit. Your report is visible in the campus issue workflow.',
  },
  {
    q: 'floor plan',
    a: 'Use Campus Map and search for a block, room, hall, or faculty member. Blocks A–D have Ground through Third Floor plans. E Block has Ground through Seventh Floor plans based on the official campus PDFs.',
  },
  {
    q: 'faculty',
    a: 'Open Campus Map → Faculty or search by name, department, room, block, or floor. Selecting a faculty member opens the available official room mapping and route to that location.',
  },
  {
    q: 'mess',
    a: 'Use Mess / Hygiene to submit an anonymous food-safety concern with the location, issue type, severity, description, and optional scrubbed photos.',
  },
];

function getResponse(input: string, isAmrita: boolean): string {
  const q = input.toLowerCase().trim();
  const knowledge = isAmrita ? AMRITA_KNOWLEDGE : CIVIC_KNOWLEDGE;
  const config = isAmrita ? CHAT_CONFIG.amrita : CHAT_CONFIG.civiceye;

  for (const item of knowledge) {
    if (q.includes(item.q)) return item.a;
  }

  if (q.includes('hello') || q === 'hi' || q.startsWith('hi ')) return config.intro;

  if (isAmrita) {
    if (q.includes('map') || q.includes('route') || q.includes('where')) {
      return 'Open Campus Map and search for the destination. Select the block, floor, room, hall, or faculty result to open it on the map and request directions.';
    }
    if (q.includes('library') || q.includes('reading')) {
      return 'The official E Block Fourth Floor plan shows the Library and Reading Room. Search for “Library” or “Reading Room” in Campus Map to open the floor plan.';
    }
    if (q.includes('hall')) {
      return 'The official E Block plans show Amriteshwari and Sudhamani Halls on the Ground Floor, Valmiki, Rama, Krishna, and Vyasa Halls on the First Floor, and additional academic spaces on the upper floors.';
    }
    if (q.includes('contact') || q.includes('phone') || q.includes('email')) {
      const campusAuthorities = AUTHORITIES
        .filter((authority) => authority.scope === 'campus')
        .slice(0, 3)
        .map((authority) => `${authority.name}: ${authority.email || authority.phone}`)
        .join(' · ');
      return `Campus contacts: ${campusAuthorities || `${CAMPUS_ADDRESS.email} · ${CAMPUS_ADDRESS.phone}`}.`;
    }
    return 'I can help with the campus map, official floor plans, faculty and room search, Estate Office, campus reporting, or mess and hygiene concerns.';
  }

  if (q.includes('map')) return 'The CivicEye map shows city reports with search, filters, severity, verification, and report details.';
  if (q.includes('contact') || q.includes('phone') || q.includes('email')) {
    return 'Use the authority contact shown on the report. CivicEye includes the relevant department, evidence, coordinates, and report link when you escalate a city issue.';
  }
  return 'I can help with city reporting, BBMP routing, AI photo analysis, community verification, map use, and report status.';
}

async function requestChat(history: Message[], isAmrita: boolean): Promise<string> {
  const session = isAmrita && supabase ? (await supabase.auth.getSession()).data.session : null;
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      brand: isAmrita ? 'amrita' : 'civiceye',
      messages: history.map(({ role, text }) => ({ role, content: text })),
    }),
  });
  if (!response.ok || !response.body) throw new Error(`Chat unavailable (${response.status})`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  const consume = (line: string) => {
    const data = line.trim().startsWith('data:') ? line.trim().slice(5).trim() : '';
    if (!data || data === '[DONE]') return;
    const payload = JSON.parse(data) as { type?: string; text?: string; message?: string };
    if (payload.type === 'error') throw new Error(payload.message || 'Chat failed');
    if (payload.type === 'content' && payload.text) text += payload.text;
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.forEach(consume);
    if (done) break;
  }
  if (buffer.trim()) consume(buffer);
  if (!text.trim()) throw new Error('Chat returned no answer');
  return text.trim();
}

export function AIChatbot() {
  const { isAmrita } = useBrand();
  const { user } = useAuth();
  const location = useLocation();
  const config = isAmrita ? CHAT_CONFIG.amrita : CHAT_CONFIG.civiceye;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/reset');
  const canUseAmritaAssistant = Boolean(user?.email && isAmritaEmail(user.email));

  useEffect(() => {
    setMessages([
      {
        id: `${isAmrita ? 'amrita' : 'civic'}-welcome`,
        role: 'assistant',
        text: config.intro,
        timestamp: new Date().toISOString(),
      },
    ]);
    setOpen(false);
    setInput('');
  }, [isAmrita, config.intro]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const send = () => {
    const text = input.trim();
    if (!text || sending) return;
    const now = new Date().toISOString();
    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text, timestamp: now };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setSending(true);
    void requestChat(nextHistory, isAmrita)
      .catch(() => getResponse(text, isAmrita))
      .then((answer) => {
        setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: answer, timestamp: new Date().toISOString() }]);
      })
      .finally(() => setSending(false));
  };

  const theme = useMemo(
    () => ({
      border: isAmrita ? 'border-[#A51636]/30' : 'border-[#172b44]/30',
      shadow: isAmrita
        ? 'shadow-[0_20px_60px_rgba(165,22,54,0.25)]'
        : 'shadow-[6px_6px_0_#172b44]',
      surface: isAmrita ? 'bg-[#FFF5F7]' : 'bg-[#fff8e7]',
      assistantIcon: isAmrita ? 'bg-[#A51636]/15 text-[#A51636]' : 'bg-[#91dcc4] text-[#172b44]',
      input: isAmrita ? 'focus:border-[#A51636]/40' : 'focus:border-[#ef6b59]',
    }),
    [isAmrita],
  );

  // Amrita assistance is private. The anonymous food-hygiene form remains
  // available without the chatbot, while every authenticated campus view
  // requires a verified Amrita-domain account.
  if (isAuthPage || (isAmrita && !canUseAmritaAssistant)) return null;

  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[88]"
          role="dialog"
          aria-modal="true"
          aria-label={config.assistantName}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className={cn(
              'absolute inset-x-0 bottom-0 flex flex-col border-t-4 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.35)] sm:hidden',
              isAmrita ? 'border-[#A51636]' : 'border-[#ef6b59]',
            )}
            style={{ height: 'calc(100dvh - 16px)', paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
          >
            <ChatHeader config={config} onClose={() => setOpen(false)} />
            <MessageList messages={messages} bottomRef={bottomRef} theme={theme} />
            <Composer config={config} input={input} setInput={setInput} send={send} sending={sending} theme={theme} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={cn(
              'hidden sm:absolute sm:bottom-24 sm:right-7 sm:flex sm:h-[560px] sm:w-[380px] sm:flex-col sm:overflow-hidden sm:rounded-2xl sm:border-2 sm:bg-white',
              theme.border,
              theme.shadow,
            )}
          >
            <ChatHeader config={config} onClose={() => setOpen(false)} />
            <MessageList messages={messages} bottomRef={bottomRef} theme={theme} />
            <Composer config={config} input={input} setInput={setInput} send={send} sending={sending} theme={theme} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        className={cn(
          'fixed bottom-24 left-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full text-white sm:bottom-8 sm:left-auto sm:right-7',
          config.accent,
          config.accentHover,
          isAmrita ? 'shadow-[0_8px_24px_rgba(165,22,54,0.4)]' : 'shadow-[4px_4px_0_#172b44]',
        )}
        aria-label={open ? `Close ${config.assistantName}` : `Open ${config.assistantName}`}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" strokeWidth={2.5} /> : <MessageSquare className="h-6 w-6" strokeWidth={2.3} />}
      </motion.button>
      {typeof document !== 'undefined' ? createPortal(panel, document.body) : null}
    </>
  );
}

function ChatHeader({ config, onClose }: { config: ChatConfig; onClose: () => void }) {
  const isAmrita = config === CHAT_CONFIG.amrita;
  return (
    <div className={cn('flex items-center gap-3 border-b px-4 py-3 text-white', isAmrita ? 'border-[#A51636]/20 bg-[#A51636]' : 'border-[#172b44] bg-[#ef6b59]')}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
        <Bot className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-bold leading-tight">
          {config.assistantName} <Sparkles className="h-3.5 w-3.5 text-amber-200" />
        </div>
        <div className="truncate text-[11px] text-white/80">{config.subtitle}</div>
      </div>
      <button onClick={onClose} aria-label="Close chat" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/25 sm:hover:bg-white/20">
        <X className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function MessageList({ messages, bottomRef, theme }: { messages: Message[]; bottomRef: React.RefObject<HTMLDivElement>; theme: { surface: string; assistantIcon: string } }) {
  return (
    <div className={cn('flex-1 overflow-y-auto overscroll-contain p-3', theme.surface)}>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            {message.role === 'assistant' ? (
              <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', theme.assistantIcon)}>
                <Bot className="h-4 w-4" />
              </div>
            ) : null}
            <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm', message.role === 'user' ? 'rounded-br-md bg-slate-900 text-white' : 'rounded-bl-md bg-white text-slate-800 dark:bg-white/10 dark:text-slate-100')}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function Composer({ config, input, setInput, send, sending, theme }: { config: ChatConfig; input: string; setInput: (value: string) => void; send: () => void; sending: boolean; theme: { input: string } }) {
  const isAmrita = config === CHAT_CONFIG.amrita;
  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
      <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {config.quickQuestions.map((question) => (
          <button key={question} onClick={() => setInput(question)} className={cn('shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition', isAmrita ? 'border-[#A51636]/20 bg-[#FFF5F7] text-[#A51636] active:bg-[#A51636]/10' : 'border-[#172b44]/20 bg-[#fffdf4] text-[#172b44] active:bg-[#91dcc4]')}>
            {question}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={config.placeholder}
          className={cn('min-h-[42px] max-h-24 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[14px] leading-snug outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white', theme.input)}
        />
          <button onClick={send} disabled={!input.trim() || sending} aria-label="Send message" className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition', input.trim() && !sending ? config.accent : 'cursor-not-allowed bg-slate-300 dark:bg-white/10')}>
           {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-4 w-4" strokeWidth={2.4} />}
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        {isAmrita ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />} {config.footer}
      </div>
    </div>
  );
}
