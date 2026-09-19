import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Sparkles, DoorOpen, ArrowLeftRight, Code2, Heart, Rocket, Zap, Star } from 'lucide-react';

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
  portfolio: string;
  placeholder: string;
  funFact: string;
}

const TEAM: TeamMember[] = [
  {
    id: 'archit',
    name: 'Archit',
    role: 'Founder & Visionary',
    animation: 'computer',
    color: '#ffd630',
    emoji: '💻',
    portfolio: 'Professional Vibe Coder And Professional Ragebaiter :)',
    placeholder: 'Building CivicEye with passion — loves clean maps, fixing black space, and making every campus location pinnable. More story coming soon!',
    funFact: 'Turns ideas into live maps at 3am and hates placeholder floor plans.',
  },
  {
    id: 'aswath',
    name: 'Aswath',
    role: 'Design & Experience',
    animation: 'swirl',
    color: '#91dcc4',
    emoji: '🎨',
    portfolio: 'UI/UX Designer & Minimalist',
    placeholder: 'Design obsessed — crafts Apple HIG minimalist UI with maroon vibes. More story coming soon!',
    funFact: 'If it’s not pixel-perfect, it’s not done.',
  },
  {
    id: 'himesh',
    name: 'Himesh',
    role: 'Engineering & Systems',
    animation: 'door',
    color: '#ef6b59',
    emoji: '⚙️',
    portfolio: 'Full-Stack Engineer & Problem Solver',
    placeholder: 'Backend wizard — fixes authority routing and makes campus issues accurate. More story coming soon!',
    funFact: 'Opens doors to features others call impossible.',
  },
  {
    id: 'koushik',
    name: 'Koushik',
    role: 'Product & Innovation',
    animation: 'sliding',
    color: '#a78bfa',
    emoji: '🚀',
    portfolio: 'Product Manager & Innovator',
    placeholder: 'Product thinker — imagined Amrita Eye and the custom campus map. More story coming soon!',
    funFact: 'Slides into solutions from both sides.',
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/80 p-4 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[24px] border border-[#172b44]/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:bg-[#111] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd630] shadow-sm"
              >
                <Rocket className="h-7 w-7 text-[#172b44]" />
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                You found the <span className="text-[#A51636]">secret lab</span>! 🎉
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Built with passion at Amrita Bengaluru by a tiny team that loves clean maps.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                <Code2 className="h-3.5 w-3.5" /> Triple-click logo to open
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.06 }}
                  onHoverStart={() => setHovered(member.id)}
                  onHoverEnd={() => setHovered(null)}
                  className="group relative flex flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: member.color }}>
                      {member.animation === 'computer' ? <Monitor className="h-5 w-5 text-[#172b44]" /> : member.animation === 'swirl' ? <Sparkles className="h-5 w-5 text-[#172b44]" /> : member.animation === 'door' ? <DoorOpen className="h-5 w-5 text-[#172b44]" /> : <ArrowLeftRight className="h-5 w-5 text-[#172b44]" />}
                    </div>
                    <span className="text-xl">{member.emoji}</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{member.role}</p>
                  <p className="mt-1 text-xs font-medium text-[#A51636] dark:text-[#E52B50]">{member.portfolio}</p>

                  <div className="relative mt-3 h-[148px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-black/20">
                    {member.animation === 'computer' ? (
                      <>
                        <div className="absolute inset-x-0 top-0 flex h-7 items-center gap-1 bg-slate-900 px-2.5">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          <span className="h-2 w-2 rounded-full bg-yellow-400" />
                          <span className="h-2 w-2 rounded-full bg-green-400" />
                          <span className="ml-2 font-mono text-[9px] text-white/50">archit — zsh</span>
                        </div>
                        <motion.div
                          initial={{ y: '-100%' }}
                          animate={{ y: hovered === member.id ? '0%' : '-100%' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                          className="absolute inset-x-0 bottom-0 top-7 bg-[#0f172a] p-2.5 font-mono text-[10px] leading-relaxed text-emerald-300"
                        >
                          <div>$ build campus map</div>
                          <div className="text-white/50">✓ 155 faculty</div>
                          <div className="text-[#ffd630]">✓ no black space</div>
                          <div className="mt-1.5 flex items-center gap-1 text-[#ffd630]">
                            <Zap className="h-3 w-3" /> {member.funFact}
                          </div>
                        </motion.div>
                        <AnimatePresence>
                          {hovered !== member.id ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 top-7 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/40">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">Hover me</span>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}

                    {member.animation === 'swirl' ? (
                      <>
                        <motion.div
                          animate={hovered === member.id ? { rotate: 360, scale: 1.15 } : { rotate: 0, scale: 1 }}
                          transition={{ duration: 1, ease: 'easeInOut', repeat: hovered === member.id ? Infinity : 0 }}
                          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-dashed border-[#91dcc4]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={hovered === member.id ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                          className="absolute inset-0 flex items-center justify-center bg-white/90 p-3 text-center backdrop-blur-sm dark:bg-[#111]/90"
                        >
                          <div>
                            <div className="text-2xl">🌀</div>
                            <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{member.funFact}</div>
                          </div>
                        </motion.div>
                        <AnimatePresence>
                          {hovered !== member.id ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/40">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">Hover for swirl</span>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}

                    {member.animation === 'door' ? (
                      <>
                        <div className="absolute inset-0 bg-slate-100 dark:bg-white/5" />
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? '-100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                          className="absolute inset-y-0 left-0 w-[55%] origin-left border-r-2 border-slate-300 bg-[#ffd630] shadow-sm flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <DoorOpen className="h-5 w-5 text-slate-900" />
                            <span className="text-[10px] font-bold uppercase text-slate-900">Door</span>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: hovered === member.id ? 1 : 0, x: hovered === member.id ? 0 : -8 }}
                          transition={{ delay: hovered === member.id ? 0.15 : 0 }}
                          className="absolute inset-0 left-[45%] flex items-center p-3"
                        >
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{member.funFact}</div>
                        </motion.div>
                        <AnimatePresence>
                          {hovered !== member.id ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/40">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">Hover for door</span>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}

                    {member.animation === 'sliding' ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-3 text-center dark:bg-black/20">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{member.funFact}</div>
                        </div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? '-100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                          className="absolute inset-y-0 left-0 w-1/2 border-r-2 border-slate-300 bg-[#a78bfa] flex items-center justify-center"
                        >
                          <ArrowLeftRight className="h-4 w-4 text-white" />
                        </motion.div>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: hovered === member.id ? '100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                          className="absolute inset-y-0 right-0 w-1/2 border-l-2 border-slate-300 bg-[#a78bfa] flex items-center justify-center"
                        >
                          <ArrowLeftRight className="h-4 w-4 text-white" />
                        </motion.div>
                        <AnimatePresence>
                          {hovered !== member.id ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/40">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">Hover for sliding</span>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{member.placeholder}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[18px] bg-slate-900 p-5 text-white dark:bg-black">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Heart className="h-4 w-4 text-rose-400" /> Honorable Mentions
              </h3>
              <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-slate-300">
                <p>
                  <span className="font-bold text-[#ffd630]">Arena.ai</span> — Big thanks to <a href="http://arena.ai" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#91dcc4] underline decoration-[#91dcc4]/30 underline-offset-4 hover:text-white">arena.ai</a> for powering our build. Their Agent Mode helped us ship fast, fix bugs, and keep the map clean and user-friendly. Truly a vibe coding experience! ✨
                </p>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <Star className="h-3.5 w-3.5 text-[#ffd630]" /> Built with passion at Amrita Bengaluru · Made with fun, swirl, door & sliding animations
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#ffd630] px-2.5 py-1 text-[11px] font-bold text-slate-900">No Corners Cut</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">Startup Quality</span>
                <span className="rounded-full bg-[#A51636] px-2.5 py-1 text-[11px] font-semibold text-white">Amrita Bengaluru</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-900">arena.ai ❤️</span>
              </div>
            </div>

            <div className="mt-5 text-center text-[11px] text-slate-500 dark:text-slate-500">
              Triple-click the CivicEye logo to open again · Hover over cards for computer top-down, swirl, door & sliding animations
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
