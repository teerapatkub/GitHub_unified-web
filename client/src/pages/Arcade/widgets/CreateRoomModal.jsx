import { motion } from 'framer-motion';

// No AnimatePresence here on purpose — it was found to intermittently never
// unmount the exit animation (confirmed in both dev and a production build),
// leaving this backdrop invisible but still catching every click on the room
// lobby underneath. Plain conditional rendering has no such failure mode:
// React removes the node the instant `show` goes false, guaranteed. Losing
// the fade-out on close is an acceptable trade for "the modal always closes."
export default function CreateRoomModal({ show, onClose, createForm, setCreateForm, onSubmit, t }) {
  if (!show) return null;
  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-800">{t('createRoomModalTitle')}</h3>
              <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('roomNamePlaceholder')}
                  value={createForm.room_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, room_name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('maxPlayersLabel')}</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, max_players: num }))}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${createForm.max_players === num ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      {num} {t('playersCountUnit')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase 8.4 — pacing. Both options are fixed for the whole match
                  once the room is created; the server stores them on the room
                  row and every timing/task decision reads them from there. */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roundModeLabel')}</label>
                <div className="flex gap-2">
                  {[
                    { id: 'standard', label: t('roundModeStandard'), hint: t('roundModeStandardHint') },
                    { id: 'quick', label: t('roundModeQuick'), hint: t('roundModeQuickHint') }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, round_duration_mode: mode.id }))}
                      className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs border transition-all ${createForm.round_duration_mode === mode.id ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span className="block">{mode.label}</span>
                      <span className={`block text-[9px] font-bold ${createForm.round_duration_mode === mode.id ? 'text-rose-100' : 'text-slate-400'}`}>
                        {mode.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('difficultyLabel')}</label>
                <div className="flex gap-2">
                  {[
                    { id: 'default', label: t('difficultyDefault') },
                    { id: 'easy', label: t('difficultyEasy') },
                    { id: 'medium', label: t('difficultyMedium') },
                    { id: 'hard', label: t('difficultyHard') }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, difficulty: diff.id }))}
                      className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all ${createForm.difficulty === diff.id ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-slate-400 font-bold">{t('difficultyHint')}</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomPasswordOptionalLabel')}</label>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
                <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md">{t('createNowBtn')}</button>
              </div>
            </form>
          </motion.div>
      </motion.div>
  );
}
