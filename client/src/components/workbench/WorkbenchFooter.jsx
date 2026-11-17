import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, List } from 'lucide-react';

// The bar under the workbench: where you are (title, "ข้อ 2 / 5", passed?),
// the list of the other problems, and the way back or on.
//
// items (optional): [{ id, label, done, active, onSelect }] - the problem list
// back / next: { label, onClick, disabled } - either may be left out
// extra: anything else that belongs on the right (Debug Lab's "new task")
export default function WorkbenchFooter({ title, meta, done, doneLabel = 'ผ่านแล้ว', items, listLabel = 'โจทย์ทั้งหมด', back, next, extra }) {
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
    <>
      <div ref={rootRef} className="relative flex min-w-0 items-center gap-2">
        {items?.length ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={listLabel}
            title={listLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <List className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <span className="truncate">{meta}</span>
            {done ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {doneLabel}
              </span>
            ) : null}
          </p>
        </div>

        {open ? (
          <div className="absolute bottom-full left-0 z-40 mb-2 max-h-[60vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <p className="px-2 pb-1 pt-1.5 text-xs font-bold text-slate-500">{listLabel}</p>
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setOpen(false); item.onSelect(); }}
                aria-current={item.active ? 'true' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                  item.active ? 'bg-blue-50 font-bold text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {extra}
        {back ? (
          <button
            type="button"
            onClick={back.onClick}
            disabled={back.disabled}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{back.label}</span>
          </button>
        ) : null}
        {next ? (
          <button
            type="button"
            onClick={next.onClick}
            disabled={next.disabled}
            className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              next.highlight ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{next.label}</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </>
  );
}
