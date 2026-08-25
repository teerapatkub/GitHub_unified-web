// client/src/pages/Arcade/hooks/useProgression.js
// Phase 8.3 — progression/replay concern: the per-round record of what this
// player submitted (shown on the RESULT screen) and their durable Arcade
// career totals (shown as a lobby card).
//
// Both are read-only views over data the server writes on its own: round
// history rows are written by POST /rooms/:id/submit-round, and career totals
// are folded in once per match by the server's finalizeArcadePhase() when a
// room reaches RESULT. Nothing here ever writes, so this hook can't affect a
// match's outcome.
import { useState, useEffect, useCallback } from 'react';
import { PHASES } from '../constants.js';

export default function useProgression({ playerName, roomId, phase, API_BASE }) {
  const [roundHistory, setRoundHistory] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [pastMatches, setPastMatches] = useState([]);

  // Career totals. Refetched whenever the player lands back in the lobby,
  // which is exactly when a just-finished match's numbers would have changed.
  const fetchPlayerStats = useCallback(async () => {
    if (!playerName) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/players/${encodeURIComponent(playerName)}/stats`);
      const data = await res.json();
      if (data.success) setPlayerStats(data.stats);
    } catch {
      // A missing stats card is cosmetic — never surface an error toast for it.
    }
  }, [playerName, API_BASE]);

  // Wrapped rather than called bare so the state update is unambiguously
  // asynchronous — setPlayerStats only ever runs after the fetch resolves, not
  // synchronously during the effect body.
  useEffect(() => {
    if (phase !== PHASES.LOBBY) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchPlayerStats();
    })();
    return () => { cancelled = true; };
  }, [phase, fetchPlayerStats]);

  // Step 5 — the player's own finished matches, reviewable long after the room
  // itself is gone. Loaded alongside the career card in the lobby, since that
  // is where a player looks back rather than mid-match.
  useEffect(() => {
    if (phase !== PHASES.LOBBY || !playerName) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/arcade/players/${encodeURIComponent(playerName)}/history`);
        const data = await res.json();
        if (!cancelled && data.success) setPastMatches(data.matches || []);
      } catch {
        // Purely a review convenience — never worth interrupting the lobby for.
      }
    })();
    return () => { cancelled = true; };
  }, [phase, playerName, API_BASE]);

  // Round history for the match that just ended. Fetched once on entering
  // RESULT; the rows are already final by then, so there's nothing to poll.
  useEffect(() => {
    if (phase !== PHASES.RESULT || !roomId || !playerName) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/arcade/rooms/${roomId}/round-history?user_name=${encodeURIComponent(playerName)}`
        );
        const data = await res.json();
        if (!cancelled && data.success) setRoundHistory(data.history || []);
      } catch {
        if (!cancelled) setRoundHistory([]);
      }
    })();
    return () => { cancelled = true; };
  }, [phase, roomId, playerName, API_BASE]);

  return { roundHistory, playerStats, pastMatches, fetchPlayerStats };
}
