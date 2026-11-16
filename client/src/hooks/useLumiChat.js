import { useCallback, useEffect, useRef, useState } from 'react';
import { streamLumi } from '../utils/lumiChat';

// Shared by every Lumi chat panel: one question in flight at a time, the answer
// shown as it is written, and a stop button that really stops it (the server
// drops the model's request when the browser goes away).
export default function useLumiChat() {
  const controllerRef = useRef(null);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  /**
   * Resolves with `{ text, stopped, failed }` and never rejects: `text` is the
   * answer, or the part that arrived before the learner stopped it or the
   * connection failed. `onText` is called with the answer so far as it grows.
   */
  const ask = useCallback(async (messages, onText) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsResponding(true);
    let soFar = '';
    try {
      const text = await streamLumi({
        messages,
        signal: controller.signal,
        onText: (answer) => {
          soFar = answer;
          onText?.(answer);
        },
      });
      return { text, stopped: false, failed: false };
    } catch (error) {
      const stopped = controller.signal.aborted;
      return { text: error?.partial || soFar, stopped, failed: !stopped };
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsResponding(false);
      }
    }
  }, []);

  return { ask, stop, isResponding };
}
