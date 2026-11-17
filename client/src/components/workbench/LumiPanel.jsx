import { useEffect, useRef, useState } from 'react';
import { Send, Square, X } from 'lucide-react';

// Lumi's chat as a side panel of the code workbench (CodeWorkbench.jsx).
// The page owns the conversation (it knows the task and the code to send);
// this only shows it and collects the next question.
//
// messages: [{ role: 'ai' | 'user', text, pending? }]
// quickActions: [{ label, prompt }] - offered until the learner asks something
export default function LumiPanel({
  messages,
  quickActions = [],
  responding = false,
  onSend,
  onStop,
  onClear,
  onClose,
  isThai = true,
}) {
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus({ preventScroll: true }); }, []);

  const words = isThai
    ? { title: 'Lumi ผู้ช่วยเขียนโค้ด', clear: 'ล้างแชท', close: 'ปิดแชท', ask: 'ถามเรื่องโจทย์หรือโค้ดของคุณ…', send: 'ส่งข้อความ', stop: 'หยุดคำตอบ', tryThese: 'ลองถามแบบนี้' }
    : { title: 'Lumi, your coding helper', clear: 'Clear', close: 'Close chat', ask: 'Ask about the task or your code…', send: 'Send', stop: 'Stop', tryThese: 'Try asking' };

  const submit = (text) => {
    const value = String(text ?? draft).trim();
    if (!value || responding) return;
    onSend(value);
    setDraft('');
  };

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/data_MiNiGame/NPC_lumi/lumi_smile.png" alt="" className="h-8 w-8 shrink-0 rounded-full bg-sky-50 object-contain" />
          <span className="truncate text-sm font-bold text-slate-900">{words.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onClear ? (
            <button type="button" onClick={onClear} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              {words.clear}
            </button>
          ) : null}
          <button type="button" onClick={onClose} aria-label={words.close} title={words.close} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                message.role === 'ai'
                  ? `rounded-tl-sm bg-slate-100 text-slate-800 ${message.pending ? 'animate-pulse text-slate-500' : ''}`
                  : 'rounded-tr-sm bg-blue-700 text-white'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {messages.length <= 1 && quickActions.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-slate-500">{words.tryThese}</p>
            {quickActions.map((action) => (
              <button
                key={action.prompt}
                type="button"
                onClick={() => submit(action.prompt)}
                disabled={responding}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => { event.preventDefault(); submit(); }}
        className="flex shrink-0 items-center gap-2 border-t border-slate-200 p-3"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={words.ask}
          aria-label={words.ask}
          disabled={responding}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:opacity-60"
        />
        {responding ? (
          <button type="button" onClick={onStop} aria-label={words.stop} title={words.stop} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100">
            <Square className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" aria-label={words.send} title={words.send} disabled={!draft.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white hover:bg-blue-800 disabled:bg-slate-300">
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </form>
    </>
  );
}
