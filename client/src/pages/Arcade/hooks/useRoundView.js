import { useEffect, useState } from 'react';
import { playingRound, roundKindOf } from '../roundKinds.js';

// What the round being played asks beyond its problem (GET /round, see
// server/arcade/round-kinds.js). In a fix round that is the AI's answer the
// editor opens on and how many tests it passes. A write round needs nothing,
// so it is ready at once and nothing is fetched.
export default function useRoundView({ currentRoom, API_BASE }) {
  const roomId = currentRoom?.room_id;
  const matchId = currentRoom?.current_match_id;
  const phase = currentRoom?.phase;
  const roundNum = playingRound(phase);
  const kind = roundNum ? roundKindOf(currentRoom, roundNum) : 'write';
  const scope = `${roomId}:${matchId}:${phase}`;
  const [loaded, setLoaded] = useState({ scope: null, view: null });

  useEffect(() => {
    if (!roomId || !roundNum || kind === 'write') return undefined;
    let stopped = false;
    let retry;
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/round`, { signal: AbortSignal.timeout(8000) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'round unavailable');
        // The room poll moves the phase on; an answer for another round is stale.
        if (!stopped && data.match_id === matchId && data.round_num === roundNum) setLoaded({ scope, view: data });
      } catch {
        if (!stopped) retry = setTimeout(load, 2000);
      }
    };
    void load();
    return () => { stopped = true; clearTimeout(retry); };
  }, [API_BASE, roomId, matchId, roundNum, kind, scope]);

  const view = loaded.scope === scope ? loaded.view : null;
  return { kind, view, ready: kind === 'write' || Boolean(view) };
}
