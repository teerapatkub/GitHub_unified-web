import { useId } from 'react';

// A predict round (ADR 0010): a short piece of code and one call, and the
// options for what it prints. Answered by tapping, so it plays on a phone with
// no typing. Sits where the editor sits, so the editor's debuffs (Ink Fog,
// Blackout, Mirror Code) cover it too; Freeze arrives as `locked`.
export default function ChoiceRoundPanel({ view, selected, onSelect, locked, t }) {
  const id = useId();
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p id={`${id}-prompt`} className="text-sm font-black text-pysim-on-surface mb-2">{t('predictPrompt')}</p>
        <pre className="rounded-xl bg-pysim-inverse-surface text-pysim-on-inverse text-[13px] leading-[22px] font-mono p-4 overflow-x-auto whitespace-pre">
          {view.code}
          {'\n\n'}
          <span className="text-pysim-inverse-code">{view.call}</span>
        </pre>
      </div>
      <div role="group" aria-labelledby={`${id}-prompt`} className="grid grid-cols-2 gap-2">
        {view.options.map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected === option.id}
            disabled={locked}
            onClick={() => onSelect(option.id)}
            className={`min-h-target-primary rounded-xl border-2 px-4 py-2 text-left font-mono text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${selected === option.id
              ? 'border-pysim-accent-strong bg-pysim-accent-container text-pysim-on-surface'
              : 'border-pysim-outline-variant bg-pysim-card text-pysim-on-surface-variant hover:border-pysim-accent-border'}`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
