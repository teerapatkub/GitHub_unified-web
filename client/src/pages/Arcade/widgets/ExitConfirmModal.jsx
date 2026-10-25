import { useId } from 'react';
import Dialog from '../../../components/ui/Dialog.jsx';

// Built on the shared Dialog. Escape means "stay", and focus starts on "stay"
// so a stray Enter never throws a player out of a live match.
export default function ExitConfirmModal({ show, onCancel, onConfirm, t }) {
  const id = useId();
  return (
        <Dialog open={show} onClose={onCancel} titleId={`${id}-title`}
          overlayClassName="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm"
          panelClassName="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 text-center">
            <div className="text-4xl" aria-hidden="true">⚠️</div>
            <h3 id={`${id}-title`} className="text-base font-black text-slate-800">{t('exitConfirmTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t('exitConfirmDesc')}</p>
            <div className="flex gap-2 pt-2">
              <button type="button" data-autofocus onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all">
                {t('exitConfirmStay')}
              </button>
              <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all">
                {t('exitConfirmLeave')}
              </button>
            </div>
        </Dialog>
  );
}
