import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';

// Built on the shared Dialog. Escape means "stay", and focus starts on "stay"
// so a stray Enter never throws a player out of a live match.
export default function ExitConfirmModal({ show, onCancel, onConfirm, t }) {
  const id = useId();
  return (
        <Dialog open={show} onClose={onCancel} titleId={`${id}-title`}
          overlayClassName="fixed inset-0 z-[60] bg-pysim-on-surface/50 backdrop-blur-sm"
          panelClassName="bg-pysim-card rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-pysim-outline-variant space-y-4 text-center">
            <div className="text-4xl" aria-hidden="true">⚠️</div>
            <h3 id={`${id}-title`} className="text-base font-black text-pysim-on-surface">{t('exitConfirmTitle')}</h3>
            <p className="text-xs text-pysim-label leading-relaxed">{t('exitConfirmDesc')}</p>
            <div className="flex gap-2 pt-2">
              <button type="button" data-autofocus onClick={onCancel} className="flex-1 py-2.5 bg-pysim-surface-container hover:bg-pysim-surface-high text-pysim-label font-bold text-xs rounded-xl transition-all">
                {t('exitConfirmStay')}
              </button>
              <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 text-pysim-on-primary font-black text-xs rounded-xl transition-all">
                {t('exitConfirmLeave')}
              </button>
            </div>
        </Dialog>
  );
}
