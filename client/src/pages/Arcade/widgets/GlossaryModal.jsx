import { useId } from 'react';
import { HelpCircle } from 'lucide-react';
import Dialog from '../../../components/ui/Dialog.jsx';

// Built on the shared Dialog (Escape closes it, focus returns to the "?" button).
// Covers only the content area, not the header, so it stays `absolute`.
export default function GlossaryModal({ show, onClose, items, t }) {
  const id = useId();
  return (
          <Dialog
            open={show}
            onClose={onClose}
            titleId={`${id}-title`}
            overlayClassName="absolute inset-0 z-50 bg-pysim-on-surface/40 backdrop-blur-sm"
            panelMotion={{ initial: { scale: 0.95, y: 15 }, animate: { scale: 1, y: 0 } }}
            panelClassName="bg-pysim-card rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col border border-pysim-outline-variant overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-pysim-outline-variant bg-pysim-surface">
              <div className="flex items-center space-x-2 text-pysim-accent-strong font-black">
                <HelpCircle className="h-5 w-5" />
                <h2 id={`${id}-title`} className="text-xl uppercase tracking-widest font-mono">{t('itemGlossary')}</h2>
              </div>
              <button type="button" onClick={onClose} aria-label={t('closeDialogLabel')} className="text-pysim-label hover:text-pysim-on-surface-variant text-3xl font-light w-10 h-10 rounded-xl">&times;</button>
            </div>

            {/* flex-1 min-h-0 states outright what this needs to do: own the
                scrolling inside a fixed-height (h-[80vh]) column. It already
                behaved (a flex item shrinks by default, and this one has its
                own overflow-y-auto, so it was verified NOT to be clipping
                before this was added) - but relying on default shrink plus
                min-height:auto is exactly the combination that silently stops
                scrolling and starts clipping the moment a header above it
                grows, which is the bug that hit four other panels here. */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-pysim-surface p-5 rounded-2xl border border-pysim-outline-variant flex flex-col gap-2 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-black text-pysim-on-surface flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      {t(item.nameKey)}
                    </div>
                    <span className="bg-pysim-warning-container text-pysim-warning-strong px-3 py-1 rounded-xl text-xs font-black border border-pysim-warning-border">
                      🪙 {item.price}
                    </span>
                  </div>
                  <div className="text-label font-black text-pysim-label tracking-wider">
                    {t('type')} {item.type === 'attack' ? t('targetAttack') : item.type === 'aoe' ? t('aoeAttack') : t('selfBuff')}
                  </div>
                  <p className="text-pysim-label text-xs mt-1 leading-relaxed">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </Dialog>
  );
}
