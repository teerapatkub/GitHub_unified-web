import { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp, Eye, ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EXAMPLE_CASES_SHOWN, pyLiteral } from '../constants.js';
import arcadeConfig from '../../../../../shared/arcadeConfig.json';
import { editorFrameDebuffClass, debuffOverlayText } from '../debuffVisuals.js';
import '../arcade-effects.css';

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
      aria-label={label}
      className="inline-flex min-h-target min-w-target shrink-0 items-center justify-center rounded-lg text-pysim-label transition-colors hover:bg-pysim-surface-container hover:text-pysim-on-surface"
    >
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );
}

export default function BattleRoyaleGameplayView({
  phase,
  draftReady,
  draftStatus,
  retryDraft,
  PHASES,
  t,
  challengeTitle,
  challengeDesc,
  challengeFunctionName,
  challengeTestCases,
  challengeHiddenCaseCount = 0,
  // A fix round (ADR 0010): { passed, total } of the AI's answer in the editor.
  fixRound = null,
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
  // Monaco registers its key handler once; read the current debuffs through a ref.
  const keyDownRef = useRef(handleEditorKeyDown);
  useEffect(() => { keyDownRef.current = handleEditorKeyDown; });

  // Once the answer is in it cannot be changed, so the editor stops being an
  // editor: it locks, and the rest of the round is spent watching. Items lock
  // too: the server refuses every item command from a player who has submitted
  // (arcade/shop-api.js), so the screen must not promise otherwise.
  const spectating = Boolean(playerState.hasSubmittedThisRound) && !playerState.eliminated;
  const editorLocked = !draftReady || playerState.eliminated || spectating
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
        <div className="bg-pysim-card px-4 py-3 rounded-2xl shadow-sm border border-pysim-outline-variant relative overflow-hidden shrink-0">
          {/* flex-wrap matters here: the timer/cash chips are shrink-0, so on a
              narrow screen they cannot give up any width and were pushed 45px
              past the card, which sets overflow-hidden - the player lost sight
              of their own clock and coin count entirely (measured 2026-08-19 at
              375px). Wrapping puts the chips on their own line instead. */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 text-label font-black uppercase tracking-widest text-pysim-accent-strong bg-pysim-accent-container rounded border border-pysim-accent-border">
                Active Problem
              </span>
              <h2 className="text-base font-black text-pysim-on-surface">
                {challengeTitle}
              </h2>
              {/* Stays visible when the problem card is folded: it is what the
                  round asks for, and how far the AI's answer already gets. */}
              {fixRound && (
                <div role="note" className="flex flex-wrap items-center gap-2 rounded-xl border border-pysim-info-border bg-pysim-info-container px-3 py-2 text-xs font-bold text-pysim-info-strong max-w-2xl">
                  <span className="rounded-md bg-pysim-info-strong px-2 py-0.5 text-label font-black text-pysim-on-primary">{t('roundKindFix')}</span>
                  <span>
                    {t('fixRoundBanner').replace('{{passed}}', String(fixRound.passed)).replace('{{total}}', String(fixRound.total))}
                  </span>
                  <span className="basis-full font-medium text-pysim-on-surface-variant">{t('fixRoundScoreNote')}</span>
                </div>
              )}
              {!collapsed.problem && (
                <p className="text-xs text-pysim-label leading-relaxed max-w-2xl font-medium">
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
                  <div className="text-label font-black uppercase tracking-widest text-pysim-label mb-1">
                    {t('exampleLabel')}
                  </div>
                  <div className="space-y-1">
                    {challengeTestCases.slice(0, EXAMPLE_CASES_SHOWN).map((c, i) => (
                      <div key={i} className="font-mono text-label text-pysim-label bg-pysim-surface border border-pysim-outline-variant rounded-lg px-3 py-1.5 overflow-x-auto whitespace-nowrap">
                        <span className="text-pysim-label">
                          {challengeFunctionName}({(c.input || []).map(pyLiteral).join(', ')})
                        </span>
                        <span className="text-pysim-label px-2">→</span>
                        <span className="text-pysim-success-strong font-bold">{pyLiteral(c.output)}</span>
                      </div>
                    ))}
                  </div>
                  {challengeHiddenCaseCount > 0 && (
                    <div className="text-label text-pysim-label font-bold mt-1">{t('exampleHint')}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="bg-pysim-accent-container border border-pysim-accent-border rounded-xl px-4 py-2 flex items-center space-x-2">
                <span className="text-pysim-accent-strong text-sm">⏱️</span>
                <span className="text-xs font-black text-pysim-accent-strong">
                  {timeLeft}s
                </span>
              </div>

              <div className="bg-pysim-success-container border border-pysim-success-border rounded-xl px-4 py-2 flex items-center space-x-2">
                <span className="text-pysim-success-strong text-sm">🪙</span>
                <span className="text-xs font-black text-pysim-success-strong">
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
            <div className="mt-4 p-3 bg-pysim-warning-container border border-pysim-warning-border text-pysim-warning-strong text-xs font-bold rounded-xl flex items-center gap-2">
              <span>💡</span>
              <span>{playerState.hint}</span>
            </div>
          )}

          {phase === PHASES.ROUND_1 && (
            <div className="mt-3 text-label text-pysim-label font-bold">
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
                    ? 'bg-pysim-accent-container border-pysim-accent-border text-pysim-accent-strong'
                    : 'bg-pysim-warning-container border-pysim-warning-border text-pysim-warning-strong motion-safe:animate-pulse'
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
          <div className="shrink-0 rounded-2xl border border-pysim-info-border bg-pysim-info-container px-4 py-3 text-xs font-bold text-pysim-info-strong flex items-center gap-2">
            <Eye className="h-4 w-4 shrink-0" />
            <span>{t('spectatorBanner')}</span>
          </div>
        )}

        {/* Code Editor Frame with Debuff Effects */}
        <div className={`flex-1 min-h-[300px] relative rounded-3xl border-2 overflow-hidden bg-pysim-card flex flex-col shadow-sm transition-all duration-300
          ${checkEffectActive('inkFog') ? 'border-pysim-on-surface-variant' : 'border-pysim-outline-variant'}
          ${checkEffectActive('keyScrambler') || checkEffectActive('typoGenerator') || checkEffectActive('capsLockLock') ? 'border-pysim-error' : ''}
          ${editorFrameDebuffClass(checkEffectActive)}
        `}>

          {/* Self buffs and incoming debuffs use the same effect list. */}
          {playerState.activeEffects.length > 0 && (
            <div className={`${playerState.activeEffects.some(e => !['shield', 'scoreMultiplier', 'aiHelper'].includes(e.type)) ? 'bg-pysim-error' : 'bg-pysim-info-strong'} text-pysim-on-primary py-2 px-4 text-center font-black text-xs tracking-wider flex items-center justify-center gap-2 z-20 shrink-0`}>
              <AlertTriangle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
              <span>{t('activeEffects')} ({
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
            <div className="h-10 bg-pysim-surface border-b border-pysim-outline-variant px-4 flex items-center justify-between text-xs text-pysim-label font-bold shrink-0">
              {watchedPlayer ? (
                <button
                  type="button"
                  onClick={() => setWatchedPlayer(null)}
                  className="flex items-center gap-2 text-pysim-info hover:text-pysim-info-strong"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('backToMyCode')}
                </button>
              ) : (
                <span>{t('pythonFile')}</span>
              )}

              {watchedPlayer ? (
                <span className="flex items-center gap-1.5 text-pysim-info">
                  <Eye className="h-3.5 w-3.5" />
                  {t('watchingTitle')} {watchedPlayer}
                  {watchedCode && !watchedCode.error && (
                    <span className="text-pysim-label font-medium">
                      · {watchedCode.has_submitted ? t('watchingSubmitted') : t('watchingTyping')}
                    </span>
                  )}
                </span>
              ) : checkEffectActive('shield') && (
                <span className="flex items-center gap-1 text-pysim-info">
                  <Shield className="h-3.5 w-3.5" /> Firewall Active
                </span>
              )}
            </div>

            {!watchedPlayer && (
              <div role="status" aria-live="polite" className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs border-b ${['error', 'restoreError', 'conflict'].includes(draftStatus) ? 'bg-pysim-warning-container text-pysim-warning-strong' : 'bg-pysim-surface text-pysim-label'}`}>
                <span>{t(`draft_${draftStatus}`)}</span>
                {['error', 'restoreError', 'conflict'].includes(draftStatus) && (
                  <button type="button" onClick={retryDraft} className="font-bold underline">
                    {t(draftStatus === 'conflict' ? 'draftReload' : 'draftRetry')}
                  </button>
                )}
              </div>
            )}

            {/* Someone else's editor. Read-only by construction: this is a
                <pre>, not a Monaco instance, so there is nothing here that
                could write back into the watched player's answer. Debuff
                classes are deliberately not applied - a debuff belongs to the
                player who was hit by it, and blurring someone else's code
                while watching would just look like a bug. */}
            {watchedPlayer ? (
              <div className="flex-1 w-full relative overflow-auto no-scrollbar bg-pysim-surface">
                {watchedCode?.error ? (
                  <div className="p-6 text-xs font-bold text-pysim-label">{watchedCode.error}</div>
                ) : watchedCode?.code ? (
                  <pre className="p-4 text-[13px] leading-[22px] font-mono text-pysim-on-surface-variant whitespace-pre">
                    {watchedCode.code}
                  </pre>
                ) : (
                  <div className="p-6 text-xs font-bold text-pysim-label">{t('watchingEmpty')}</div>
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
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.onKeyDown(event => keyDownRef.current({
                    key: event.browserEvent.key,
                    preventDefault: () => { event.preventDefault(); event.stopPropagation(); },
                  }));
                }}
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
                <div className="absolute inset-0 bg-pysim-inverse-surface-high flex flex-col items-center justify-center z-30 select-none pointer-events-auto">
                  <span role="status" className="text-pysim-inverse-accent font-mono font-bold text-lg tracking-widest motion-safe:animate-pulse">
                    {debuffOverlayText('blackout', t, arcadeConfig.effectDurations).title}
                  </span>
                  <span className="text-pysim-on-inverse text-xs font-mono mt-2">
                    {debuffOverlayText('blackout', t, arcadeConfig.effectDurations).desc}
                  </span>
                </div>
              )}

              {checkEffectActive('inkFog') && (
                <div className="absolute inset-0 bg-pysim-inverse-surface-high/85 flex flex-col items-center justify-center z-25 text-pysim-on-inverse pointer-events-auto">
                  <span role="status" className="text-pysim-inverse-accent text-xl font-black tracking-wider motion-safe:animate-pulse">
                    {debuffOverlayText('inkFog', t, arcadeConfig.effectDurations).title}
                  </span>
                  <p className="text-xs text-pysim-on-inverse mt-1 max-w-sm text-center">
                    {debuffOverlayText('inkFog', t, arcadeConfig.effectDurations).desc}
                  </p>
                </div>
              )}

              {/* Submitted this round: the editor is locked on purpose, so say so
                  plainly instead of letting the player type into a silent box. A
                  debuff overlay (blackout/inkFog) takes the screen when active, so
                  this only shows when the lock is the player's own submission. It
                  is pointer-events-none so the player list stays clickable for
                  watching other players' code. */}
              {spectating && !checkEffectActive('blackout') && !checkEffectActive('inkFog') && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-pysim-inverse-surface/80 text-center pointer-events-none select-none">
                  <div className="rounded-full border border-pysim-inverse-code/50 bg-pysim-inverse-code/20 px-4 py-1.5 text-sm font-black uppercase tracking-wider text-pysim-inverse-success">
                    ✓ ส่งคำตอบรอบนี้แล้ว
                  </div>
                  <p className="text-sm font-bold text-pysim-on-inverse">แก้โค้ดไม่ได้จนจบรอบ · รอผลแล้วไปต่อรอบถัดไป</p>
                  <p className="text-label text-pysim-on-inverse">ระหว่างนี้กดที่ชื่อผู้เล่นเพื่อดูโค้ดคนอื่นได้ · ไอเทมใช้ได้อีกครั้งในรอบถัดไป</p>
                </div>
              )}
            </div>
            )}
          </div>

        </div>

        {/* Console log outputs. Foldable like the problem card: between rounds
            there is nothing in it worth 112 pixels of a laptop screen, and the
            editor takes the space back. Folded it keeps its title bar, so it is
            still obvious where output will appear. */}
        <div className={`bg-pysim-inverse-surface border border-pysim-inverse-outline rounded-2xl flex flex-col overflow-hidden shadow-inner shrink-0 ${collapsed.output ? '' : 'h-28'}`}>
          <button
            type="button"
            onClick={() => togglePanel('output')}
            aria-expanded={!collapsed.output}
            className="h-8 bg-pysim-inverse-surface-high border-b border-pysim-inverse-outline px-4 flex items-center justify-between text-label font-black text-pysim-on-inverse-muted uppercase tracking-wider shrink-0 hover:text-pysim-on-inverse transition-colors"
          >
            <span>{t('codeOutput')}</span>
            {collapsed.output ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          {!collapsed.output && (
            <textarea
              readOnly
              value={consoleOutput || "Python Interpreter online. Press Run Local Tests."}
              className="flex-1 bg-transparent text-pysim-inverse-code px-4 py-3 text-xs font-mono resize-none focus:outline-none placeholder-pysim-on-inverse-muted no-scrollbar"
            />
          )}
        </div>

        {/* Actions Footer */}
        <div className="h-14 bg-pysim-card border border-pysim-outline-variant rounded-2xl px-5 flex items-center justify-between shrink-0 shadow-sm">
          <button
            onClick={runCodeTests}
            className="px-6 py-2.5 bg-pysim-surface-container hover:bg-pysim-surface-high text-pysim-label rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('runTests')}
          </button>

          <button
            onClick={handleManualSubmit}
            disabled={!draftReady || isGrading || spectating || playerState.eliminated}
            className="px-8 py-2.5 bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 active:scale-[0.98] text-pysim-on-primary rounded-xl text-xs font-black transition-all shadow-md shadow-pysim-accent-strong/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGrading ? t('judgingCode') : spectating ? t('submittedBadge') : t('submitCode')}
          </button>
        </div>
      </div>

      {/* RIGHT AREA: Lobby Status (Active Players and inventory) */}
      <div className="w-full lg:w-2/5 xl:w-[360px] flex flex-col gap-3 shrink-0">

        {/* BATTLE ROYALE LOBBY STATUS */}
        <div className={`bg-pysim-card p-5 rounded-3xl shadow-sm border-2 flex-1 flex flex-col transition-all duration-300
          ${targetingItem ? 'border-pysim-accent shadow-lg shadow-pysim-accent-strong/5' : 'border-pysim-outline-variant'}
        `}>
          <h3 className="text-sm font-black text-pysim-on-surface border-b border-pysim-outline-variant pb-3 mb-4 flex justify-between items-center tracking-wider uppercase">
            <span>{t('lobbyStatus')}</span>
            {spectating && !targetingItem && (
              <span className="text-label text-pysim-info font-black bg-pysim-info-container border border-pysim-info-border px-2.5 py-1 rounded-full normal-case tracking-normal">
                👁 {t('watchHint')}
              </span>
            )}
            {targetingItem && (
              <span className="text-label text-pysim-accent-strong font-black motion-safe:animate-pulse bg-pysim-accent-container border border-pysim-accent-border px-2.5 py-1 rounded-full">
                🎯 {t('pickTarget')}
              </span>
            )}
          </h3>

          {/* You Info Card */}
          <div className={`p-4 rounded-2xl mb-4 border transition-all ${
            playerState.eliminated
              ? 'bg-pysim-accent-container border-pysim-accent-border opacity-60'
              : checkEffectActive('shield')
                ? 'bg-pysim-info-container border-pysim-info-border shadow-md'
                : 'bg-pysim-surface border-pysim-outline-variant shadow-sm'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pysim-accent-strong text-pysim-on-primary flex items-center justify-center font-black text-xs">
                  U
                </div>
                <div>
                  <span className="text-xs font-black text-pysim-on-surface">{playerState.name} (You)</span>
                  <span className="block text-label font-black text-pysim-label uppercase tracking-widest">
                    {playerState.eliminated ? t('eliminated') : t('lived')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {checkEffectActive('shield') && <Shield className="h-4 w-4 text-pysim-info fill-pysim-info-container motion-safe:animate-pulse" />}
                <span className="text-label font-black text-pysim-success-strong bg-pysim-success-container border border-pysim-success-border px-2.5 py-1 rounded-xl">
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
                  ${bot.eliminated ? 'bg-pysim-surface border-pysim-outline-variant opacity-60 grayscale' : 'bg-pysim-card border-pysim-outline-variant shadow-sm hover:border-pysim-outline-variant'}
                  ${targetingItem && !bot.eliminated && !bot.isDebuffed ? 'cursor-crosshair bg-pysim-accent-container/50 border-pysim-accent-border hover:bg-pysim-accent-container hover:border-pysim-accent shadow-md hover:scale-[1.02]' : ''}
                  ${!targetingItem && spectating ? 'cursor-pointer hover:border-pysim-info-border' : ''}
                  ${watchedPlayer === bot.name ? 'ring-2 ring-pysim-info border-pysim-info-border' : ''}
                  ${isUnselectableTarget ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${bot.eliminated ? 'bg-pysim-surface-high text-pysim-label' : 'bg-pysim-surface-container text-pysim-label'}`}>
                      {bot.isBot ? 'B' : (bot.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className={`text-xs font-black ${bot.eliminated ? 'text-pysim-label line-through' : 'text-pysim-on-surface-variant'}`}>
                        {bot.name}
                      </span>
                      {bot.eliminated && (
                        <span className="block text-label font-bold text-pysim-accent-strong uppercase tracking-wider">{t('eliminated')}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-label font-black text-pysim-success-strong font-mono">🪙 {bot.cash}</span>
                </div>

                {/* The progress bar is a BOT's bar and only a bot's: its value
                    comes from the local bot simulation, which knows nothing
                    about a human opponent and would show every real player
                    frozen at 0% forever. A human gets the one fact that is
                    actually known about them - whether their answer is in. */}
                {!bot.eliminated && bot.isBot && (
                  <div className="space-y-1">
                    <div className="w-full bg-pysim-surface-container rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${bot.hasSubmitted ? 'bg-pysim-success' : 'bg-pysim-accent-strong'}`}
                        style={{ width: `${bot.hasSubmitted ? 100 : Math.round(Math.min(100, bot.progress))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-label font-bold text-pysim-label uppercase tracking-wider">
                      <span>{bot.hasSubmitted ? t('submittedBadge') : 'Round Progress'}</span>
                      <span>{bot.hasSubmitted ? '✅' : `${Math.round(Math.min(100, bot.progress))}%`}</span>
                    </div>
                  </div>
                )}

                {!bot.eliminated && !bot.isBot && (
                  <div className={`text-label font-black uppercase tracking-wider ${bot.hasSubmitted ? 'text-pysim-success-strong' : 'text-pysim-label'}`}>
                    {bot.hasSubmitted ? `✅ ${t('submittedBadge')}` : `✍️ ${t('watchingTyping')}`}
                  </div>
                )}

                {targetingItem && !bot.eliminated && !bot.isDebuffed && (
                  <div className="absolute inset-x-0 bottom-0 bg-pysim-accent-strong py-1 text-center text-label font-black text-pysim-on-primary uppercase tracking-wider motion-safe:animate-pulse select-none">
                    ⚡ {t('clickToAttack')}
                  </div>
                )}
                {isUnselectableTarget && (
                  <div className="absolute inset-x-0 bottom-0 bg-pysim-outline py-1 text-center text-label font-black text-pysim-on-primary uppercase tracking-wider select-none">
                    🚫 {t('targetAlreadyHit')}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* INVENTORY CARD */}
        <div className="bg-pysim-card p-5 rounded-3xl shadow-sm border border-pysim-outline-variant flex flex-col gap-3 min-h-[140px] relative overflow-hidden shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-pysim-accent-strong"></div>
          <h4 className="text-label font-black text-pysim-label uppercase tracking-widest pl-2">
            {t('inventory')}
          </h4>

          <div className="flex flex-wrap gap-2.5 pl-2">
            {playerState.inventory.length === 0 && (
              <span className="text-pysim-label italic text-xs bg-pysim-surface px-4 py-2 rounded-xl border border-pysim-outline-variant">
                {t('empty')}
              </span>
            )}

            {playerState.inventory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => initiateItemUse(item)}
                disabled={!draftReady || playerState.hasSubmittedThisRound || playerState.eliminated || targetingItem || phase === PHASES.ROUND_1}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm border
                  ${targetingItem === item ? 'bg-pysim-accent-strong text-pysim-on-primary border-pysim-accent-strong motion-safe:animate-pulse' : 'bg-pysim-card hover:bg-pysim-surface border-pysim-outline-variant text-pysim-on-surface-variant'}
                  disabled:opacity-40 hover:scale-105 active:scale-95
                `}
                title={t(item.descKey)}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{t(item.nameKey)}</span>
                {targetingItem === item && <span className="text-label bg-pysim-on-surface/20 px-2 py-0.5 rounded">{t('pickTarget')}</span>}
              </button>
            ))}

            {targetingItem && (
              <button
                onClick={() => setTargetingItem(null)}
                className="text-xs text-pysim-accent-strong hover:text-pysim-accent-strong underline font-bold px-3 ml-auto"
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
