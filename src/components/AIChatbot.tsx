import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Phone, Mail } from 'lucide-react';
import { useBrand } from '@/hooks/useBrand';
import { CAMPUS_ADDRESS } from '@/data/amritaCampus/campusInfo';
import { AUTHORITIES } from '@/data/authorities';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const KNOWLEDGE = {
  civiceye: [
    { q: 'what is civiceye', a: 'CivicEye is a civic-issue reporting platform — making cities better, one report at a time. Report potholes, garbage, broken lights with photo + AI analysis + location, community verifies, authorities fix.' },
    { q: 'how to report', a: 'Go to Report → Pick category → Add photo (AI will auto-detect) → Pin location on map → Add details → Submit. Your report gets a code like CE-XXXX and goes live for verification.' },
    { q: 'bbmp', a: 'BBMP handles roads, potholes, garbage, etc. CivicEye routes your report to comm@bbmp.gov.in + zone emails based on location. Helpline 1533 / 080-2266 0000, WhatsApp 9480685700 (grievance) + 9448197197 (waste). Portal: bbmp.gov.in' },
    { q: 'email', a: 'When you click Report to Authority, CivicEye creates an email with original photo + AI annotated image, Maps link, severity, and link to report on website. For city it goes to BBMP, for campus to Estate Office.' },
    { q: 'ai', a: 'CivicEye uses smart AI to auto-detect category, confidence, severity, and produces annotated image with bounding boxes. You can view AI annotation in Community tab via View AI button.' },
    { q: 'community', a: 'Community tab shows reports. Each card has View AI button to toggle between original and AI annotated image. You can upvote, confirm, and review.' },
  ],
  amrita: [
    { q: 'what is amrita eye', a: 'Amrita Eye is the campus portal for Amrita Bengaluru — Kasavanahalli, 560035. It has a campus map with 12 buildings, 5 blocks A-E, 15 floors, 165 rooms, 155 faculty searchable.' },
    { q: 'estate office', a: `Estate Office handles campus maintenance — potholes, roads, sidewalks, garbage, water, lights. Email: ${CAMPUS_ADDRESS.email}. Address: Estate Office, Admin Block. Hours: Mon–Sat 9-5. Security handles safety 24x7.` },
    { q: 'how to report campus', a: 'Go to Report → Pin location on campus map (tap any building, block, floor, room) → Add photo → Submit. Your campus issue shows only on campus map. Estate office gets email with annotation + Maps link + severity.' },
    { q: 'floor plan', a: 'Floor plans show accurate layouts — open corridor with railing facing courtyard, classrooms and labs inside. E Block is square with all halls on 1st, 2nd, 3rd floor. Library is on 4th floor with 200 seating.' },
    { q: 'faculty', a: '155 faculty searchable by name, department, room. Tap a faculty in campus map to see room, floor, block, and route from entrance.' },
  ],
};

function getResponse(input: string, isAmrita: boolean): string {
  const q = input.toLowerCase();
  const all = [...KNOWLEDGE.civiceye, ...(isAmrita ? KNOWLEDGE.amrita : [])];
  for (const item of all) {
    if (q.includes(item.q)) return item.a;
  }
  if (q.includes('hello') || q.includes('hi')) return `Hello! 👋 I'm CivicEye AI assistant — I can help with reporting issues, BBMP, Estate Office, campus map, AI annotations, community, etc.`;
  if (q.includes('map')) return isAmrita ? KNOWLEDGE.amrita[0].a : 'CivicEye map shows live issues with clustering, heatmap, filters. Amrita Eye uses campus map with floor plans.';
  if (q.includes('library')) return 'Central Library — E Block 4th floor, 200 seating + Reading Hall 150 seating, 45,880+ items, Reference & Digital Library, 8am-12midnight.';
  if (q.includes('hall')) return 'Halls in E Block: Amriteshwari 265, Sudhamani 300, Krishna 112 on 1st floor, Vyasa 90, Rama 85, Valmiki 80, Conference 27 on 2nd floor, Indo-US 62, E-Learning 120, Akshaya 100 on 3rd floor.';
  if (q.includes('contact') || q.includes('phone') || q.includes('email')) {
    const auth = AUTHORITIES.filter((a) => (isAmrita ? a.scope === 'campus' : a.scope === 'city')).slice(0,3).map((a) => `${a.name}: ${a.email || a.phone}`).join(', ');
    return `Authorities: ${auth}. For campus: Estate Office via ${CAMPUS_ADDRESS.email}. For city: BBMP comm@bbmp.gov.in helpline 1533.`;
  }
  return `I'm still learning! 🤖 I can help with reporting, BBMP/Estate Office email, campus map, faculty, community AI view, etc. Try asking about BBMP, Estate Office, floor plan, library, halls, or how to report.`;
}

export function AIChatbot() {
  const { isAmrita } = useBrand();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: `Hi! I'm CivicEye AI 🤖 — ${isAmrita ? 'Amrita Eye campus helper' : 'city helper'}. I can help with reporting, BBMP, Estate Office, campus map, AI annotations, community.`, timestamp: new Date().toISOString() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply = getResponse(text, isAmrita);
      const assistantMsg: Message = { id: (Date.now()+1).toString(), role: 'assistant', text: reply, timestamp: new Date().toISOString() };
      setMessages((m) => [...m, assistantMsg]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#A51636] text-white shadow-[0_8px_24px_rgba(165,22,54,0.3)] transition-transform hover:scale-105 active:scale-95 sm:bottom-24 sm:right-7"
        title="AI Chatbot — tap to ask about BBMP, Estate Office, maps, AI"
      >
        <Bot className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed bottom-36 right-4 z-50 flex h-[480px] w-[90vw] max-w-sm flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-[#1a0f14] sm:bottom-40 sm:right-7 sm:h-[520px]"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 bg-[#FFF5F7] p-4 dark:border-white/10 dark:bg-[#1a0f14]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A51636] text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                  CivicEye AI <Sparkles className="h-4 w-4 text-[#A51636]" /> <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">In Progress</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{isAmrita ? 'Amrita Eye campus helper' : 'City helper'} — BBMP + Estate Office + Maps + AI</div>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A51636]/10 text-[#A51636]">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : null}
                  <div className={`max-w-[78%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#A51636] text-white' : 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['How to report?', 'BBMP email?', 'Estate Office?', 'Campus map?', 'Faculty?', 'AI annotation?'].map((q) => (
                  <button key={q} onClick={() => { setInput(q); }} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about BBMP, Estate Office, maps..." className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#A51636]/30 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A51636] text-white hover:bg-[#8a1230]">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <Phone className="h-3 w-3" /> BBMP 1533 · Estate {CAMPUS_ADDRESS.phone} · <Mail className="h-3 w-3" /> {CAMPUS_ADDRESS.email}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
