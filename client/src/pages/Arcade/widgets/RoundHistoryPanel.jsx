import { useEffect, useState } from 'react';
import { API_BASE } from '../../../config/api.js';

// Phase 8.3 — "review your code" panel on the RESULT screen. Shows what this
// player submitted each round, with the same three-part breakdown the round
// score is actually made of (test cases / measured quality / time), so the
// number they were given is explainable rather than mysterious.
//
// Only ever contains the viewing player's own rounds — the endpoint behind it
// is scoped per user on purpose, so the end of a match doesn't hand everyone
// else's solutions out as an answer key.
export default function RoundHistoryPanel({ history, t }) {
  const [openRound, setOpenRound] = useState(null);

  if (!history || history.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">{t('roundHistoryTitle')}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('roundHistorySubtitle')}</p>
      </div>

      {history.map((row) => {
        const isOpen = openRound === row.round_num;
        return (
          <div key={row.round_num} className="border-b border-slate-100 last:border-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenRound(isOpen ? null : row.round_num)}
              className="w-full flex flex-col items-stretch gap-3 px-4 py-4 text-left hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
            >
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  {t('roundLabelShort')} {row.round_num}
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[11px] text-slate-500 sm:flex sm:flex-wrap sm:gap-x-4">
                  <span><b className="text-slate-700">{t('testsResultLabel')}:</b> {row.pass_count}/{row.total_count}</span>
                  <span><b className="text-slate-700">{t('qualityScoreLabel')}:</b> {row.quality_score}/100</span>
                  <span><b className="text-slate-700">{t('timeUsedLabel')}:</b> {row.time_used_seconds} {t('secondsShort')}</span>
                  <span><b className="text-slate-700">{t('multiplierLabel')}:</b> ×{row.score_multiplier ?? 1}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 shrink-0 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                <span className="text-emerald-700 text-xs font-black">
                  {t('roundTotalLabel')}: {' '}
                  {row.round_score} {t('ptsUnit')}
                </span>
                <span className={`text-slate-300 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-5 sm:px-6">
                <pre className="bg-slate-900 text-emerald-400 text-[11px] font-mono p-4 rounded-2xl overflow-x-auto whitespace-pre">
                  {row.code || t('noCodeRecorded')}
                </pre>
                <QualityReview row={row} t={t} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// How this answer's quality was scored (server/arcade/code-metrics.js,
// ADR 0007): time, efficiency and standards measured against the reference
// answer, each lost point with the line that lost it, then a few sentences of
// advice that load afterwards (from the local model when it is set up). Rounds settled
// before the review existed have none of it, and show nothing.
const RUBRIC = [['time', 'rubricTime'], ['efficiency', 'rubricEfficiency'], ['standard', 'rubricStandard']];
const SOURCE_NOTE = { fallback: 'sourceFallback' };

function QualityReview({ row, t }) {
  const rubric = row.quality_rubric;
  const note = SOURCE_NOTE[row.quality_source];
  if (!rubric && !row.quality_feedback && !note) return null;
  const ratio = Number(rubric?.stepRatio);
  const lang = t('findingLang') === 'en' ? 'en' : 'th';
  const findings = rubric?.findings || [];

  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600" aria-label={t('qualityReviewTitle')}>
      <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500">{t('qualityReviewTitle')}</h4>

      {rubric && (
        <dl className="mt-3 space-y-2.5">
          {RUBRIC.map(([key, label]) => (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-bold text-slate-700">{t(label)}</dt>
                <dd className="font-mono font-bold text-slate-800">{rubric[key]}/100</dd>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, Number(rubric[key]) || 0))}%` }} />
              </div>
              {key === 'time' && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {t('submittedInSeconds').replace('{{s}}', String(row.time_used_seconds))}
                  {Number.isFinite(ratio) && ratio > 0 && <> · {t('runtimeVsReference').replace('{{x}}', ratio.toFixed(1))}</>}
                </p>
              )}
            </div>
          ))}
        </dl>
      )}

      {findings.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-black text-slate-500">{t('findingsLabel')}</p>
          <ul className="mt-1 space-y-1">
            {findings.map((finding, index) => (
              <li key={index} className="flex gap-2 leading-relaxed">
                <span className="shrink-0 font-mono text-[10px] text-slate-400">{finding.line ? `${t('lineShort')} ${finding.line}` : '•'}</span>
                <span className="text-slate-700">{finding[lang] || finding.th}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {row.history_id ? <Advice row={row} t={t} /> : row.quality_feedback && (
        <AdviceBox label={t('feedbackLabel')} text={row.quality_feedback} />
      )}

      {note && <p className="mt-3 inline-block rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-800">{t(note)}</p>}
      {row.total_count > 0 && row.pass_count < row.total_count && (
        <p className="mt-2 text-[11px] text-slate-400">{t('qualityScaledNote')}</p>
      )}
    </section>
  );
}

function AdviceBox({ label, text }) {
  return (
    <div className="mt-3 rounded-xl border border-sky-100 bg-white p-3">
      <p className="text-[11px] font-black text-sky-700">{label}</p>
      <p className="mt-1 leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

// Advice is asked for when the round is opened, never while scoring: it is
// written after the match (server: POST /api/arcade/history/:id/advice) and
// kept, so each round costs the model at most one call. The model can take
// 10-15 seconds; one request per round is shared by every panel that asks.
const adviceRequests = new Map();
const requestAdvice = (historyId) => {
  if (!adviceRequests.has(historyId)) {
    adviceRequests.set(historyId, fetch(`${API_BASE}/api/arcade/history/${historyId}/advice`, { method: 'POST' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body) adviceRequests.delete(historyId); // e.g. the match is still on: ask again later
        return { text: body?.advice || '', source: body?.source || 'metrics' };
      })
      .catch(() => { adviceRequests.delete(historyId); return { text: '', source: 'metrics' }; }));
  }
  return adviceRequests.get(historyId);
};

// The server decides whether stored text came from the model; asking it is
// quick once the advice exists, so the panel never guesses from the row.
function Advice({ row, t }) {
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    if (advice) return undefined;
    let cancelled = false;
    // Nothing to say, or not available yet: stop waiting rather than spin.
    requestAdvice(row.history_id).then((next) => { if (!cancelled) setAdvice(next); });
    return () => { cancelled = true; };
  }, [advice, row.history_id]);

  if (!advice) {
    return <p className="mt-3 animate-pulse text-[11px] font-bold text-sky-600">{t('adviceLoading')}</p>;
  }
  if (!advice.text) return null;
  return <AdviceBox label={advice.source === 'ai' ? t('adviceFromAi') : t('adviceFromMetrics')} text={advice.text} />;
}
