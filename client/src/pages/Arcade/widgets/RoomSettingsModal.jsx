import { motion as Motion } from 'framer-motion';

// No AnimatePresence — see CreateRoomModal.jsx for why (its AnimatePresence
// exit was found to sometimes never unmount, leaving an invisible
// click-blocking backdrop). Same fix applied here preemptively since this
// modal shares the identical structure.
export default function RoomSettingsModal({ show, onClose, settingsForm, setSettingsForm, onSubmit, occupiedSeats = 0, t }) {
  if (!show) return null;
  const hasPassword = settingsForm.has_password && !settingsForm.clear_password;
  return (
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-800">{t('roomSettingsModalTitle')}</h3>
              <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomNameOnlyLabel')}</label>
                <input
                  type="text"
                  value={settingsForm.room_name}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, room_name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('maxPlayersLabel')}</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map(num => {
                    // The server refuses these too; disabling them just saves the round trip.
                    const belowOccupancy = num < occupiedSeats;
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={belowOccupancy}
                        title={belowOccupancy ? t('maxPlayersBelowOccupancy').replace('{{count}}', String(occupiedSeats)) : undefined}
                        onClick={() => setSettingsForm(prev => ({ ...prev, max_players: num }))}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                          belowOccupancy ? 'cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200'
                            : settingsForm.max_players === num ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        {num} {t('playersCountUnit')}
                      </button>
                    );
                  })}
                </div>
                {occupiedSeats > 2 && (
                  <p className="text-xs font-bold text-slate-600 mt-1.5">
                    {t('maxPlayersBelowOccupancy').replace('{{count}}', String(occupiedSeats))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomPasswordLabel')}</label>
                <p className="text-xs font-bold text-slate-600 mb-1.5">
                  {settingsForm.clear_password
                    ? t('passwordWillBeRemovedNote')
                    : hasPassword ? t('roomHasPasswordNote') : t('roomNoPasswordNote')}
                </p>
                <input
                  type="password"
                  placeholder={hasPassword ? t('changePasswordPlaceholder') : t('newPasswordPlaceholder')}
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value, clear_password: false }))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
                {settingsForm.has_password && (
                  <button
                    type="button"
                    onClick={() => setSettingsForm(prev => ({ ...prev, password: '', clear_password: !prev.clear_password }))}
                    className="mt-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                  >
                    {settingsForm.clear_password ? t('keepPasswordBtn') : t('removePasswordBtn')}
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
                <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md">{t('saveSettingsBtn')}</button>
              </div>
            </form>
          </Motion.div>
      </Motion.div>
  );
}
