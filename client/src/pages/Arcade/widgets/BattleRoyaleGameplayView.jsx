import { useState } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp, Eye, ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EXAMPLE_CASES_SHOWN } from '../constants.js';

// Whether the problem card and the output panel are folded away, remembered
// across rounds and across matches. A player who folds the problem card to get
// a taller editor means it for the rest of the session, and the view unmounts
// and remounts at every shop intermission - without this their choice was
// undone three times a match.
const PANEL_STORAGE_KEY = 'arcade.panels.collapsed';

const readCollapsed = () => {
  try {
    return JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

function PanelToggle({ open, label, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      title={label}
      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
    >
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );
}

// Renders a value the way the player would write it in Python, not the way JS
// prints it — a beginner reading `true` or `null` under a Python problem is
// being told to type something that does not exist in the language.
function pyLiteral(value) {
  if (value === null || value === undefined) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (Array.isArray(value)) return `[${value.map(pyLiteral).join(', ')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}: ${pyLiteral(v)}`).join(', ')}}`;
  }
  return JSON.stringify(value);
}

export default function BattleRoyaleGameplayView({
  phase,
  PHASES,
  t,
  challengeTitle,
  challengeDesc,
  challengeFunctionName,
  challengeTestCases,
  timeLeft,
  playerState,
  checkEffectActive,
  SHOP_ITEMS,
  handleCodeChange,
  editorRef,
  handleEditorKeyDown,
  consoleOutput,
  runCodeTests,
  handleManualSubmit,
  isGrading,
  autoSubmitLeadSeconds,
  autoSubmitWarnSeconds,
  targetingItem,
  opponents,
  handleTargetClick,
  initiateItemUse,
  setTargetingItem,
  watchedPlayer,
  setWatchedPlayer,
  watchedCode
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  // Once the answer is in it cannot be changed, so the editor stops being an
  // editor: it locks, and the rest of the round is spent watching. Items are
  // deliberately still usable - sending an answer early is meant to buy time to
  // play the sabotage game, not to end the round for that player.
  const spectating = Boolean(playerState.hasSubmittedThisRound) && !playerState.eliminated;
  const editorLocked = spectating
    || checkEffectActive('timeFreeze')
    || checkEffectActive('blackout');

  const togglePanel = (key) => {
    setCollapsed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar p-4 flex flex-col lg:flex-row gap-4 max-w-[1850px] mx-auto">

      {/* LEFT AREA: Coding Workspace */}
      {/* Scrolls rather than hides its overflow. With overflow-hidden this
          column silently cut ~170px off the bottom of the editor once the
          problem card grew (measured live 2026-08-19 at 1280x720, after worked
          examples were added to the card): the card is shrink-0 and the editor
          frame has a min-h-[300px] floor, so their combined height can exceed
          the column and the excess simply vanished - taking part of the code
          area with it. min-h-0 is required alongside, or a flex item refuses to
          shrink below its content and scrolls nothing. */}
      <div className="flex-1 lg:w-3/5 min-h-0 flex flex-col gap-3 overflow-y-auto no-scrollbar">

        {/* Challenge Description Card. Foldable: once a player has read the
            problem it is 200+ pixels of screen they would rather give to the
            editor, and the title/timer/coins row stays visible either way. */}
        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden shrink-0">
          {/* flex-wrap matters here: the timer/cash chips are shrink-0, so on a
              narrow screen they cannot give up any width and were pushed 45px
              past the card, which sets overflow-hidden - the player lost sight
              of their own clock and coin count entirely (measured 2026-08-19 at
              375px). Wrapping puts the chips on their own line instead. */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded border border-rose-100">
                Active Problem
              </span>
              <h2 className="text-base font-black text-slate-800">
                {challengeTitle}
              </h2>
              {!collapsed.problem && (
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
                  {challengeDesc}
                </p>
              )}

              {/* Worked examples. A problem statement in prose alone leaves a
                  beginner guessing at the exact shape of the return value —
                  whether it is a list or a count, True or the string "True".
                  Deliberately only a couple of the cases: the rest stay hidden
                  so the examples cannot be turned into a lookup table that
                  passes without solving anything. */}
              {!collapsed.problem && Array.isArray(challengeTestCases) && challengeTestCases.length > 0 && challengeFunctionName && (
                <div className="pt-2">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {t('exampleLabel')}
                  </div>
                  <div className="space-y-1">
                    {challengeTestCases.slice(0, EXAMPLE_CASES_SHOWN).map((c, i) => (
                      <div key={i} className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 overflow-x-auto whitespace-nowrap">
                        <span className="text-slate-500">
                          {challengeFunctionName}({(c.input || []).map(pyLiteral).join(', ')})
                        </span>
                        <span className="text-slate-300 px-2">→</span>
                        <span className="text-emerald-600 font-bold">{pyLiteral(c.output)}</span>
                      </div>
                    ))}
                  </div>
                  {challengeTestCases.length > EXAMPLE_CASES_SHOWN && (
                    <div className="text-[9px] text-slate-300 font-bold mt-1">{t('exampleHint')}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 flex items-center space-x-2">
                <span className="text-rose-500 text-sm">⏱️</span>
                <span className="text-xs font-black text-rose-700">
                  {timeLeft}s
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center space-x-2">
                <span className="text-emerald-500 text-sm">🪙</span>
                <span className="text-xs font-black text-emerald-700">
                  {playerState.cash}
                </span>
              </div>

              <PanelToggle
                open={!collapsed.problem}
                label={t('togglePanel')}
                onToggle={() => togglePanel('problem')}
              />
            </div>
          </div>

          {/* AI Hint Display */}
          {playerState.hint && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <span>💡</span>
              <span>{playerState.hint}</span>
            </div>
          )}

          {phase === PHASES.ROUND_1 && (
            <div className="mt-3 text-[10px] text-slate-400 font-bold">
              ⚠️ {t('round1Note')}
            </div>
          )}

          {/* Phase 8.1 — heads-up that the round is about to submit itself.
              A player who never presses Submit gets their work sent
              automatically at autoSubmitLeadSeconds so the round can't score
              0, but that also locks the editor earlier than anyone would
              expect. This warns first (at autoSubmitWarnSeconds) and leaves a
              real gap to react in, then switches to a "submitting now"
              message once the auto-submit actually fires. Hidden entirely
              once they've submitted, or if they're out of the match. */}
          {(() => {
            if (!String(phase).startsWith('ROUND_') || playerState.eliminated) return null;

            // Two distinct states, and they must be tested in this order.
            // `autoFiring` has to be checked WITHOUT the
            // !hasSubmittedThisRound guard used below: submitMyRound() sets
            // that flag synchronously the instant the auto-submit fires, so
            // gating the whole banner on it meant the "submitting now"
            // message could never render at all (caught on screen — the
            // warning showed from 16s down to 9s and then simply vanished).
            // Pairing isGrading with the lead window is what distinguishes an
            // automatic submission from the player pressing Submit themselves
            // earlier in the round, which needs no banner.
            const autoFiring = isGrading && timeLeft <= autoSubmitLeadSeconds;
            const warning = !playerState.hasSubmittedThisRound
              && timeLeft <= autoSubmitWarnSeconds
              && timeLeft > autoSubmitLeadSeconds;
            if (!autoFiring && !warning) return null;

            return (
              <div
                role="status"
                className={`mt-3 p-3 rounded-xl text-xs font-black flex items-center gap-2 border ${
                  autoFiring
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {autoFiring
                    ? t('autoSubmitFiring')
                    : t('autoSubmitWarning').replace('{{n}}', String(Math.max(0, timeLeft - autoSubmitLeadSeconds)))}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Spectator banner. Above the editor rather than inside the problem
            card, because the problem card folds away and this has to explain
            why the editor stopped accepting keystrokes wherever the player
            has put their panels. */}
        {spectating && (
          <div className="shrink-0 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-800 flex items-center gap-2">
            <Eye className="h-4 w-4 shrink-0" />
            <span>{t('spectatorBanner')}</span>
          </div>
        )}

        {/* Code Editor Frame with Debuff Effects */}
        <div className={`flex-1 min-h-[300px] relative rounded-3xl border-2 overflow-hidden bg-white flex flex-col shadow-sm transition-all duration-300
          ${checkEffectActive('inkFog') ? 'border-slate-800' : 'border-slate-200'}
          ${checkEffectActive('keyScrambler') || checkEffectActive('typoGenerator') || checkEffectActive('capsLockLock') ? 'border-red-500' : ''}
          ${checkEffectActive('screenShake') ? 'animate-bounce' : ''}
        `}>

          {/* Active Debuffs Warn Panel */}
          {playerState.activeEffects.length > 0 && (
            <div className="bg-red-600 text-white py-2 px-4 text-center font-black text-xs animate-pulse tracking-wider flex items-center justify-center gap-2 z-20 shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 animate-spin" />
              <span>SYSTEM FAILURE: DEBUFF ACTIVE ({
                playerState.activeEffects.map(e => {
                  const itm = SHOP_ITEMS.find(s => s.id === e.type);
                  return t(itm ? itm.nameKey : e.type);
                }).join(', ')
              })</span>
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Tab header */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-400 font-bold shrink-0">
              {watchedPlayer ? (
                <button
                  type="button"
                  onClick={() => setWatchedPlayer(null)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('backToMyCode')}
                </button>
              ) : (
                <span>{t('pythonFile')}</span>
              )}

              {watchedPlayer ? (
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <Eye className="h-3.5 w-3.5" />
                  {t('watchingTitle')} {watchedPlayer}
                  {watchedCode && !watchedCode.error && (
                    <span className="text-slate-400 font-medium">
                      · {watchedCode.has_submitted ? t('watchingSubmitted') : t('watchingTyping')}
                    </span>
                  )}
                </span>
              ) : checkEffectActive('shield') && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Shield className="h-3.5 w-3.5" /> Firewall Active
                </span>
              )}
            </div>

            {/* Someone else's editor. Read-only by construction: this is a
                <pre>, not a Monaco instance, so there is nothing here that
                could write back into the watched player's answer. Debuff
                classes are deliberately not applied - a debuff belongs to the
                player who was hit by it, and blurring someone else's code
                while watching would just look like a bug. */}
            {watchedPlayer ? (
              <div className="flex-1 w-full relative overflow-auto no-scrollbar bg-slate-50">
                {watchedCode?.error ? (
                  <div className="p-6 text-xs font-bold text-slate-400">{watchedCode.error}</div>
                ) : watchedCode?.is_bot ? (
                  <div className="p-6 text-xs font-bold text-slate-400">{t('watchingBot')}</div>
                ) : watchedCode?.code ? (
                  <pre className="p-4 text-[13px] leading-[22px] font-mono text-slate-700 whitespace-pre">
                    {watchedCode.code}
                  </pre>
                ) : (
                  <div className="p-6 text-xs font-bold text-slate-400">{t('watchingEmpty')}</div>
                )}
              </div>
            ) : (
            /* Monaco Editor Component */
            <div className={`flex-1 w-full relative overflow-hidden transition-all duration-300
              ${checkEffectActive('inkFog') ? 'blur-md pointer-events-none' : ''}
              ${checkEffectActive('blackout') ? 'brightness-[0.05] pointer-events-none' : ''}
              ${checkEffectActive('mirrorMode') ? 'scale-x-[-1]' : ''}
              ${checkEffectActive('screenDimmer') ? 'opacity-[0.12] pointer-events-none' : ''}
            `}>
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-light"
                value={playerState.code}
                onChange={handleCodeChange}
                onMount={(editor) => { editorRef.current = editor; }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  fontFamily: 'Fira Code, monospace',
                  padding: { top: 12 },
                  domReadOnly: editorLocked,
                  readOnly: editorLocked
                }}
              />

              {/* Visual Overlay: Blackout / Fog Alert */}
              {checkEffectActive('blackout') && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 select-none pointer-events-auto">
                  <span className="text-red-500 font-mono font-bold text-lg tracking-widest animate-pulse">
                    SYSTEM SHUTDOWN: EMP DETONATION
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono mt-2 uppercase tracking-widest">
                    Rebooting monitor screen...
                  </span>
                </div>
              )}

              {checkEffectActive('inkFog') && (
                <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-25 text-white pointer-events-auto">
                  <span className="text-rose-500 text-lg font-black uppercase tracking-wider animate-pulse">
                    Screen Blurs: Ink Fog Debuff
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-sm text-center">
                    A dark ink fog is covering your screen. Wait 15 seconds for fog to clear!
                  </p>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Monaco Editor Textarea Listener for Keyboard Attacks (Backspace Lock) */}
          <textarea
            className="hidden-listener absolute opacity-0 pointer-events-none h-0 w-0"
            onKeyDown={handleEditorKeyDown}
            autoFocus
          />
        </div>

        {/* Console log outputs. Foldable like the problem card: between rounds
            there is nothing in it worth 112 pixels of a laptop screen, and the
            editor takes the space back. Folded it keeps its title bar, so it is
            still obvious where output will appear. */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-inner shrink-0 ${collapsed.output ? '' : 'h-28'}`}>
          <button
            type="button"
            onClick={() => togglePanel('output')}
            aria-expanded={!collapsed.output}
            className="h-8 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 hover:text-slate-300 transition-colors"
          >
            <span>{t('codeOutput')}</span>
            {collapsed.output ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          {!collapsed.output && (
            <textarea
              readOnly
              value={consoleOutput || "Python Interpreter online. Press Run Local Tests."}
              className="flex-1 bg-transparent text-emerald-400 px-4 py-3 text-xs font-mono resize-none focus:outline-none placeholder-slate-600 no-scrollbar"
            />
          )}
        </div>

        {/* Actions Footer */}
        <div className="h-14 bg-white border border-slate-200 rounded-2xl px-5 flex items-center justify-between shrink-0 shadow-sm">
          <button
            onClick={runCodeTests}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('runTests')}
          </button>

          <button
            onClick={handleManualSubmit}
            disabled={isGrading || spectating}
            className="px-8 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGrading ? t('judgingCode') : spectating ? t('submittedBadge') : t('submitCode')}
          </button>
        </div>
      </div>

      {/* RIGHT AREA: Lobby Status (Active Players and inventory) */}
      <div className="w-full lg:w-2/5 xl:w-[360px] flex flex-col gap-3 shrink-0">

        {/* BATTLE ROYALE LOBBY STATUS */}
        <div className={`bg-white p-5 rounded-3xl shadow-sm border-2 flex-1 flex flex-col transition-all duration-300
          ${targetingItem ? 'border-rose-500 shadow-lg shadow-rose-500/5' : 'border-slate-200'}
        `}>
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center tracking-wider uppercase">
            <span>{t('lobbyStatus')}</span>
            {spectating && !targetingItem && (
              <span className="text-[10px] text-indigo-600 font-black bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full normal-case tracking-normal">
                👁 {t('watchHint')}
              </span>
            )}
            {targetingItem && (
              <span className="text-[10px] text-rose-600 font-black animate-pulse bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                🎯 {t('pickTarget')}
              </span>
            )}
          </h3>

          {/* You Info Card */}
          <div className={`p-4 rounded-2xl mb-4 border transition-all ${
            playerState.eliminated
              ? 'bg-rose-50 border-rose-200 opacity-60'
              : checkEffectActive('shield')
                ? 'bg-blue-50 border-blue-200 shadow-md'
                : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xs">
                  U
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800">{playerState.name} (You)</span>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {playerState.eliminated ? t('eliminated') : t('lived')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {checkEffectActive('shield') && <Shield className="h-4 w-4 text-blue-600 fill-blue-100 animate-pulse" />}
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                  ⭐ {playerState.score} {t('ptsUnit')}
                </span>
              </div>
            </div>
          </div>

          {/* Opponents List */}
          <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 flex-1 min-h-0">
            {opponents.map((bot, i) => {
              const isUnselectableTarget = Boolean(targetingItem) && !bot.eliminated && bot.isDebuffed;
              return (
              <div
                key={i}
                onClick={() => {
                  if (targetingItem) { handleTargetClick(i); return; }
                  if (spectating) setWatchedPlayer(bot.name);
                }}
                title={isUnselectableTarget ? t('targetAlreadyHit') : undefined}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden
                  ${bot.eliminated ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'}
                  ${targetingItem && !bot.eliminated && !bot.isDebuffed ? 'cursor-crosshair bg-rose-50/50 border-rose-300 hover:bg-rose-50 hover:border-rose-500 shadow-md hover:scale-[1.02]' : ''}
                  ${!targetingItem && spectating ? 'cursor-pointer hover:border-indigo-300' : ''}
                  ${watchedPlayer === bot.name ? 'ring-2 ring-indigo-400 border-indigo-300' : ''}
                  ${isUnselectableTarget ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${bot.eliminated ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      {bot.isBot ? 'B' : (bot.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className={`text-xs font-black ${bot.eliminated ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {bot.name}
                      </span>
                      {bot.eliminated && (
                        <span className="block text-[8px] font-bold text-rose-500 uppercase tracking-wider">{t('eliminated')}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-emerald-600 font-mono">🪙 {bot.cash}</span>
                </div>

                {/* The progress bar is a BOT's bar and only a bot's: its value
                    comes from the local bot simulation, which knows nothing
                    about a human opponent and would show every real player
                    frozen at 0% forever. A human gets the one fact that is
                    actually known about them - whether their answer is in. */}
                {!bot.eliminated && bot.isBot && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${bot.hasSubmitted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${bot.hasSubmitted ? 100 : Math.round(Math.min(100, bot.progress))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{bot.hasSubmitted ? t('submittedBadge') : 'Round Progress'}</span>
                      <span>{bot.hasSubmitted ? '✅' : `${Math.round(Math.min(100, bot.progress))}%`}</span>
                    </div>
                  </div>
                )}

                {!bot.eliminated && !bot.isBot && (
                  <div className={`text-[9px] font-black uppercase tracking-wider ${bot.hasSubmitted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {bot.hasSubmitted ? `✅ ${t('submittedBadge')}` : `✍️ ${t('watchingTyping')}`}
                  </div>
                )}

                {targetingItem && !bot.eliminated && !bot.isDebuffed && (
                  <div className="absolute inset-x-0 bottom-0 bg-rose-600 py-1 text-center text-[9px] font-black text-white uppercase tracking-wider animate-pulse select-none">
                    ⚡ {t('clickToAttack')}
                  </div>
                )}
                {isUnselectableTarget && (
                  <div className="absolute inset-x-0 bottom-0 bg-slate-500 py-1 text-center text-[9px] font-black text-white uppercase tracking-wider select-none">
                    🚫 {t('targetAlreadyHit')}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* INVENTORY CARD */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3 min-h-[140px] relative overflow-hidden shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
            {t('inventory')}
          </h4>

          <div className="flex flex-wrap gap-2.5 pl-2">
            {playerState.inventory.length === 0 && (
              <span className="text-slate-400 italic text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                {t('empty')}
              </span>
            )}

            {playerState.inventory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => initiateItemUse(item)}
                disabled={playerState.eliminated || targetingItem || phase === PHASES.ROUND_1}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm border
                  ${targetingItem === item ? 'bg-rose-600 text-white border-rose-600 animate-pulse' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}
                  disabled:opacity-40 hover:scale-105 active:scale-95
                `}
                title={t(item.descKey)}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{t(item.nameKey)}</span>
                {targetingItem === item && <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded">{t('pickTarget')}</span>}
              </button>
            ))}

            {targetingItem && (
              <button
                onClick={() => setTargetingItem(null)}
                className="text-xs text-rose-500 hover:text-rose-600 underline font-bold px-3 ml-auto"
              >
                {t('cancelTargeting')}
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
