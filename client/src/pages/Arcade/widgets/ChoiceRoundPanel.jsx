import { useId } from 'react';

// A choice round (ADR 0010), answered by tapping, so it plays on a phone with
// no typing. Sits where the editor sits, so the editor's debuffs (Ink Fog,
// Blackout, Mirror Code) cover it too; Freeze arrives as `locked`.
// - predict: a short piece of code and one call; the options are what it prints.
// - review: the options are answers "from the AI"; pick the one that passes
//   every test.
export default function ChoiceRoundPanel({ view, selected, onSelect, locked, t }) {
  const id = useId();
  if (!view.call) return <ReviewOptions view={view} selected={selected} onSelect={onSelect} locked={locked} t={t} id={id} />;
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

const optionClass = active => `rounded-xl border-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${active
  ? 'border-pysim-accent-strong bg-pysim-accent-container'
  : 'border-pysim-outline-variant bg-pysim-card hover:border-pysim-accent-border'}`;

function ReviewOptions({ view, selected, onSelect, locked, t, id }) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <p id={`${id}-prompt`} className="text-sm font-black text-pysim-on-surface">{t('reviewPrompt')}</p>
      <div role="group" aria-labelledby={`${id}-prompt`} className="space-y-3">
        {view.options.map((option, i) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected === option.id}
            disabled={locked}
            onClick={() => onSelect(option.id)}
            className={`${optionClass(selected === option.id)} block w-full p-3`}
          >
            <span className="mb-2 inline-block rounded-md bg-pysim-info-container px-2 py-0.5 text-label font-black text-pysim-info-strong">
              {t('aiAnswerLabel').replace('{{n}}', String(i + 1))}
            </span>
            <pre className="overflow-x-auto whitespace-pre font-mono text-[13px] leading-[20px] text-pysim-on-surface">{option.code}</pre>
          </button>
        ))}
      </div>
    </div>
  );
}
