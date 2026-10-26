import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';
import RoundFormatChoice from './RoundFormatChoice.jsx';

// Built on the shared Dialog; see CreateRoomModal.jsx for the label/group rules.
export default function RoomSettingsModal({ show, onClose, settingsForm, setSettingsForm, onSubmit, occupiedSeats = 0, t }) {
  const id = useId();
  const hasPassword = settingsForm.has_password && !settingsForm.clear_password;
  const occupancyNote = t('maxPlayersBelowOccupancy').replace('{{count}}', String(occupiedSeats));
  return (
    <Dialog open={show} onClose={onClose} titleId={`${id}-title`}
      panelClassName="bg-pysim-card rounded-3xl shadow-2xl max-w-md w-full p-6 border border-pysim-outline-variant space-y-6">
      <div className="flex justify-between items-center border-b border-pysim-outline-variant pb-4">
        <h3 id={`${id}-title`} className="text-lg font-black text-pysim-on-surface">{t('roomSettingsModalTitle')}</h3>
        <button type="button" onClick={onClose} aria-label={t('closeDialogLabel')} className="text-pysim-label hover:text-pysim-on-surface-variant text-2xl w-9 h-9 rounded-xl">&times;</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${id}-name`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roomNameOnlyLabel')}</label>
          <input
            id={`${id}-name`}
            data-autofocus
            type="text"
            value={settingsForm.room_name}
            onChange={(e) => setSettingsForm(prev => ({ ...prev, room_name: e.target.value }))}
            className="w-full bg-pysim-surface border border-pysim-outline-variant px-4 py-2.5 rounded-xl text-xs font-bold text-pysim-on-surface focus:outline-none focus:border-pysim-accent"
          />
        </div>

        <div>
          <p id={`${id}-max`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('maxPlayersLabel')}</p>
          <div role="group" aria-labelledby={`${id}-max`} aria-describedby={occupiedSeats > 2 ? `${id}-max-note` : undefined} className="flex gap-2">
            {[2, 3, 4, 5].map(num => {
              // The server refuses these too; disabling them just saves the round trip.
              const belowOccupancy = num < occupiedSeats;
              return (
                <button
                  key={num}
                  type="button"
                  disabled={belowOccupancy}
                  aria-pressed={settingsForm.max_players === num}
                  title={belowOccupancy ? occupancyNote : undefined}
                  onClick={() => setSettingsForm(prev => ({ ...prev, max_players: num }))}
                  className={`flex-1 min-h-target-primary py-2 rounded-xl font-bold text-xs border transition-all ${
                    belowOccupancy ? 'cursor-not-allowed bg-pysim-surface-container text-pysim-label border-pysim-outline-variant'
                      : settingsForm.max_players === num ? 'bg-pysim-accent-strong text-pysim-on-primary border-pysim-accent-strong'
                        : 'bg-pysim-surface text-pysim-on-surface-variant border-pysim-outline-variant'}`}
                >
                  {num} {t('playersCountUnit')}
                </button>
              );
            })}
          </div>
          {occupiedSeats > 2 && (
            <p id={`${id}-max-note`} className="text-xs font-bold text-pysim-label mt-1.5">{occupancyNote}</p>
          )}
        </div>

        <RoundFormatChoice value={settingsForm.round_format} t={t}
          choiceClass={selected => `flex-1 min-h-target-primary py-2 rounded-xl font-bold text-xs border transition-all ${selected
            ? 'bg-pysim-accent-strong text-pysim-on-primary border-pysim-accent-strong'
            : 'bg-pysim-surface text-pysim-on-surface-variant border-pysim-outline-variant'}`}
          onChange={format => setSettingsForm(prev => ({ ...prev, round_format: format }))} />

        <div>
          <label htmlFor={`${id}-password`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roomPasswordLabel')}</label>
          <p id={`${id}-password-note`} className="text-xs font-bold text-pysim-label mb-1.5">
            {settingsForm.clear_password
              ? t('passwordWillBeRemovedNote')
              : hasPassword ? t('roomHasPasswordNote') : t('roomNoPasswordNote')}
          </p>
          <input
            id={`${id}-password`}
            aria-describedby={`${id}-password-note`}
            type="password"
            placeholder={hasPassword ? t('changePasswordPlaceholder') : t('newPasswordPlaceholder')}
            value={settingsForm.password}
            onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value, clear_password: false }))}
            className="w-full bg-pysim-surface border border-pysim-outline-variant px-4 py-2.5 rounded-xl text-xs font-bold text-pysim-on-surface focus:outline-none focus:border-pysim-accent"
          />
          {settingsForm.has_password && (
            <button
              type="button"
              aria-pressed={Boolean(settingsForm.clear_password)}
              onClick={() => setSettingsForm(prev => ({ ...prev, password: '', clear_password: !prev.clear_password }))}
              className="mt-2 px-3 py-2 rounded-xl text-xs font-bold border border-pysim-outline-variant text-pysim-on-surface-variant bg-pysim-card hover:bg-pysim-surface"
            >
              {settingsForm.clear_password ? t('keepPasswordBtn') : t('removePasswordBtn')}
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-pysim-surface-container text-pysim-label font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
          <button type="submit" className="flex-1 py-3 bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 text-pysim-on-primary font-black text-xs rounded-xl shadow-md">{t('saveSettingsBtn')}</button>
        </div>
      </form>
    </Dialog>
  );
}
