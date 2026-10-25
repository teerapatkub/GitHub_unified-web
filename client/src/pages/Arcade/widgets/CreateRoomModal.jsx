import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';

// Built on the shared Dialog (role, focus trap, Escape, focus return). Choice
// rows are role="group" with aria-pressed buttons so a screen reader hears
// which option is selected, and every text field has a bound <label>.
export default function CreateRoomModal({ show, onClose, createForm, setCreateForm, onSubmit, t }) {
  const id = useId();
  const choice = (selected) => `flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${selected ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`;

  return (
    <Dialog open={show} onClose={onClose} titleId={`${id}-title`}
      panelClassName="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 id={`${id}-title`} className="text-lg font-black text-slate-800">{t('createRoomModalTitle')}</h3>
        <button type="button" onClick={onClose} aria-label={t('closeDialogLabel')} className="text-slate-500 hover:text-slate-700 text-2xl w-9 h-9 rounded-xl">&times;</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${id}-name`} className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomNameLabel')}</label>
          <input
            id={`${id}-name`}
            data-autofocus
            type="text"
            required
            placeholder={t('roomNamePlaceholder')}
            value={createForm.room_name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, room_name: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <p id={`${id}-max`} className="block text-xs font-black text-slate-600 uppercase mb-1">{t('maxPlayersLabel')}</p>
          <div role="group" aria-labelledby={`${id}-max`} className="flex gap-2">
            {[2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                aria-pressed={createForm.max_players === num}
                onClick={() => setCreateForm(prev => ({ ...prev, max_players: num }))}
                className={choice(createForm.max_players === num)}
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
          <p id={`${id}-mode`} className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roundModeLabel')}</p>
          <div role="group" aria-labelledby={`${id}-mode`} className="flex gap-2">
            {[
              { id: 'standard', label: t('roundModeStandard'), hint: t('roundModeStandardHint') },
              { id: 'quick', label: t('roundModeQuick'), hint: t('roundModeQuickHint') }
            ].map(mode => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={createForm.round_duration_mode === mode.id}
                onClick={() => setCreateForm(prev => ({ ...prev, round_duration_mode: mode.id }))}
                className={`${choice(createForm.round_duration_mode === mode.id)} px-2`}
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
          <p id={`${id}-difficulty`} className="block text-xs font-black text-slate-600 uppercase mb-1">{t('difficultyLabel')}</p>
          <div role="group" aria-labelledby={`${id}-difficulty`} aria-describedby={`${id}-difficulty-hint`} className="flex gap-2">
            {[
              { id: 'default', label: t('difficultyDefault') },
              { id: 'easy', label: t('difficultyEasy') },
              { id: 'medium', label: t('difficultyMedium') },
              { id: 'hard', label: t('difficultyHard') }
            ].map(diff => (
              <button
                key={diff.id}
                type="button"
                aria-pressed={createForm.difficulty === diff.id}
                onClick={() => setCreateForm(prev => ({ ...prev, difficulty: diff.id }))}
                className={`${choice(createForm.difficulty === diff.id)} text-[11px]`}
              >
                {diff.label}
              </button>
            ))}
          </div>
          <p id={`${id}-difficulty-hint`} className="mt-1 text-[10px] text-slate-400 font-bold">{t('difficultyHint')}</p>
        </div>

        <div>
          <label htmlFor={`${id}-password`} className="block text-xs font-black text-slate-600 uppercase mb-1">{t('roomPasswordOptionalLabel')}</label>
          <input
            id={`${id}-password`}
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
    </Dialog>
  );
}
