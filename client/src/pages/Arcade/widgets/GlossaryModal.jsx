import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

// No AnimatePresence — see CreateRoomModal.jsx for why (its AnimatePresence
// exit was found to sometimes never unmount, leaving an invisible
// click-blocking backdrop). Same fix applied here preemptively since this
// modal shares the identical structure.
export default function GlossaryModal({ show, onClose, items, t }) {
  if (!show) return null;
  return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col border border-slate-200 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2 text-rose-500 font-black">
                <HelpCircle className="h-5 w-5" />
                <h2 className="text-xl uppercase tracking-widest font-mono">{t('itemGlossary')}</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
            </div>

            {/* flex-1 min-h-0 states outright what this needs to do: own the
                scrolling inside a fixed-height (h-[80vh]) column. It already
                behaved (a flex item shrinks by default, and this one has its
                own overflow-y-auto, so it was verified NOT to be clipping
                before this was added) - but relying on default shrink plus
                min-height:auto is exactly the combination that silently stops
                scrolling and starts clipping the moment a header above it
                grows, which is the bug that hit four other panels here. */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-2 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      {t(item.nameKey)}
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black border border-amber-200">
                      🪙 {item.price}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 tracking-wider">
                    {t('type')} {item.type === 'attack' ? t('targetAttack') : item.type === 'aoe' ? t('aoeAttack') : t('selfBuff')}
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
  );
}
