import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, MapPin, Building2, Flag, GraduationCap, Phone, Mail } from 'lucide-react';
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
    { q: 'what is civiceye', a: 'CivicEye is a civic-issue reporting platform — making cities better, one report at a time. Citizens report potholes, garbage, broken lights, etc., with photo + AI analysis + location, community verifies, authorities fix.' },
    { q: 'how to report', a: 'Go to Report → Pick category → Add photo (AI will auto-detect) → Pin location on map → Add details → Submit. Your report gets a code like CE-XXXX and goes live for community verification.' },
    { q: 'bbmp', a: 'BBMP (Bruhat Bengaluru Mahanagara Palike) handles roads, potholes, garbage, etc. CivicEye auto-routes your report to comm@bbmp.gov.in (central grievance) + zone emails (East/West/South/Mahadevapura) based on location. Helpline 1533 / 080-2266 0000, WhatsApp 9480685700 (grievance) + 9448197197 (waste). Official portal: bbmp.gov.in' },
    { q: 'email', a: 'When you click Report to Authority, CivicEye auto-generates an email with: attached original photo + AI annotated image with bounding boxes, Google Maps link https://www.google.com/maps?q=lat,lng, severity (LOW/MEDIUM/HIGH/CRITICAL), and link to report on website. For BBMP it goes to comm@bbmp.gov.in, for campus to Estate Office via civiceyeoffcial@gmail.com.' },
    { q: 'ai', a: 'CivicEye uses Roboflow cloud primary → on-device YOLO fallback (civiceye-int8.onnx) → Hugging Face → mock. It auto-detects category, confidence, severity, objects, and produces annotated image with bounding boxes. You can view AI annotation in Community tab via View AI button on each card.' },
    { q: 'community', a: 'Community tab shows citizen reports. Each card now has View AI button to toggle between original and AI annotated image with bounding boxes. You can upvote, confirm, reject, and review.' },
  ],
  amrita: [
    { q: 'what is amrita eye', a: 'Amrita Eye is the campus portal for Amrita Bengaluru — Kasavanahalli, 560035, 50 acres official (37.2 measured). It uses a custom campus map ONLY (no Google Maps) with 12 buildings, 5 blocks A-E (E is square 50.8x50.8m per your correction, all halls in E Block 1st/2nd/3rd), 15 floors, 165 rooms, 155 faculty public searchable, every location pinnable to 1m.' },
    { q: 'estate office', a: `Campus Estate & Civil Works handles potholes, broken roads, sidewalks, manholes, fallen trees. Email: ${CAMPUS_ADDRESS.email} (routed via civiceyeoffcial@gmail.com). Address: Estate Office, Admin Block, Amrita Campus. Hours: Mon–Sat 9-5. Facilities & Housekeeping handles garbage, sewage, water-leakage, street-light. Security Control Room handles safety & accidents 24x7.` },
    { q: 'how to report campus', a: 'Go to Report → Pin location on custom campus map (tap any building, block, floor, room) → Add photo (AI annotated) → Submit. Your campus issue only shows on custom campus map, not city map. Estate office gets auto email with AI annotation + Google Maps link + severity + report link.' },
    { q: 'floor plan', a: 'Floor plans are tentative but accurate from your A Block 1st floor photos (open corridor south with railings facing fountain, rooms north wooden doors, Akshaya Hall sign, Indo-US blue curved wall Indian flag US flag Amma photo) + E Block square 50.8x50.8m per your correction + Google Maps satellite E-shaped comb order E,A,B,C,D. All halls in E Block 1st/2nd/3rd per your correction. Library 4th floor only 1213 sq m 200 seating + reading hall 325 sq m 150.' },
    { q: 'faculty', a: '155 faculty public searchable by name/dept/room from amrita.edu. Tap a faculty in campus map to see desk (indicative), room, floor, block, official profile link, and route from entrance.' },
  ],
};

