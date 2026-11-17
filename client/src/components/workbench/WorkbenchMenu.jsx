import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

// The "⋯" button left of the toolbar: actions a learner needs now and then
// (copy, start over, ask Lumi) kept out of the row that holds Run and Send.
// items: [{ id, icon, label, onClick, disabled }]
export default function WorkbenchMenu({ items, label = 'เครื่องมือเพิ่มเติม' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div role="menu" className="absolute bottom-full left-0 z-40 mb-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {items.filter(Boolean).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { setOpen(false); item.onClick?.(); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {Icon ? <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" /> : null}
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
