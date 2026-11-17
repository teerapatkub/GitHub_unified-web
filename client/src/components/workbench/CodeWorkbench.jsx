import { useEffect, useState } from 'react';
import { BookOpenText, Code2 } from 'lucide-react';
import { ACCENTS } from './accents.js';

// The one coding screen shared by Exercise, Debug Lab and Challenge.
//
//   ┌ brief (the task, help) ┬ file tabs ──────────────┬ Lumi (when open) ┐
//   │                        │ editor                  │                  │
//   │                        │ ⋯  ·········  Run  Send │                  │
//   │                        │ output                  │                  │
//   └ footer: problem list · title · progress ··· back / next ───────────────┘
//
// The three pages used to be two different layouts that drifted apart (Lumi
// floated over the code in one, was hidden below 1280px in the other). Lumi is
// now a column that pushes the editor aside on a wide screen and covers the
// code area only on a phone, where there is no room beside it; both have a
// close button and Esc.
//
// On a phone the brief and the code swap with a two-way switch instead of
// stacking: stacked, the editor was squeezed to a sliver under the brief.


export default function CodeWorkbench({
  accent = 'blue',
  brief,
  fileTabs,
  editor,
  toolbarStart,
  toolbarEnd,
  terminal,
  footer,
  lumiOpen = false,
  lumiPanel = null,
  onLumiClose,
  isThai = true,
}) {
  const [phoneView, setPhoneView] = useState('brief');
  const tone = ACCENTS[accent] || ACCENTS.blue;

  useEffect(() => {
    if (!lumiOpen || !onLumiClose) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onLumiClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lumiOpen, onLumiClose]);

  const switchButton = (id, label, icon) => {
    const Icon = icon;
    return (
    <button
      type="button"
      onClick={() => setPhoneView(id)}
      aria-pressed={phoneView === id}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-colors ${
        phoneView === id ? `bg-white shadow-sm ${tone.text}` : 'text-slate-500'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="flex shrink-0 gap-1 border-b border-slate-200 bg-slate-100 p-1 lg:hidden">
        {switchButton('brief', isThai ? 'โจทย์' : 'Task', BookOpenText)}
        {switchButton('code', isThai ? 'เขียนโค้ด' : 'Code', Code2)}
      </div>

      <div
        className={`relative grid min-h-0 flex-1 grid-cols-1 ${
          lumiOpen
            ? 'lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_340px]'
            : 'lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]'
        }`}
      >
        <aside
          className={`min-h-0 overflow-y-auto border-slate-200 bg-slate-50/80 lg:block lg:border-r ${
            phoneView === 'brief' ? 'block' : 'hidden'
          }`}
        >
          {brief}
        </aside>

        <section
          className={`min-h-0 min-w-0 flex-col lg:flex ${phoneView === 'code' ? 'flex' : 'hidden'}`}
        >
          {fileTabs ? (
            <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 pt-1.5">
              {fileTabs}
            </div>
          ) : null}
          <div className="relative min-h-[180px] flex-1 overflow-hidden">{editor}</div>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-2 py-2 sm:px-3">
            <div className="flex items-center gap-1.5">{toolbarStart}</div>
            <div className="flex items-center gap-1.5">{toolbarEnd}</div>
          </div>
          <div className="flex h-32 shrink-0 flex-col border-t border-slate-800 bg-[#0b1220] sm:h-40 xl:h-44">
            {terminal}
          </div>
        </section>

        {lumiOpen && lumiPanel ? (
          <aside
            aria-label={isThai ? 'แชทกับ Lumi' : 'Chat with Lumi'}
            className="absolute inset-0 z-30 flex min-h-0 flex-col border-slate-200 bg-white lg:static lg:z-auto lg:border-l"
          >
            {lumiPanel}
          </aside>
        ) : null}
      </div>

      {footer ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white px-2 py-2 sm:px-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

// A file tab in the strip above the editor.
export function FileTab({ name, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`shrink-0 rounded-t-lg border border-b-0 px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
        active ? 'border-slate-200 bg-white text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {name}
    </button>
  );
}

// A heading for one part of the brief ("โจทย์", "ช่วยเหลือ").
export function BriefHeading({ children }) {
  return (
    <h2 className="border-y border-slate-200 bg-slate-100/80 px-5 py-2 text-sm font-bold text-slate-700">
      {children}
    </h2>
  );
}

// Toolbar buttons: the quiet one (Run) and the filled one (Send). Only one
// filled button per toolbar, so the next step is never in doubt.
export function ToolButton({ icon: Icon, children, onClick, disabled, primary = false, accent = 'blue', busy = false, ...rest }) {
  const tone = ACCENTS[accent] || ACCENTS.blue;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed ${tone.ring} ${
        primary ? tone.solid : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
      }`}
      {...rest}
    >
      {Icon ? <Icon className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
