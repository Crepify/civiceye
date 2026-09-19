import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Sparkles, DoorOpen, ArrowLeftRight, Code2, Heart, Rocket, Zap } from 'lucide-react';

interface EasterEggModalProps {
  open: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  animation: 'computer' | 'swirl' | 'door' | 'sliding';
  color: string;
  emoji: string;
  placeholder: string;
  funFact: string;
}

const TEAM: TeamMember[] = [
  {
    id: 'you',
    name: 'You',
    role: 'Founder & Visionary',
    animation: 'computer',
    color: '#ffd630',
    emoji: '👨‍💻',
    placeholder: 'Placeholder — your story here. Later you will fill in your journey building CivicEye / Amrita Eye, your passion for fixing cities and campuses, and your favorite bug you fixed at 3am.',
    funFact: 'Built CivicEye to make cities better, one report at a time. Loves turning black space into beautiful maps.',
  },
  {
    id: 'aswath',
    name: 'Aswath',
    role: 'Design & Experience',
    animation: 'swirl',
    color: '#91dcc4',
    emoji: '🌀',
    placeholder: 'Placeholder — Aswath’s story here. Later fill in his design philosophy, his obsession with pixel-perfect UI, and how he made the campus map feel like Apple HIG.',
    funFact: 'Makes UIs swirl into existence. If it’s not minimalist, it’s not Aswath.',
  },
  {
    id: 'himesh',
    name: 'Himesh',
    role: 'Engineering & Systems',
    animation: 'door',
    color: '#ef6b59',
    emoji: '🚪',
    placeholder: 'Placeholder — Himesh’s story here. Later fill in his backend wizardry, how he fixed authority routing, and his love for opening doors to new tech.',
    funFact: 'Opens doors to impossible features. BBMP links? Fixed. Campus map? Shipped.',
  },
  {
    id: 'koushik',
    name: 'Koushik',
    role: 'Product & Innovation',
    animation: 'sliding',
    color: '#a78bfa',
    emoji: '↔️',
    placeholder: 'Placeholder — Koushik’s story here. Later fill in his product thinking, how he imagined Amrita Eye, and his sliding-door approach to solving campus issues.',
    funFact: 'Slides into solutions from both sides. Campus issues only on custom map? Koushik’s idea.',
  },
];

