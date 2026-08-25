import { motion } from 'framer-motion';

// No AnimatePresence — see CreateRoomModal.jsx for why (its AnimatePresence
// exit was found to sometimes never unmount, leaving an invisible
// click-blocking backdrop). Same fix applied here preemptively since this
// modal shares the identical structure.
export default function ExitConfirmModal({ show, onCancel, onConfirm, t }) {
  if (!show) return null;
  return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-base font-black text-slate-800">{t('exitConfirmTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t('exitConfirmDesc')}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all">
                {t('exitConfirmStay')}
              </button>
              <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all">
                {t('exitConfirmLeave')}
              </button>
            </div>
          </motion.div>
        </motion.div>
  );
}
