import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Info } from 'lucide-react';
import { useBrand } from '@/hooks/useBrand';
import { useReports } from '@/hooks/useReports';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'How do I report a pothole?',
  'Where is the Central Library?',
  'Who handles garbage in my area?',
  'How to track my campus issue?',
  'What is the BBMP helpline?',
];

const MOCK_RESPONSES: Record<string, string> = {
  'how do i report a pothole?': 'To report a pothole: 1) Go to Report page, 2) Select Pothole category, 3) Add photo (AI will auto-detect with bounding boxes), 4) Pin location on campus map (for Amrita Eye) or city map (for CivicEye) — every location pinnable to 1m, 5) Add title & description, 6) Submit. Your report will be emailed to BBMP (comm@bbmp.gov.in) with AI annotated image + Google Maps link + severity + report link.',
  'where is the central library?': 'Central Library is in Block E, 4th Floor, New Block. Area 1213 sq m, 200 seating, Reading Hall 325 sq m 150 seating, 45,880+ items, Reference & Periodicals, Digital VIDYA with video/audio lectures, 28 newspapers 8am-12midnight. Find it on campus map: /amrita/map?b=e&f=e-4&room=Library',
  'who handles garbage in my area?': 'For CivicEye (city): BBMP Solid Waste Management — email comm@bbmp.gov.in, phone 1533 / +918022660000, WhatsApp waste 9448197197, portal https://www.bbmp.gov.in. For Amrita Eye (campus): Facilities & Housekeeping — Estate Office, Ground Floor, Admin Block, email civiceyeoffcial@gmail.com (routed to staff). Your report will be auto-emailed with AI annotation + Maps link.',
  'how to track my campus issue?': 'Campus issues only show on custom campus map (no Google Maps) — MapPage when Amrita user, AmritaMapCanvas on landing, Dashboard, Report location step, Features preview all use custom map. Pin any location to 1m, get QR deep links /amrita/map?b=block-c&f=c-g&room=C-G7. Track in Dashboard or Community with AI annotation view.',
  'what is the bbmp helpline?': 'BBMP Helpline: Toll-free 1533, Citizen Helpline +918022660000 (080-2266 0000), WhatsApp grievance 919480685700, Waste WhatsApp 9448197197, Email comm@bbmp.gov.in, Zone emails: East zc-east@bbmp.gov.in, West zc-west@bbmp.gov.in, South zc-south@bbmp.gov.in, Mahadevapura bbmpjcmahadevapura@gmail.com, Portal https://www.bbmp.gov.in',
};

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I’m CivicEye AI — your campus & city helper. Ask me about reporting, campus map, BBMP contacts, or your issues. I’m in progress, so I’m learning from your photos and reports!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAmrita } = useBrand();
  const { reports } = useReports();

  const campusIssues = reports.filter((r) => r.scope === 'campus').length;
  const cityIssues = reports.filter((r) => r.scope === 'city').length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const lower = text.toLowerCase().trim();
      let response = MOCK_RESPONSES[lower] || '';

      if (!response) {
        if (lower.includes('pothole') || lower.includes('road')) {
          response = MOCK_RESPONSES['how do i report a pothole?'];
        } else if (lower.includes('library')) {
          response = MOCK_RESPONSES['where is the central library?'];
        } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('bbmp') || lower.includes('authority')) {
          response = MOCK_RESPONSES['who handles garbage in my area?'];
        } else if (lower.includes('campus') || lower.includes('track') || lower.includes('block') || lower.includes('floor')) {
          response = MOCK_RESPONSES['how to track my campus issue?'];
        } else if (lower.includes('helpline') || lower.includes('contact') || lower.includes('phone')) {
          response = MOCK_RESPONSES['what is the bbmp helpline?'];
        } else {
          response = `I’m still learning! Right now I can help with:\n- Reporting potholes, garbage, etc. with AI annotations + Google Maps links\n- Campus map: Block E square with halls on 1st/2nd/3rd floor, A Block 1st floor open corridor south with railings facing fountain, rooms north, 155 faculty, every location pinnable\n- Authority routing: BBMP comm@bbmp.gov.in, 1533, WhatsApp 919480685700, Estate Office civiceyeoffcial@gmail.com\n- Community AI annotation view\n\nYou asked: "${text.trim()}" — I’ll get better as the AI chatbot progresses. Try one of the suggested questions below! We have ${isAmrita ? `${campusIssues} campus issues` : `${cityIssues} city issues`} live right now.`;
        }
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:bottom-6 sm:right-6',
          isAmrita ? 'bg-[#A51636] text-white shadow-[0_8px_24px_rgba(165,22,54,0.3)]' : 'bg-[#ffd630] text-[#172b44] border-[3px] border-[#172b44] shadow-[4px_4px_0_#172b44]',
        )}
        aria-label="Open AI Chatbot"
      >
        <Bot className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-end bg-black/40 p-4 backdrop-blur-sm sm:p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={cn(
                'flex h-[520px] w-full max-w-[380px] flex-col overflow-hidden sm:h-[600px]',
                isAmrita ? 'rounded-[20px] border border-white/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.2)] dark:bg-[#111]' : 'rounded-[20px] border-[4px] border-[#172b44] bg-[#fff8e7] shadow-[8px_8px_0_#172b44]',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn('flex items-center justify-between border-b p-4', isAmrita ? 'border-[#A51636]/10 bg-[#FFF5F7] dark:border-white/5 dark:bg-[#1a0f14]' : 'border-[#172b44] bg-[#ffd630]')}>
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isAmrita ? 'bg-[#A51636] text-white' : 'bg-[#172b44] text-white')}>
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                      CivicEye AI <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-900">In Progress</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{isAmrita ? 'Amrita Eye helper' : 'City helper'} · {isAmrita ? `${campusIssues} campus issues` : `${cityIssues} city issues`}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-600 hover:bg-black/20 dark:bg-white/10 dark:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-auto bg-slate-50 p-4 dark:bg-[#0a0a0f]">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    ) : null}
                    <div className={cn('max-w-[80%] rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed', msg.role === 'user' ? (isAmrita ? 'bg-[#A51636] text-white' : 'bg-[#172b44] text-white') : 'bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200')}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping ? (
                  <div className="flex gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="rounded-[16px] bg-white px-4 py-2.5 shadow-sm dark:bg-white/10">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#111]">
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => handleSend(q)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-[#A51636]/30 hover:bg-[#A51636]/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about reporting, campus map, BBMP..." className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#A51636] focus:ring-2 focus:ring-[#A51636]/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  <button onClick={() => handleSend()} className={cn('flex h-10 w-10 items-center justify-center rounded-full text-white', isAmrita ? 'bg-[#A51636] hover:bg-[#8a1230]' : 'bg-[#172b44] hover:bg-black')}>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Info className="h-3 w-3" /> AI chatbot in progress · powered by CivicEye AI · {isAmrita ? 'Amrita Eye' : 'CivicEye'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
