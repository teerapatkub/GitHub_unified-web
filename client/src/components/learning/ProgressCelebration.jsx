import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Coins, Sparkles, Star, Trophy } from 'lucide-react';

const MOTION_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

export default function ProgressCelebration({ event, onClose }) {
  const prefersReducedMotion = useReducedMotion();

  if (!event) return null;

  const isLevelUp = event.type === 'levelup';

  return (
    <AnimatePresence>
      <motion.div
        key={event.id}
        className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.25 }}
      >
        <motion.div
          className={`absolute inset-0 ${
            isLevelUp
              ? 'bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.26),transparent_36%),rgba(2,6,23,0.76)]'
              : 'bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.2),transparent_32%),rgba(15,23,42,0.62)]'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 24 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
          transition={MOTION_TRANSITION}
          className={`relative w-full ${isLevelUp ? 'max-w-[720px]' : 'max-w-[560px]'} overflow-hidden rounded-[32px] border ${
            isLevelUp ? 'border-amber-200/60' : 'border-white/70'
          } bg-white shadow-[0_36px_120px_rgba(15,23,42,0.26)]`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-40 ${
              isLevelUp
                ? 'bg-[linear-gradient(180deg,rgba(250,204,21,0.34),rgba(255,255,255,0))]'
                : 'bg-[linear-gradient(180deg,rgba(96,165,250,0.24),rgba(255,255,255,0))]'
            }`}
          />

          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-amber-200/45 blur-3xl"
                animate={{ x: [0, 22, 0], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5.4, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-200/40 blur-3xl"
                animate={{ x: [0, -20, 0], y: [0, 18, 0] }}
                transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut' }}
              />
            </>
          )}

          <div className="relative px-8 pb-8 pt-10 sm:px-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.8, rotate: -6, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
                transition={{ ...MOTION_TRANSITION, delay: prefersReducedMotion ? 0 : 0.08 }}
                className={`mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] ${
                  isLevelUp
                    ? 'bg-[linear-gradient(135deg,#facc15,#fb7185)] text-slate-950 shadow-[0_18px_48px_rgba(250,204,21,0.35)]'
                    : 'bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-white shadow-[0_18px_48px_rgba(37,99,235,0.32)]'
                }`}
              >
                {isLevelUp ? <Trophy size={36} /> : <Sparkles size={36} />}
              </motion.div>

              <motion.p
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ ...MOTION_TRANSITION, delay: prefersReducedMotion ? 0 : 0.12 }}
                className={`text-xs font-black uppercase tracking-[0.32em] ${
                  isLevelUp ? 'text-amber-700' : 'text-blue-600'
                }`}
              >
                {isLevelUp ? 'Level Promotion' : 'Quest Complete'}
              </motion.p>

              <motion.h2
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ ...MOTION_TRANSITION, delay: prefersReducedMotion ? 0 : 0.18 }}
                className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl"
              >
                {event.title}
              </motion.h2>

              {event.subtitle ? (
                <motion.p
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ ...MOTION_TRANSITION, delay: prefersReducedMotion ? 0 : 0.24 }}
                  className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base"
                >
                  {event.subtitle}
                </motion.p>
              ) : null}

              <div className={`mt-8 grid w-full gap-4 ${isLevelUp ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {event.rewards?.xp ? (
                  <CelebrationStat
                    icon={<Star size={18} />}
                    label="XP"
                    value={`+${event.rewards.xp}`}
                    tone={isLevelUp ? 'amber' : 'blue'}
                  />
                ) : null}
                {event.rewards?.coins ? (
                  <CelebrationStat
                    icon={<Coins size={18} />}
                    label="Coins"
                    value={`+${event.rewards.coins}`}
                    tone={isLevelUp ? 'amber' : 'blue'}
                  />
                ) : null}
                {isLevelUp ? (
                  <CelebrationStat
                    icon={<ArrowUp size={18} />}
                    label="Level"
                    value={`LV ${event.previousLevel} → LV ${event.newLevel}`}
                    tone="rose"
                  />
                ) : null}
              </div>

              {event.tierLabel ? (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                  <Sparkles size={15} className={isLevelUp ? 'text-amber-500' : 'text-blue-500'} />
                  {event.tierLabel}
                </div>
              ) : null}

              <motion.button
                type="button"
                onClick={onClose}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className={`mt-8 inline-flex min-w-[180px] items-center justify-center rounded-2xl px-6 py-3 text-sm font-black ${
                  isLevelUp
                    ? 'bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-white shadow-[0_14px_30px_rgba(245,158,11,0.28)]'
                    : 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]'
                }`}
              >
                ไปต่อ
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CelebrationStat({ icon, label, value, tone = 'blue' }) {
  const toneMap = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`rounded-3xl border px-4 py-4 text-left ${toneMap[tone] || toneMap.blue}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-lg font-black tracking-tight sm:text-xl">{value}</p>
    </div>
  );
}
