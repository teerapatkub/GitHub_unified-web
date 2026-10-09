import { useEffect, useRef, useState, useCallback } from 'react';

// Read and save only this editor's room/match/phase. Keep one unacknowledged
// request unchanged so a late response cannot overwrite a newer saved draft.
export default function useRoundDraft({ playerState, setPlayerState, currentRoom, starterCode, tasksReady, API_BASE }) {
  const roomId = currentRoom?.room_id;
  const matchId = currentRoom?.current_match_id;
  const phase = currentRoom?.phase;
  const name = playerState.name;
  const scope = `${roomId}:${matchId}:${phase}:${name}`;
  const current = useRef({ playerState, scope });
  current.current = { playerState, scope };
  const retryRef = useRef(() => {});
  const [status, setStatus] = useState({ scope: null, type: 'restoring', savedCode: null });
  const retryDraft = useCallback(() => retryRef.current(), []);

  useEffect(() => {
    if (!roomId || !matchId || !/^ROUND_[1-4]$/.test(phase) || !tasksReady) return;
    let stopped = false;
    let busy = false;
    let recovered = false;
    let submitted = false;
    let conflict = false;
    let revision = 0;
    let savedCode = null;
    let pending = null;
    const active = () => !stopped && current.current.scope === scope;
    const report = type => { if (active()) setStatus({ scope, type, savedCode }); };

    const recover = async () => {
      report('restoring');
      const response = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/code/${encodeURIComponent(name)}`, { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (!response.ok) throw new Error('recovery failed');
      if (!active()) return;
      // The room poll will pick up the new phase; never apply mismatched code.
      if (data.match_id !== matchId || data.phase !== phase) return;
      const code = data.has_saved_code ? data.code : starterCode;
      revision = data.draft_revision;
      savedCode = data.has_saved_code ? data.code : null;
      submitted = data.has_submitted;
      recovered = true;
      conflict = false;
      pending = null;
      setPlayerState(prev => ({ ...prev, code, codeScope: scope,
        hasSubmittedThisRound: submitted, eliminated: data.is_eliminated }));
      report(submitted ? 'submitted' : data.has_saved_code ? 'saved' : 'unsaved');
    };

    const pump = async (reload = false) => {
      if (!active() || busy) return;
      busy = true;
      try {
        const ps = current.current.playerState;
        if (reload || !recovered || (ps.hasSubmittedThisRound && !submitted)) {
          await recover();
          return;
        }
        if (conflict || ps.codeScope !== scope || ps.hasSubmittedThisRound || ps.eliminated) return;
        if (!pending && ps.code === savedCode) return;
        pending ||= { match_id: matchId, round_num: Number(phase.split('_')[1]), code: ps.code, draft_revision: revision };
        report('saving');
        const response = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/code-draft`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending), signal: AbortSignal.timeout(8000)
        });
        const data = await response.json();
        if (!active()) return;
        if (response.status === 409) {
          conflict = true;
          report('conflict');
          return;
        }
        if ([400, 403].includes(response.status)) pending = null;
        if (!response.ok || !data.success) throw new Error('draft save failed');
        revision = data.draft_revision;
        savedCode = pending.code;
        pending = null;
        report('saved');
      } catch {
        report(recovered ? 'error' : 'restoreError');
      } finally {
        busy = false;
      }
    };
    retryRef.current = () => void pump(conflict);
    void pump();
    const interval = setInterval(() => void pump(), 2000);
    return () => { stopped = true; clearInterval(interval); retryRef.current = () => {}; };
  }, [roomId, matchId, phase, name, scope, starterCode, tasksReady, API_BASE, setPlayerState]);

  const draftReady = playerState.codeScope === scope && status.scope === scope
    && !['restoring', 'restoreError'].includes(status.type);
  const draftStatus = status.scope !== scope ? 'restoring'
    : status.type === 'saved' && playerState.code !== status.savedCode ? 'unsaved' : status.type;
  return { draftReady, draftStatus, retryDraft };
}
