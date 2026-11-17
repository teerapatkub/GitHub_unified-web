import { forwardRef } from 'react';
import { TerminalSquare } from 'lucide-react';

// The output area under the editor: what the code printed, the checker's
// verdict lines, and the input() prompt while the code waits for the learner.
//
// toneOf(line) returns a class for one line; the default reads the ✓ / ✗ marks
// the checkers print and "Error" lines.
const defaultTone = (line) => {
  const text = String(line);
  if (text.startsWith('✓') || text.startsWith('ผ่าน')) return 'font-bold text-emerald-400';
  if (text.startsWith('✗') || text.startsWith('Error') || text.startsWith('System Error')) return 'font-bold text-red-400';
  if (text.startsWith('ควรได้') || text.startsWith('ได้จริง') || text.startsWith('Expected') || text.startsWith('Got')) return 'text-amber-300';
  if (text.startsWith('---') || text.startsWith('กำลัง')) return 'text-sky-300';
  return 'text-slate-200';
};

const OutputPanel = forwardRef(function OutputPanel(
  { title = 'ผลลัพธ์', lines, emptyText, toneOf = defaultTone, children },
  ref,
) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400">
        <TerminalSquare className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </div>
      <div ref={ref} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-6">
        {lines.length === 0 ? <p className="font-sans text-slate-500">{emptyText}</p> : null}
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} className={`whitespace-pre-wrap ${toneOf(line)}`}>{line}</div>
        ))}
        {children}
      </div>
    </>
  );
});

export default OutputPanel;

// The prompt shown while input() waits; Enter sends the line.
export function InputPrompt({ prompt, value, onChange, onEnter }) {
  return (
    <label className="mt-1 flex items-center text-emerald-300">
      <span className="whitespace-pre">{prompt}</span>
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') onEnter(); }}
        className="ml-1 min-w-0 flex-1 bg-transparent text-white outline-none"
        aria-label="ป้อนข้อมูลให้โปรแกรม"
      />
    </label>
  );
}
