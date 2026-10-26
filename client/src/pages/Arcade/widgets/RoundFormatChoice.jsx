import { useId } from 'react';
import { ROUND_FORMATS } from '../roundKinds.js';

// "Mixed" plays the round kinds (ADR 0010); "classic" writes code every round.
// Shared by the create-room and room-settings popups.
export default function RoundFormatChoice({ value, onChange, choiceClass, t }) {
  const id = useId();
  const options = {
    mixed: { label: t('roundFormatMixed'), hint: t('roundFormatMixedHint') },
    classic: { label: t('roundFormatClassic'), hint: t('roundFormatClassicHint') },
  };
  return (
    <div>
      <p id={`${id}-label`} className="block text-xs font-black text-pysim-label uppercase mb-1">{t('roundFormatLabel')}</p>
      <div role="group" aria-labelledby={`${id}-label`} className="flex gap-2">
        {ROUND_FORMATS.map(format => (
          <button
            key={format}
            type="button"
            aria-pressed={value === format}
            onClick={() => onChange(format)}
            className={`${choiceClass(value === format)} px-2`}
          >
            <span className="block">{options[format].label}</span>
            <span className={`block text-label font-bold ${value === format ? 'text-pysim-on-primary' : 'text-pysim-label'}`}>
              {options[format].hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