export function EasterEggModal({ open, onClose }: EasterEggModalProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/90 p-4 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92, rotate: -1 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, rotate: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[28px] border-4 border-[#172b44] bg-[#fff8e7] p-6 shadow-[12px_12px_0_#172b44] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#172b44] bg-white text-[#172b44] shadow-[3px_3px_0_#172b44] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#172b44]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#172b44] bg-[#ffd630] shadow-[4px_4px_0_#172b44]"
              >
                <Rocket className="h-8 w-8 text-[#172b44]" />
              </motion.div>
              <h2 className="font-serif text-3xl font-black uppercase tracking-tight text-[#172b44] sm:text-4xl">
                You found the <span className="text-[#ef6b59]">secret lab</span>! 🎉
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#172b44]/70 sm:text-base">
                Welcome to the CivicEye Easter Egg — built with passion at <b>Amrita Bengaluru</b> by a tiny team that hates black space and loves fixing floor plans.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-[#172b44] bg-white px-4 py-1.5 text-xs font-bold text-[#172b44] shadow-[3px_3px_0_#172b44]">
                <Code2 className="h-4 w-4" /> Click logo 3 times to unlock this
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  onHoverStart={() => setHovered(member.id)}
                  onHoverEnd={() => setHovered(null)}
                  className="group relative overflow-hidden rounded-[20px] border-[3px] border-[#172b44] bg-white p-5 shadow-[6px_6px_0_#172b44] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_#172b44]"
                >
                  <div className="absolute right-3 top-3 text-2xl">{member.emoji}</div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#172b44] text-white shadow-[2px_2px_0_#172b44]" style={{ background: member.color }}>
                    {member.animation === 'computer' ? <Monitor className="h-6 w-6 text-[#172b44]" /> : member.animation === 'swirl' ? <Sparkles className="h-6 w-6 text-[#172b44]" /> : member.animation === 'door' ? <DoorOpen className="h-6 w-6 text-[#172b44]" /> : <ArrowLeftRight className="h-6 w-6 text-[#172b44]" />}
                  </div>
                  <h3 className="font-serif text-lg font-black uppercase text-[#172b44]">{member.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#172b44]/50">{member.role}</p>

                  {/* Animation containers */}
                  <div className="relative mt-4 h-[160px] overflow-hidden rounded-xl border-2 border-[#172b44]/10 bg-[#fff8e7]">
                    {/* Computer screen top-down for you */}
                    {member.animation === 'computer' ? (
                      <>
                        <div className="absolute inset-x-0 top-0 h-8 bg-[#172b44] flex items-center gap-1 px-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#ef6b59]" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#ffd630]" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#91dcc4]" />
                          <span className="ml-2 text-[10px] font-bold text-white/60">civiceye — bash</span>
                        </div>
                        <motion.div
                          initial={{ y: '-100%' }}
                          animate={{ y: hovered === member.id ? '0%' : '-100%' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="absolute inset-x-0 top-8 bottom-0 bg-[#0f172a] p-3 font-mono text-[11px] leading-relaxed text-emerald-300"
                        >
                          <div>$ npm run build</div>
                          <div className="text-white/60">✓ 2536 modules transformed</div>
                          <div className="text-[#ffd630]">✓ built in 14s — no black space!</div>
                          <div className="mt-2 text-sky-300">$ fix floor plans</div>
                          <div className="text-white/60">→ A Block 1st floor from your photos</div>
                          <div className="text-white/60">→ E Block square 50.8×50.8m</div>
                          <div className="mt-2 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-[#ffd630]" /> <span className="text-[#ffd630]">You rock!</span>
                          </div>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#172b44] shadow">Hover for computer screen top-down</span>
                        </div>
                      </>
                    ) : null}

                    {/* Swirl for Aswath */}
                    {member.animation === 'swirl' ? (
                      <>
                        <motion.div
                          animate={hovered === member.id ? { rotate: 360, scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
                          transition={{ duration: 1.2, ease: 'easeInOut', repeat: hovered === member.id ? Infinity : 0 }}
                          className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed border-[#91dcc4]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={hovered === member.id ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="absolute inset-0 flex items-center justify-center bg-white/90 p-3 text-center"
                        >
                          <div>
                            <div className="text-3xl">🌀</div>
                            <div className="mt-1 text-xs font-bold text-[#172b44]">Swirl magic!</div>
                            <div className="mt-1 text-[11px] text-[#172b44]/60">{member.funFact}</div>
                          </div>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#172b44] shadow">Hover for swirl</span>
                        </div>
                      </>
                    ) : null}

                    {/* Door open for Himesh */}
                    {member.animation === 'door' ? (
                      <>
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-[#ef6b59] border-r-2 border-[#172b44] flex items-center justify-center">
                          <DoorOpen className="h-6 w-6 text-white" />
                        </div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? -120 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[#ffd630] border-r-4 border-[#172b44] flex items-center justify-center shadow-[4px_0_0_#172b44]"
                          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <DoorOpen className="h-6 w-6 text-[#172b44]" />
                            <span className="text-[10px] font-black uppercase text-[#172b44]">Door</span>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hovered === member.id ? 1 : 0 }}
                          className="absolute inset-0 left-[40%] flex items-center justify-center p-3"
                        >
                          <div className="text-center">
                            <div className="text-xs font-bold text-[#172b44]">Opened!</div>
                            <div className="mt-1 text-[11px] text-[#172b44]/60">{member.funFact}</div>
                          </div>
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#172b44] shadow">Hover for door open</span>
                        </div>
                      </>
                    ) : null}

                    {/* Sliding door both sides for Koushik */}
                    {member.animation === 'sliding' ? (
                      <>
                        <div className="absolute inset-0 bg-[#f1f5f9] flex items-center justify-center p-3 text-center">
                          <div>
                            <div className="text-xs font-bold text-[#172b44]">Sliding reveal!</div>
                            <div className="mt-1 text-[11px] text-[#172b44]/60">{member.funFact}</div>
                          </div>
                        </div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? '-100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                          className="absolute inset-y-0 left-0 w-1/2 bg-[#a78bfa] border-r-4 border-[#172b44] flex items-center justify-center"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-white" />
                        </motion.div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? '100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                          className="absolute inset-y-0 right-0 w-1/2 bg-[#a78bfa] border-l-4 border-[#172b44] flex items-center justify-center"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-white" />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#172b44] shadow">Hover for sliding both sides</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-xl bg-[#fff8e7] p-3 border border-[#172b44]/10">
                    <p className="text-xs leading-relaxed text-[#172b44]/70">{member.placeholder}</p>
                    <p className="mt-2 text-[11px] font-bold text-[#172b44]/50">Fun: {member.funFact}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[20px] border-[3px] border-[#172b44] bg-[#0f172a] p-6 text-white shadow-[6px_6px_0_#172b44]">
              <h3 className="flex items-center gap-2 font-serif text-xl font-black uppercase text-white">
                <Heart className="h-5 w-5 text-[#ef6b59]" /> Honorable Mentions
              </h3>
              <div className="mt-3 grid gap-4 text-sm leading-relaxed text-white/70 sm:grid-cols-2">
                <div>
                  <b className="text-[#ffd630]">Arena.ai — Agent Mode</b> — This entire CivicEye / Amrita Eye campus map (custom campus map ONLY for Amrita Eye, no Google Maps, 155 faculty, every location pinnable, tentative floor plans from your photos + E Block square + halls in E Block + Google Maps shapes + classrooms facing correct) was built with <a href="http://arena.ai" target="_blank" rel="noopener noreferrer" className="text-[#91dcc4] underline hover:text-white">arena.ai</a> Agent Mode — a helpful agentic assistant with tool access. It uses many models including Claude, ChatGPT, Gemini, Grok, Qwen, Kimi. It verified builds (tsc + eslint + vite), rebuilt civiceye.zip, pushed to GitHub `Crepify/civiceye`, and helped fix all floor plans not showing, black space, overlap artifacts, satellite overlay, campus issue accuracy, and cleaned all developer references for whole site.
                </div>
                <div>
                  <b className="text-[#91dcc4]">OpenStreetMap + Esri</b> — Real building footprints, zones, roads, gates from OSM, satellite from Esri World Imagery — not Google Maps (ToS forbids tracing). Amrita.edu for halls, library, faculty. Your photos for A Block 1st floor accurate layout (open corridor south with railings facing fountain, rooms north wooden doors, Akshaya Hall, Indo-US blue curved wall).
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#ffd630] px-3 py-1 text-xs font-black uppercase text-[#172b44]">No Corners Cut</span>
                <span className="rounded-full bg-[#91dcc4] px-3 py-1 text-xs font-bold text-[#172b44]">Startup Quality</span>
                <span className="rounded-full bg-[#ef6b59] px-3 py-1 text-xs font-bold text-white">Built with Passion</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0f172a]">arena.ai ❤️</span>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-[#172b44]/50">
              Triple-click the CivicEye logo to open this again. Made with fun, swirl, door, and sliding door animations for Aswath, Himesh, Koushik, and you.
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
