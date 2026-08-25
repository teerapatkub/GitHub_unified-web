import { motion } from 'framer-motion';

// No AnimatePresence — see CreateRoomModal.jsx for why (its AnimatePresence
// exit was found to sometimes never unmount, leaving an invisible
// click-blocking backdrop). Same fix applied here preemptively since this
// modal shares the identical structure.
export default function PasswordPromptModal({ prompt, onClose, inputPassword, setInputPassword, onConfirm, t }) {
  if (!prompt) return null;
  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 text-center">
            <h3 className="text-base font-black text-slate-800">{t('passwordPromptTitle')}</h3>
            <p className="text-xs text-slate-400">{t('passwordPromptDescPrefix')} "{prompt.room_name}" {t('passwordPromptDescSuffix')}</p>
            <input
              type="password"
              placeholder={t('enterRoomPasswordPlaceholder')}
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
              <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white font-black text-xs rounded-xl">{t('confirmBtn')}</button>
            </div>
          </motion.div>
      </motion.div>
  );
}
