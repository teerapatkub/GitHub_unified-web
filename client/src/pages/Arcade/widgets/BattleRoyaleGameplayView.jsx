import { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp, Eye, ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import usePauseThemeScene from '../../../fx/usePauseThemeScene.js';
import { EDITOR_FONT_FAMILY } from '../../../utils/editorFont.js';
import ChoiceRoundPanel from './ChoiceRoundPanel.jsx';
import { EXAMPLE_CASES_SHOWN, pyLiteral } from '../constants.js';
import arcadeConfig from '../../../../../shared/arcadeConfig.json';
import { editorFrameDebuffClass, debuffOverlayText } from '../debuffVisuals.js';
import '../arcade-effects.css';
import InlineCodeText from '../../../components/ui/InlineCodeText.jsx';

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
  // A predict round: { code, call, options } replaces the editor (ADR 0010).
  choiceRound = null,
  selectedChoice = null,
  onSelectChoice = () => {},
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
  // The theme's moving scene is off during a round: it fell across the code.
  usePauseThemeScene();
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

  // What the item bag can do right now, in one line above the items.
  const itemsLocked = !draftReady || playerState.hasSubmittedThisRound || playerState.eliminated || phase === PHASES.ROUND_1;
  const itemsHint = targetingItem
    ? t('itemsHintPick')
    : phase === PHASES.ROUND_1
      ? t('itemsHintRound1')
      : playerState.hasSubmittedThisRound
        ? t('itemsHintSubmitted')
        : playerState.inventory.length === 0
          ? t('itemsEmpty')
          : t('itemsHintUse');
  const timeLow = Number(timeLeft) <= 10;

  // Fits the screen on a laptop: nothing in a round lives below the fold. The
  // page used to scroll, with Run / Submit, the output and the item bag under
  // a 160px problem card and five 100px player cards - at 1366x768 none of the
  // three was visible while coding. Now the problem text scrolls inside its own
  // capped box, the editor takes what is left, the actions sit on the editor's
  // bottom edge, and the players are one compact row each. On a phone the
  // columns stack and the page scrolls; there is no height to fit into.
  return (
    <div className="mx-auto flex h-full w-full max-w-[1850px] flex-col gap-3 overflow-y-auto p-3 no-scrollbar lg:flex-row lg:gap-4 lg:overflow-hidden lg:p-4">

      {/* MAIN: the round's problem, the editor and its output */}
      {/* Fits the screen when there is room. When there is not (a short
          window, the description and output both open, browser zoom) the
          column scrolls instead of clipping: overflow-hidden here used to
          push the Run/Submit row and the output below the window with no way
          to reach them, and the editor shrank to nothing first. */}
      <div className="flex shrink-0 flex-col gap-3 lg:min-h-0 lg:min-w-0 lg:flex-1 lg:shrink lg:overflow-y-auto">

        <section className="shrink-0 rounded-2xl border border-pysim-outline-variant bg-pysim-card px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <h2 className="min-w-0 flex-1 pt-1 text-base font-black leading-snug text-pysim-on-surface lg:text-lg">
              {challengeTitle}
            </h2>
            <div
              role="timer"
              aria-label={t('timeLeftLabel')}
              title={t('timeLeftLabel')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-black tabular-nums ${
                timeLow
                  ? 'border-pysim-error bg-pysim-error text-pysim-on-primary motion-safe:animate-pulse'
                  : 'border-pysim-accent-border bg-pysim-accent-container text-pysim-accent-strong'
              }`}
            >
              <span aria-hidden="true">⏱️</span>{timeLeft}s
            </div>
            <div title={t('cashLabel')} aria-label={t('cashLabel')} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-pysim-success-border bg-pysim-success-container px-3 py-1.5 text-sm font-black tabular-nums text-pysim-success-strong">
              <span aria-hidden="true">🪙</span>{playerState.cash}
            </div>
            <PanelToggle open={!collapsed.problem} label={t('togglePanel')} onToggle={() => togglePanel('problem')} />
          </div>

          {/* Stays visible when the problem card is folded: it is what the
              round asks for, and how far the AI's answer already gets. */}
          {fixRound && (
            <div role="note" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-pysim-info-border bg-pysim-info-container px-3 py-2 text-xs font-bold text-pysim-info-strong">
              <span className="rounded-md bg-pysim-info-strong px-2 py-0.5 text-label font-black text-pysim-on-primary">{t('roundKindFix')}</span>
              <span>{t('fixRoundBanner').replace('{{passed}}', String(fixRound.passed)).replace('{{total}}', String(fixRound.total))}</span>
              <span className="basis-full font-medium text-pysim-on-surface-variant">{t('fixRoundScoreNote')}</span>
            </div>
          )}

          {/* The statement and worked examples scroll inside a capped box, so
              a long problem cannot push the editor down. Only a couple of the
              cases are shown: the rest stay hidden so the examples cannot be
              turned into a lookup table. */}
          {!collapsed.problem && (
            <div className="mt-2 max-h-[22vh] space-y-2 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-pysim-on-surface-variant"><InlineCodeText text={challengeDesc} /></p>
              {Array.isArray(challengeTestCases) && challengeTestCases.length > 0 && challengeFunctionName && (
                <div>
                  <div className="mb-1 text-xs font-bold text-pysim-label">{t('exampleLabel')}</div>
                  <div className="grid gap-1 xl:grid-cols-2">
                    {challengeTestCases.slice(0, EXAMPLE_CASES_SHOWN).map((c, i) => (
                      <div key={i} className="overflow-x-auto whitespace-nowrap rounded-lg border border-pysim-outline-variant bg-pysim-surface px-3 py-1.5 font-mono text-xs text-pysim-label">
                        {challengeFunctionName}({(c.input || []).map(pyLiteral).join(', ')})
                        <span className="px-2">→</span>
                        <span className="font-bold text-pysim-success-strong">{pyLiteral(c.output)}</span>
                      </div>
                    ))}
                  </div>
                  {challengeHiddenCaseCount > 0 && (
                    <div className="mt-1 text-xs font-semibold text-pysim-label">{t('exampleHint')}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {playerState.hint && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-pysim-warning-border bg-pysim-warning-container p-2.5 text-xs font-bold text-pysim-warning-strong">
              <span aria-hidden="true">💡</span>
              <span>{playerState.hint}</span>
            </div>
          )}

          {/* Heads-up that the round is about to submit itself, then a
              "submitting now" message once it does. `autoFiring` is tested
              without the hasSubmittedThisRound guard: submitMyRound() sets
              that flag the instant the auto-submit fires, so gating on it hid
              the "submitting now" message entirely. */}
          {(() => {
            if (!String(phase).startsWith('ROUND_') || playerState.eliminated) return null;
            const autoFiring = isGrading && timeLeft <= autoSubmitLeadSeconds;
            const warning = !playerState.hasSubmittedThisRound
              && timeLeft <= autoSubmitWarnSeconds
              && timeLeft > autoSubmitLeadSeconds;
            if (!autoFiring && !warning) return null;
            return (
              <div
                role="status"
                className={`mt-2 flex items-center gap-2 rounded-xl border p-2.5 text-xs font-black ${
                  autoFiring
                    ? 'border-pysim-accent-border bg-pysim-accent-container text-pysim-accent-strong'
                    : 'border-pysim-warning-border bg-pysim-warning-container text-pysim-warning-strong motion-safe:animate-pulse'
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
        </section>

        {/* Why the editor stopped taking keystrokes, wherever the panels are. */}
        {spectating && (
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-pysim-info-border bg-pysim-info-container px-4 py-2.5 text-xs font-bold text-pysim-info-strong">
            <Eye className="h-4 w-4 shrink-0" />
            <span>{t('spectatorBanner')}</span>
          </div>
        )}

        {/* Code editor frame with debuff effects, Run / Submit on its edge */}
        <div className={`relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border-2 bg-pysim-card shadow-sm transition-all duration-300 lg:min-h-[220px] lg:flex-1
          ${checkEffectActive('inkFog') ? 'border-pysim-on-surface-variant' : 'border-pysim-outline-variant'}
          ${checkEffectActive('keyScrambler') || checkEffectActive('typoGenerator') || checkEffectActive('capsLockLock') ? 'border-pysim-error' : ''}
          ${editorFrameDebuffClass(checkEffectActive)}
        `}>

          {/* Self buffs and incoming debuffs use the same effect list. */}
          {playerState.activeEffects.length > 0 && (
            <div className={`${playerState.activeEffects.some(e => !['shield', 'scoreMultiplier', 'aiHelper'].includes(e.type)) ? 'bg-pysim-error' : 'bg-pysim-info-strong'} z-20 flex shrink-0 items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-black text-pysim-on-primary`}>
              <AlertTriangle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
              <span>{t('activeEffects')} ({
                playerState.activeEffects.map(e => {
                  const itm = SHOP_ITEMS.find(s => s.id === e.type);
                  return t(itm ? itm.nameKey : e.type);
                }).join(', ')
              })</span>
            </div>
          )}

          <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-pysim-outline-variant bg-pysim-surface px-3 text-xs font-bold text-pysim-label">
              {watchedPlayer ? (
                <button type="button" onClick={() => setWatchedPlayer(null)} className="flex items-center gap-2 text-pysim-info hover:text-pysim-info-strong">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('backToMyCode')}
                </button>
              ) : (
                <span className="font-mono">{t('pythonFile')}</span>
              )}

              {watchedPlayer ? (
                <span className="flex items-center gap-1.5 text-pysim-info">
                  <Eye className="h-3.5 w-3.5" />
                  {t('watchingTitle')} {watchedPlayer}
                  {watchedCode && !watchedCode.error && (
                    <span className="font-medium text-pysim-label">
                      · {watchedCode.has_submitted ? t('watchingSubmitted') : t('watchingTyping')}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  {!choiceRound && (
                    <span
                      role="status"
                      aria-live="polite"
                      className={['error', 'restoreError', 'conflict'].includes(draftStatus) ? 'text-pysim-warning-strong' : 'font-medium'}
                    >
                      {t(`draft_${draftStatus}`)}
                      {['error', 'restoreError', 'conflict'].includes(draftStatus) && (
                        <button type="button" onClick={retryDraft} className="ml-2 font-bold underline">
                          {t(draftStatus === 'conflict' ? 'draftReload' : 'draftRetry')}
                        </button>
                      )}
                    </span>
                  )}
                  {checkEffectActive('shield') && (
                    <span className="flex items-center gap-1 text-pysim-info">
                      <Shield className="h-3.5 w-3.5" /> {t('firewallActive')}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Someone else's editor. Read-only by construction: a <pre>, not
                a Monaco instance, so nothing here can write back into the
                watched player's answer. Debuff classes are not applied - a
                debuff belongs to the player who was hit by it. */}
            {watchedPlayer ? (
              <div className="relative w-full flex-1 overflow-auto bg-pysim-surface no-scrollbar">
                {watchedCode?.error ? (
                  <div className="p-6 text-xs font-bold text-pysim-label">{watchedCode.error}</div>
                ) : watchedCode?.code ? (
                  <pre className="whitespace-pre p-4 font-mono text-[13px] leading-[22px] text-pysim-on-surface-variant">{watchedCode.code}</pre>
                ) : (
                  <div className="p-6 text-xs font-bold text-pysim-label">{t('watchingEmpty')}</div>
                )}
              </div>
            ) : (
            <div className={`relative w-full flex-1 overflow-hidden transition-all duration-300
              ${checkEffectActive('inkFog') ? 'blur-md pointer-events-none' : ''}
              ${checkEffectActive('blackout') ? 'brightness-[0.05] pointer-events-none' : ''}
              ${checkEffectActive('mirrorMode') ? 'scale-x-[-1]' : ''}
              ${checkEffectActive('screenDimmer') ? 'opacity-[0.12] pointer-events-none' : ''}
            `}>
              {choiceRound ? (
                <ChoiceRoundPanel view={choiceRound} selected={selectedChoice} onSelect={onSelectChoice}
                  locked={editorLocked || playerState.hasSubmittedThisRound} t={t} />
              ) : (
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
                  fontFamily: EDITOR_FONT_FAMILY,
                  padding: { top: 10 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  domReadOnly: editorLocked,
                  readOnly: editorLocked
                }}
              />
              )}

              {checkEffectActive('blackout') && (
                <div className="pointer-events-auto absolute inset-0 z-30 flex select-none flex-col items-center justify-center bg-pysim-inverse-surface-high">
                  <span role="status" className="font-mono text-lg font-bold tracking-widest text-pysim-inverse-accent motion-safe:animate-pulse">
                    {debuffOverlayText('blackout', t, arcadeConfig.effectDurations).title}
                  </span>
                  <span className="mt-2 font-mono text-xs text-pysim-on-inverse">
                    {debuffOverlayText('blackout', t, arcadeConfig.effectDurations).desc}
                  </span>
                </div>
              )}

              {checkEffectActive('inkFog') && (
                <div className="pointer-events-auto absolute inset-0 z-25 flex flex-col items-center justify-center bg-pysim-inverse-surface-high/85 text-pysim-on-inverse">
                  <span role="status" className="text-xl font-black tracking-wider text-pysim-inverse-accent motion-safe:animate-pulse">
                    {debuffOverlayText('inkFog', t, arcadeConfig.effectDurations).title}
                  </span>
                  <p className="mt-1 max-w-sm text-center text-xs text-pysim-on-inverse">
                    {debuffOverlayText('inkFog', t, arcadeConfig.effectDurations).desc}
                  </p>
                </div>
              )}

              {/* Submitted this round: the editor is locked on purpose. Not
                  clickable, so the player list stays usable for watching. */}
              {spectating && !checkEffectActive('blackout') && !checkEffectActive('inkFog') && (
                <div className="pointer-events-none absolute inset-0 z-20 flex select-none flex-col items-center justify-center gap-2 bg-pysim-inverse-surface/80 text-center">
                  <div className="rounded-full border border-pysim-inverse-code/50 bg-pysim-inverse-code/20 px-4 py-1.5 text-sm font-black text-pysim-inverse-success">
                    ✓ ส่งคำตอบรอบนี้แล้ว
                  </div>
                  <p className="text-sm font-bold text-pysim-on-inverse">แก้โค้ดไม่ได้จนจบรอบ · รอผลแล้วไปต่อรอบถัดไป</p>
                  <p className="text-label text-pysim-on-inverse">ระหว่างนี้กดที่ชื่อผู้เล่นเพื่อดูโค้ดคนอื่นได้ · ไอเทมใช้ได้อีกครั้งในรอบถัดไป</p>
                </div>
              )}
            </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-pysim-outline-variant bg-pysim-surface px-3 py-2">
            {choiceRound ? <span /> : (
              <button
                type="button"
                onClick={runCodeTests}
                className="inline-flex min-h-10 items-center rounded-xl border border-pysim-outline-variant bg-pysim-card px-4 text-sm font-bold text-pysim-on-surface-variant transition-colors hover:bg-pysim-surface-container"
              >
                {t('runTests')}
              </button>
            )}
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!draftReady || isGrading || spectating || playerState.eliminated || (choiceRound && !selectedChoice)}
              className="inline-flex min-h-10 items-center rounded-xl bg-pysim-accent-strong px-6 text-sm font-black text-pysim-on-primary shadow-md transition-colors hover:bg-pysim-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGrading ? t('judgingCode') : spectating ? t('submittedBadge') : t('submitCode')}
            </button>
          </div>
        </div>

        {/* Output, foldable: between rounds there is nothing in it worth the
            space, and folded it keeps its title bar. */}
        {!choiceRound && (
        <div className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border border-pysim-inverse-outline bg-pysim-inverse-surface ${collapsed.output ? '' : 'h-24 xl:h-28'}`}>
          <button
            type="button"
            onClick={() => togglePanel('output')}
            aria-expanded={!collapsed.output}
            className="flex h-8 shrink-0 items-center justify-between border-b border-pysim-inverse-outline bg-pysim-inverse-surface-high px-4 text-xs font-bold text-pysim-on-inverse-muted transition-colors hover:text-pysim-on-inverse"
          >
            <span>{t('codeOutput')}</span>
            {collapsed.output ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          {!collapsed.output && (
            <textarea
              readOnly
              value={consoleOutput || t('consoleEmpty')}
              className="flex-1 resize-none bg-transparent px-4 py-2 font-mono text-xs text-pysim-inverse-code no-scrollbar focus:outline-none"
            />
          )}
        </div>
        )}
      </div>

      {/* SIDE: the item bag first (it is what a player acts with), then the
          players, who are also the targets. */}
      <aside className="flex w-full shrink-0 flex-col gap-3 lg:min-h-0 lg:w-[320px] lg:overflow-y-auto xl:w-[360px]">

        <section className={`shrink-0 rounded-2xl border-2 bg-pysim-card p-3 shadow-sm transition-colors ${targetingItem ? 'border-pysim-accent' : 'border-pysim-outline-variant'}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-pysim-on-surface">{t('itemsTitle')}</h3>
            {targetingItem && (
              <button type="button" onClick={() => setTargetingItem(null)} className="rounded-lg px-2 py-1 text-xs font-bold text-pysim-accent-strong underline hover:bg-pysim-accent-container">
                {t('cancelTargeting')}
              </button>
            )}
          </div>
          <p className={`mb-2 text-xs font-semibold ${targetingItem ? 'text-pysim-accent-strong motion-safe:animate-pulse' : 'text-pysim-label'}`}>{itemsHint}</p>
          {playerState.inventory.length > 0 && (
            <div className="grid max-h-[30vh] grid-cols-2 gap-2 overflow-y-auto no-scrollbar">
              {playerState.inventory.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  // The chosen item stays pressable: pressing it again puts it back.
                  onClick={() => (targetingItem === item ? setTargetingItem(null) : initiateItemUse(item))}
                  disabled={itemsLocked || (Boolean(targetingItem) && targetingItem !== item)}
                  aria-pressed={targetingItem === item}
                  title={t(item.descKey)}
                  className={`flex min-h-[64px] flex-col items-start gap-0.5 rounded-xl border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45
                    ${targetingItem === item
                      ? 'border-pysim-accent-strong bg-pysim-accent-strong text-pysim-on-primary'
                      : 'border-pysim-outline-variant bg-pysim-surface text-pysim-on-surface hover:border-pysim-accent-border hover:bg-pysim-accent-container'}
                  `}
                >
                  <span className="flex items-center gap-1.5 text-sm font-black">
                    <span className="text-lg" aria-hidden="true">{item.icon}</span>
                    {t(item.nameKey)}
                  </span>
                  <span className={`line-clamp-2 text-label leading-snug ${targetingItem === item ? 'text-pysim-on-primary' : 'text-pysim-label'}`}>
                    {t(item.descKey)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={`flex min-h-0 flex-col rounded-2xl border-2 bg-pysim-card p-3 shadow-sm transition-colors lg:flex-1 ${targetingItem ? 'border-pysim-accent' : 'border-pysim-outline-variant'}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-pysim-on-surface">{t('playersTitle')}</h3>
            {spectating && !targetingItem && (
              <span className="rounded-full border border-pysim-info-border bg-pysim-info-container px-2 py-0.5 text-label font-bold text-pysim-info">👁 {t('watchHint')}</span>
            )}
            {targetingItem && (
              <span className="rounded-full border border-pysim-accent-border bg-pysim-accent-container px-2 py-0.5 text-label font-bold text-pysim-accent-strong motion-safe:animate-pulse">🎯 {t('pickTarget')}</span>
            )}
          </div>

          <ul className="min-h-0 space-y-1.5 overflow-y-auto no-scrollbar lg:flex-1">
            {/* You */}
            <li className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 ${
              playerState.eliminated
                ? 'border-pysim-accent-border bg-pysim-accent-container opacity-60'
                : checkEffectActive('shield')
                  ? 'border-pysim-info-border bg-pysim-info-container'
                  : 'border-pysim-outline-variant bg-pysim-surface'
            }`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pysim-accent-strong text-xs font-black text-pysim-on-primary">{(playerState.name || '?').charAt(0).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-pysim-on-surface">{playerState.name} ({t('youLabel')})</span>
                <span className="block text-label font-semibold text-pysim-label">{playerState.eliminated ? t('eliminated') : t('lived')}</span>
              </span>
              {checkEffectActive('shield') && <Shield className="h-4 w-4 shrink-0 text-pysim-info" aria-label={t('firewallActive')} />}
              <span className="shrink-0 rounded-lg border border-pysim-success-border bg-pysim-success-container px-2 py-0.5 text-xs font-black text-pysim-success-strong">⭐ {playerState.score} {t('ptsUnit')}</span>
            </li>

            {opponents.map((bot, i) => {
              const canTarget = Boolean(targetingItem) && !bot.eliminated && !bot.isDebuffed;
              const isUnselectableTarget = Boolean(targetingItem) && !bot.eliminated && bot.isDebuffed;
              const clickable = canTarget || (!targetingItem && spectating && !bot.eliminated);
              const progress = bot.hasSubmitted ? 100 : Math.round(Math.min(100, bot.progress || 0));
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => {
                      if (targetingItem) { handleTargetClick(i); return; }
                      if (spectating) setWatchedPlayer(bot.name);
                    }}
                    title={isUnselectableTarget ? t('targetAlreadyHit') : undefined}
                    className={`relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border px-2.5 py-2 text-left transition-colors disabled:cursor-default
                      ${bot.eliminated ? 'border-pysim-outline-variant bg-pysim-surface opacity-55 grayscale' : 'border-pysim-outline-variant bg-pysim-card'}
                      ${canTarget ? 'cursor-crosshair border-pysim-accent-border bg-pysim-accent-container/60 hover:border-pysim-accent hover:bg-pysim-accent-container' : ''}
                      ${!targetingItem && spectating && !bot.eliminated ? 'hover:border-pysim-info-border' : ''}
                      ${watchedPlayer === bot.name ? 'ring-2 ring-pysim-info' : ''}
                      ${isUnselectableTarget ? 'opacity-50 grayscale' : ''}
                    `}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${bot.eliminated ? 'bg-pysim-surface-high text-pysim-label' : 'bg-pysim-surface-container text-pysim-label'}`}>
                      {bot.isBot ? '🤖' : (bot.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold ${bot.eliminated ? 'text-pysim-label line-through' : 'text-pysim-on-surface-variant'}`}>{bot.name}</span>
                      {bot.eliminated ? (
                        <span className="block text-label font-bold text-pysim-accent-strong">{t('eliminated')}</span>
                      ) : canTarget ? (
                        <span className="block text-label font-black text-pysim-accent-strong">⚡ {t('clickToAttack')}</span>
                      ) : isUnselectableTarget ? (
                        <span className="block text-label font-bold text-pysim-label">🚫 {t('targetAlreadyHit')}</span>
                      ) : bot.isBot ? (
                        // A bot's bar comes from the local bot simulation; a
                        // human opponent only reports whether the answer is in.
                        <span className="mt-1 flex items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-pysim-surface-container">
                            <span
                              className={`block h-1.5 rounded-full transition-all duration-500 ${bot.hasSubmitted ? 'bg-pysim-success' : 'bg-pysim-accent-strong'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </span>
                          <span className="w-9 text-right text-label font-bold tabular-nums text-pysim-label">{bot.hasSubmitted ? '✅' : `${progress}%`}</span>
                        </span>
                      ) : (
                        <span className={`block text-label font-bold ${bot.hasSubmitted ? 'text-pysim-success-strong' : 'text-pysim-label'}`}>
                          {bot.hasSubmitted ? `✅ ${t('submittedBadge')}` : `✍️ ${t('watchingTyping')}`}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-black text-pysim-success-strong" title={t('cashLabel')}>🪙 {bot.cash}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    </div>
  );
}
