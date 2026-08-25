import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Lock } from 'lucide-react';

// Phase 8.2 — room chat + emoji reactions.
//
// Shown wherever talking is allowed (lobby, round summary, shop intermission)
// and explicitly locked during coding rounds — see the round-phase rule in the
// POST /rooms/:id/chat endpoint. The locked state renders the reason rather
// than simply hiding the panel, so the rule reads as a deliberate design
// choice instead of a missing feature.
export default function ChatPanel({
  messages, emojiSet, chatOpen, sending, sendMessage, sendEmoji, playerName, t
}) {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  // Keep the newest message in view, but only when the reader is already at
  // the bottom — yanking the scroll position while someone is reading back
  // through history is worse than missing one line.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const ok = await sendMessage(draft);
    if (ok) setDraft('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-black text-slate-700">{t('chatTitle')}</h3>
      </div>

      <div ref={listRef} className="flex-1 min-h-[120px] max-h-[260px] overflow-y-auto px-5 py-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-bold">{t('chatEmpty')}</p>
        ) : (
          messages.map((m) => {
            const mine = m.user_name === playerName;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                  {mine ? t('youSuffix') : m.user_name}
                </span>
                {m.kind === 'emoji' ? (
                  <span className="text-2xl leading-tight">{m.emoji}</span>
                ) : (
                  <span className={`px-3 py-1.5 rounded-2xl text-xs font-bold max-w-[85%] break-words ${
                    mine ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {m.message}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {chatOpen ? (
        <div className="border-t border-slate-100">
          <div className="px-4 py-2 flex flex-wrap gap-1.5">
            {emojiSet.map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => sendEmoji(emo)}
                disabled={sending}
                className="text-lg leading-none px-2 py-1 rounded-xl hover:bg-slate-100 active:scale-90 transition-all disabled:opacity-40"
                aria-label={`react ${emo}`}
              >
                {emo}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="px-4 pb-4 flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
              placeholder={t('chatPlaceholder')}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="p-2 rounded-xl bg-rose-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500 transition-all"
              aria-label={t('chatSend')}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>{t('chatLockedDuringRound')}</span>
        </div>
      )}
    </div>
  );
}