function getResponse(input: string, isAmrita: boolean): string {
  const q = input.toLowerCase();
  const all = [...KNOWLEDGE.civiceye, ...(isAmrita ? KNOWLEDGE.amrita : [])];
  for (const item of all) {
    if (q.includes(item.q)) return item.a;
  }
  if (q.includes('hello') || q.includes('hi')) return `Hello! 👋 I'm CivicEye AI assistant — I can help with reporting issues, BBMP, Estate Office, campus map, AI annotations, community, etc. Ask me anything!`;
  if (q.includes('map')) return isAmrita ? KNOWLEDGE.amrita[0].a : 'CivicEye map shows live issues with Google Maps + fallback vector map, clustering, heatmap, filters. Amrita Eye uses custom campus map only (no Google Maps) with floor plans.';
  if (q.includes('library')) return 'Central Library — E Block 4th floor, New Block, 1213 sq m total (16,550 sq ft with reading hall), 200 seating + Reading Hall 325 sq m 150 seating, 45,880+ items, Reference & Periodicals, Digital VIDYA, 28 newspapers 8am-12midnight.';
  if (q.includes('hall')) return 'Halls in E Block per your correction: Amriteshwari 265, Sudhamani 300, Krishna 112 on 1st floor, Vyasa 90, Rama 85, Valmiki 80, Conference 27 on 2nd floor, Indo-US 62, E-Learning 120, Akshaya 100 on 3rd floor — all in E Block square 50.8x50.8m.';
  if (q.includes('contact') || q.includes('phone') || q.includes('email')) {
    const auth = AUTHORITIES.filter((a) => (isAmrita ? a.scope === 'campus' : a.scope === 'city')).slice(0,3).map((a) => `${a.name}: ${a.email || a.phone}`).join(', ');
    return `Authorities: ${auth}. For campus: Estate Office via ${CAMPUS_ADDRESS.email}. For city: BBMP comm@bbmp.gov.in helpline 1533.`;
  }
  return `I'm still learning! 🤖 For now I can help with: reporting issues, BBMP/Estate Office auto email with AI annotations + Google Maps link + severity + report link, campus map (12 buildings, 5 blocks A-E, E square, halls in E Block 1st/2nd/3rd, A Block 1st floor from your photos), faculty 155, community AI view, etc. Try asking about BBMP, Estate Office, floor plan, library, halls, or how to report.`;
}

export function AIChatbot() {
  const { isAmrita } = useBrand();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: `Hi! I'm CivicEye AI 🤖 — ${isAmrita ? 'Amrita Eye campus helper' : 'city helper'}. I can help with reporting, BBMP, Estate Office, campus map, AI annotations, community, etc.`, timestamp: new Date().toISOString() },
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
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#A51636] text-white shadow-[0_8px_24px_rgba(165,22,54,0.3)] transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
        title="AI Chatbot — in progress"
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
            className="fixed bottom-28 right-4 z-50 flex h-[480px] w-[90vw] max-w-sm flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-[#1a0f14] sm:bottom-24 sm:right-6 sm:h-[520px]"
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
                  <div className={`max-w-[80%] rounded-[16px] px-3.5 py-2.5 text-[13px] leading-[1.5] ${msg.role === 'user' ? 'bg-[#A51636] text-white' : 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  { label: 'How to report?', icon: Flag },
                  { label: 'BBMP email?', icon: Mail },
                  { label: 'Estate Office?', icon: Building2 },
                  { label: 'Campus map?', icon: MapPin },
                  { label: 'Faculty?', icon: GraduationCap },
                  { label: 'AI annotation?', icon: Sparkles },
                ].map((chip) => (
                  <button key={chip.label} onClick={() => { setInput(chip.label); setTimeout(send, 100); }} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-[#A51636]/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <chip.icon className="h-3 w-3" /> {chip.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about BBMP, Estate, maps, AI..." className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#A51636] dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A51636] text-white shadow-sm hover:bg-[#8a1230]">
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
