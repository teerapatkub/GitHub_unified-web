import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';

// Built on the shared Dialog. A <form> so Enter submits the password.
export default function PasswordPromptModal({ prompt, onClose, inputPassword, setInputPassword, onConfirm, t }) {
  const id = useId();
  return (
      <Dialog open={Boolean(prompt)} onClose={onClose} titleId={`${id}-title`}
        panelClassName="bg-pysim-card rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-pysim-outline-variant text-center">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
            <h3 id={`${id}-title`} className="text-base font-black text-pysim-on-surface">{t('passwordPromptTitle')}</h3>
            <p id={`${id}-desc`} className="text-xs text-pysim-label">{t('passwordPromptDescPrefix')} "{prompt?.room_name}" {t('passwordPromptDescSuffix')}</p>
            <input
              data-autofocus
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-desc`}
              type="password"
              placeholder={t('enterRoomPasswordPlaceholder')}
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-pysim-surface border border-pysim-outline-variant px-4 py-2.5 rounded-xl text-xs font-bold text-pysim-on-surface focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-pysim-surface-container text-pysim-label font-bold text-xs rounded-xl">{t('cancelBtn')}</button>
              <button type="submit" className="flex-1 py-2.5 bg-pysim-accent-strong text-pysim-on-primary font-black text-xs rounded-xl">{t('confirmBtn')}</button>
            </div>
          </form>
      </Dialog>
  );
}
