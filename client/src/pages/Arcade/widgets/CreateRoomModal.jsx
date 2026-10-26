import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';
import RoundFormatChoice from './RoundFormatChoice.jsx';

// Built on the shared Dialog (role, focus trap, Escape, focus return). Choice
// rows are role="group" with aria-pressed buttons so a screen reader hears
// which option is selected, and every text field has a bound <label>.
export default function CreateRoomModal({ show, onClose, createForm, setCreateForm, onSubmit, t }) {
  const id = useId();
  const choice = (selected) => `flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${selected ? 'bg-pysim-accent-strong text-pysim-on-primary border-pysim-accent-strong' : 'bg-pysim-surface text-pysim-on-surface-variant border-pysim-outline-variant'}`;

  return (
    <Dialog open={show} onClose={onClose} titleId={`${id}-title`}
      panelClassName="bg-pysim-card rounded-3xl shadow-2xl max-w-md w-full p-6 border border-pysim-outline-variant space-y-6">
      <div className="flex justify-between items-center border-b border-pysim-outline-variant pb-4">
        <h3 id={`${id}-title`} className="text-lg font-black text-pysim-on-surface">{t('createRoomModalTitle')}</h3>
        <button type="button" onClick={onClose} aria-label={t('closeDialogLabel')} className="text-pysim-label hover:text-pysim-on-surface-variant text-2xl w-9 h-9 rounded-xl">&times;</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${id}-name`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roomNameLabel')}</label>
          <input
            id={`${id}-name`}
            data-autofocus
            type="text"
            required
            placeholder={t('roomNamePlaceholder')}
            value={createForm.room_name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, room_name: e.target.value }))}
            className="w-full bg-pysim-surface border border-pysim-outline-variant px-4 py-2.5 rounded-xl text-xs font-bold text-pysim-on-surface focus:outline-none focus:border-pysim-accent"
          />
        </div>

        <div>
          <p id={`${id}-max`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('maxPlayersLabel')}</p>
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
          <p id={`${id}-mode`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roundModeLabel')}</p>
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
                <span className={`block text-label font-bold ${createForm.round_duration_mode === mode.id ? 'text-pysim-on-primary' : 'text-pysim-label'}`}>
                  {mode.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <RoundFormatChoice value={createForm.round_format} t={t} choiceClass={choice}
          onChange={format => setCreateForm(prev => ({ ...prev, round_format: format }))} />

        <div>
          <p id={`${id}-difficulty`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('difficultyLabel')}</p>
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
                className={`${choice(createForm.difficulty === diff.id)} text-label`}
              >
                {diff.label}
              </button>
            ))}
          </div>
          <p id={`${id}-difficulty-hint`} className="mt-1 text-label text-pysim-label font-bold">{t('difficultyHint')}</p>
        </div>

        <div>
          <label htmlFor={`${id}-password`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roomPasswordOptionalLabel')}</label>
          <input
            id={`${id}-password`}
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={createForm.password}
            onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
            className="w-full bg-pysim-surface border border-pysim-outline-variant px-4 py-2.5 rounded-xl text-xs font-bold text-pysim-on-surface focus:outline-none focus:border-pysim-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-pysim-surface-container text-pysim-label font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
          <button type="submit" className="flex-1 py-3 bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 text-pysim-on-primary font-black text-xs rounded-xl shadow-md">{t('createNowBtn')}</button>
        </div>
      </form>
    </Dialog>
  );
}
