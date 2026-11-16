// The one way a page talks to Lumi (POST /api/ai/chat).
//
// Three pages had their own copy of this and two of them sent `message` while
// the server reads `messages`, so the model only ever saw the system prompt and
// answered every question with a self-introduction (2026-11-12). Building the
// request here keeps every page on the same shape.
import { API_BASE } from '../config/api.js';

const HISTORY_TURNS = 6;
// A learner's file is small, but a pasted block of output can be huge; the
// model reads every character before it writes the first one (CPU-only host).
const MAX_CODE_CHARS = 4000;

const SYSTEM_INTRO = 'คุณคือ Lumi ผู้ช่วยสอน Python ของผู้เรียนที่เพิ่งเริ่มต้น ตอบเป็นภาษาไทย สั้น ตรงประเด็น';
const NO_FULL_SOLUTION = 'ตอบเรื่องโจทย์ข้อนี้โดยตรง ถ้าผู้เรียนขอให้เขียนโค้ดให้ อย่าเฉลยทั้งข้อ ให้บอกแนวทางและชี้จุดที่ต้องแก้แทน';

const asText = (value) => (Array.isArray(value) ? value.join('\n') : String(value ?? '')).trim();

/**
 * @param {object} context
 * @param {string} [context.title]        the problem's title
 * @param {string|string[]} [context.description] the problem's instructions
 * @param {string|number} [context.level] the learner's level
 * @param {string} [context.code]         the code in the editor now
 * @param {{role: string, text: string}[]} [context.history] the chat so far, `ai`/`user` roles
 * @param {string} context.userText       the question being asked now
 */
export function buildLumiMessages({ title, description, level, code, history = [], userText }) {
  const lines = [SYSTEM_INTRO, NO_FULL_SOLUTION];
  if (asText(title)) lines.push(`โจทย์: ${asText(title)}`);
  if (asText(description)) lines.push(`คำอธิบายโจทย์:\n${asText(description)}`);
  if (asText(level)) lines.push(`ระดับของผู้เรียน: ${asText(level)}`);
  const source = String(code ?? '');
  if (source.trim()) lines.push(`โค้ดล่าสุดของผู้เรียน:\n${source.slice(0, MAX_CODE_CHARS)}`);

  const earlier = history
    .filter((m) => (m?.role === 'user' || m?.role === 'ai') && asText(m.text) && !m.pending)
    .slice(-HISTORY_TURNS)
    .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: asText(m.text) }));

  return [
    { role: 'system', content: lines.join('\n') },
    ...earlier,
    { role: 'user', content: String(userText ?? '') },
  ];
}

// Splits a text/event-stream body into the JSON payloads of its `data:` lines.
function* parseEvents(buffer) {
  for (const block of buffer.split('\n\n')) {
    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!data) continue;
    try {
      yield JSON.parse(data);
    } catch {
      // A malformed event is skipped rather than ending the answer.
    }
  }
}

export class LumiError extends Error {
  constructor(message, partial = '') {
    super(message);
    this.name = 'LumiError';
    this.partial = partial;
  }
}

/**
 * Asks Lumi and reports the answer as it is written.
 *
 * `onText` receives the whole answer so far each time more arrives, so a page
 * can simply set its chat bubble to it. Resolves with the full answer.
 * Rejects with a LumiError (its `partial` holds whatever arrived) or, when the
 * learner pressed stop, with the AbortError from `signal`.
 */
export async function streamLumi({ messages, onText = () => {}, signal, fetchImpl = fetch }) {
  const response = await fetchImpl(`${API_BASE.replace(/\/+$/, '')}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new LumiError(body?.reply || body?.error || `HTTP ${response.status}`);
  }

  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/event-stream') || !response.body) {
    // An older server answers with one JSON reply.
    const body = await response.json().catch(() => null);
    const reply = String(body?.reply || '');
    onText(reply);
    return reply;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let answer = '';
  for (;;) {
    const { value, done } = await reader.read();
    pending += decoder.decode(value || new Uint8Array(), { stream: !done });
    const cut = done ? pending.length : pending.lastIndexOf('\n\n') + 2;
    if (cut > 1) {
      for (const event of parseEvents(pending.slice(0, cut))) {
        if (typeof event.text === 'string') {
          answer += event.text;
          onText(answer);
        } else if (event.error) {
          throw new LumiError(String(event.error), answer);
        }
      }
      pending = pending.slice(cut);
    }
    if (done) break;
  }
  if (!answer.trim()) throw new LumiError('empty reply');
  return answer;
}
