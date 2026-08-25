// client/src/pages/Arcade/hooks/useChat.js
// Phase 8.2 — room chat + emoji reactions.
//
// Mirrors the incoming-effects poll pattern in useCombat.js: a 2s interval
// keyed on the room id (a primitive, never the currentRoom object — depending
// on the object is what previously turned these polls into unthrottled request
// loops). Fetches incrementally with `since`, so a long-lived room doesn't
// re-download its whole history every 2 seconds.
//
// Chat is closed during ROUND_* phases; the server refuses those posts, and
// `chatOpen` below mirrors that rule so the UI can explain why rather than
// letting the player type into a box that will reject them.
import { useState, useEffect, useRef, useCallback } from 'react';
import { PHASES } from '../constants.js';

const MAX_KEPT_MESSAGES = 100;

export default function useChat({ playerName, roomId, phase, notify, t, API_BASE }) {
  const [messages, setMessages] = useState([]);
  const [emojiSet, setEmojiSet] = useState([]);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(0);

  const chatOpen = Boolean(roomId) && !String(phase).startsWith('ROUND_');

  // Reset when the player moves to a different room, so one room's history
  // can't bleed into the next.
  useEffect(() => {
    lastIdRef.current = 0;
    setMessages([]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/chat?since=${lastIdRef.current}`);
        const data = await res.json();
        if (cancelled || !data.success) return;
        if (Array.isArray(data.emojiSet) && data.emojiSet.length) setEmojiSet(data.emojiSet);
        if (data.messages && data.messages.length > 0) {
          lastIdRef.current = data.messages[data.messages.length - 1].id;
          setMessages(prev => [...prev, ...data.messages].slice(-MAX_KEPT_MESSAGES));
        }
      } catch {
        // A dropped chat poll is not worth a toast — the room-state poller
        // already owns telling the player they're disconnected.
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [roomId, API_BASE]);

  const post = useCallback(async (body) => {
    if (!roomId) return false;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: playerName, ...body })
      });
      const data = await res.json();
      if (!data.success) {
        // Rate-limit rejections are self-inflicted and self-correcting —
        // saying "you're too fast" is noise, so those stay silent.
        if (res.status !== 429) notify(data.error || t('chatSendFailed'), 'error');
        return false;
      }
      return true;
    } catch {
      notify(t('chatSendFailed'), 'error');
      return false;
    } finally {
      setSending(false);
    }
  }, [roomId, playerName, notify, t, API_BASE]);

  const sendMessage = useCallback((text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return Promise.resolve(false);
    return post({ message: trimmed });
  }, [post]);

  const sendEmoji = useCallback((emoji) => post({ emoji }), [post]);

  return { messages, emojiSet, chatOpen, sending, sendMessage, sendEmoji, PHASES };
}
