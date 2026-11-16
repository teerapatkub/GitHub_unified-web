// The one place the server talks to a language model.
//
// The model runs on our own machine: Ollama's OpenAI-compatible endpoint at
// LLM_BASE_URL (Spec 0004 - the project must run its own model rather than call
// a provider with an API key). Lumi, the exercise generator, Competitive advice
// and Arcade's post-match advice use it; the translation script follows.
//
// Each job names its own model in .env (LLM_CHAT_MODEL, LLM_JUDGE_MODEL,
// LLM_ADVICE_MODEL) so they can be split onto different models later without a
// code change, even while they all point at the same one. Leaving the base URL
// or a job's model empty turns that job off: the caller throws at once, and
// every caller already has a non-AI fallback it must use instead.
const OpenAI = require('openai');

const DEFAULT_TIMEOUT_MS = 45000;

// Ollama ignores the key, but the OpenAI client refuses to start without one.
const UNUSED_API_KEY = 'ollama';

const toText = value => String(value ?? '').trim();

function llmSettingsFromEnv(env = process.env) {
  return {
    baseURL: toText(env.LLM_BASE_URL).replace(/\/+$/, ''),
    timeoutMs: Number(env.LLM_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

// Qwen3-family models can reason before answering. Every job here wants a
// short answer fast, and reasoning both costs seconds on a 4 GB GPU and eats the
// token budget a JSON answer needs, so it is switched off per request. A server
// that does not know the switch answers 400; the caller then drops it for good.
const NO_THINKING = { reasoning_effort: 'none' };
const rejectsThinkingSwitch = error => error?.status === 400 && /reason|think/i.test(String(error?.message || ''));

// Whatever reasoning still comes back inside <think>...</think> is never shown:
// a learner should not read it, and it breaks JSON parsing outright.
const withoutThinking = reply => reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

// The same, for an answer that arrives in pieces: a tag can be cut anywhere,
// so the end of each piece that could be the start of a tag is held back.
function createThinkingFilter() {
  const OPEN = '<think>';
  const CLOSE = '</think>';
  let buffer = '';
  let inside = false;
  let started = false;
  const emit = text => {
    if (!started) {
      text = text.replace(/^\s+/, '');
      if (text) started = true;
    }
    return text;
  };
  const heldBack = (text, tag) => {
    for (let k = Math.min(tag.length - 1, text.length); k > 0; k -= 1) {
      if (tag.startsWith(text.slice(-k))) return k;
    }
    return 0;
  };
  return {
    push(piece) {
      buffer += piece;
      let out = '';
      for (;;) {
        if (inside) {
          const end = buffer.indexOf(CLOSE);
          if (end < 0) {
            buffer = buffer.slice(buffer.length - heldBack(buffer, CLOSE));
            return emit(out);
          }
          buffer = buffer.slice(end + CLOSE.length);
          inside = false;
          continue;
        }
        const start = buffer.indexOf(OPEN);
        if (start >= 0) {
          out += buffer.slice(0, start);
          buffer = buffer.slice(start + OPEN.length);
          inside = true;
          continue;
        }
        const hold = heldBack(buffer, OPEN);
        out += buffer.slice(0, buffer.length - hold);
        buffer = buffer.slice(buffer.length - hold);
        return emit(out);
      }
    },
    end() {
      const rest = inside ? '' : buffer;
      buffer = '';
      return emit(rest).replace(/\s+$/, '');
    },
  };
}

// --- One queue per model server --------------------------------------------
//
// Ollama answers one request at a time (OLLAMA_NUM_PARALLEL=1: on a CPU-only
// host two at once only halves the speed of each). Before this queue, every job
// went straight to Ollama's own first-come queue, so a learner asking Lumi could
// wait behind a two-minute problem generation. Now:
//   interactive - someone is watching the answer appear (Lumi, Competitive advice)
//   normal      - someone is waiting for a result (live generation, Arcade advice)
//   idle        - nobody is waiting (filling the pool of ready-made problems);
//                 it is cancelled the moment anyone else needs the model, and
//                 its caller gets an error with code LLM_PREEMPTED.
const PRIORITY = { interactive: 0, normal: 1, idle: 2 };

const abortError = (signal) => {
  const reason = signal?.reason;
  if (reason instanceof Error) return reason;
  return Object.assign(new Error('The request was aborted'), { name: 'AbortError' });
};

function createScheduler({ concurrency = 1 } = {}) {
  const waiting = [];
  const running = new Set();
  let order = 0;

  const pump = () => {
    while (running.size < concurrency && waiting.length > 0) {
      waiting.sort((a, b) => a.rank - b.rank || a.order - b.order);
      waiting.shift().grant();
    }
  };

  // Resolves with { signal, release } once a slot is free. The signal aborts
  // when the caller's own signal does, or when an idle job is pre-empted.
  const acquire = (priority = 'normal', { signal } = {}) => new Promise((resolve, reject) => {
    const rank = PRIORITY[priority] ?? PRIORITY.normal;
    const controller = new AbortController();
    const lease = { rank, controller, released: false };
    const release = () => {
      if (lease.released) return;
      lease.released = true;
      running.delete(lease);
      pump();
    };
    const job = {
      rank,
      order: order++,
      grant: () => {
        running.add(lease);
        resolve({ signal: controller.signal, release });
      },
    };
    if (signal) {
      if (signal.aborted) return reject(abortError(signal));
      signal.addEventListener('abort', () => {
        const index = waiting.indexOf(job);
        if (index >= 0) {
          waiting.splice(index, 1);
          reject(abortError(signal));
        } else {
          controller.abort(signal.reason);
        }
      }, { once: true });
    }
    waiting.push(job);
    if (rank < PRIORITY.idle) {
      for (const other of running) {
        if (other.rank === PRIORITY.idle) {
          other.controller.abort(Object.assign(new Error('pre-empted by a job somebody is waiting for'), { code: 'LLM_PREEMPTED' }));
        }
      }
    }
    pump();
  });

  return {
    acquire,
    // Nothing running and nothing waiting: the moment to do idle work.
    isIdle: () => running.size === 0 && waiting.length === 0,
    size: () => running.size + waiting.length,
  };
}

const schedulers = new Map();
function schedulerFor(baseURL) {
  if (!schedulers.has(baseURL)) schedulers.set(baseURL, createScheduler());
  return schedulers.get(baseURL);
}

function toApiMessages({ messages, systemInstruction }) {
  const apiMessages = [];
  if (systemInstruction) apiMessages.push({ role: 'system', content: String(systemInstruction) });
  for (const message of (Array.isArray(messages) ? messages : [])) {
    apiMessages.push({ role: message?.role || 'user', content: String(message?.content ?? '') });
  }
  return apiMessages;
}

// `job` names the caller in errors and logs ("chat", "judge", "advice").
// `priority` is this caller's default place in the queue (see PRIORITY above).
function createLlmCaller({ baseURL, model, timeoutMs = DEFAULT_TIMEOUT_MS, job = 'llm', priority: defaultPriority = 'normal' } = {}) {
  const url = toText(baseURL);
  const modelName = toText(model);
  const enabled = Boolean(url && modelName);
  // Retries are off: the SDK retries timeouts too, so a model that hangs rather
  // than erroring would cost the caller two full timeouts instead of one.
  const client = enabled
    ? new OpenAI({ apiKey: UNUSED_API_KEY, baseURL: url, maxRetries: 0, timeout: timeoutMs })
    : null;
  const scheduler = enabled ? schedulerFor(url) : null;
  let thinkingSwitch = NO_THINKING;

  const failure = (error, signal) => {
    if (error?.code === 'LLM_PREEMPTED' || signal?.reason?.code === 'LLM_PREEMPTED') {
      return Object.assign(new Error(`Local model "${modelName}" for ${job} was pre-empted`), { code: 'LLM_PREEMPTED' });
    }
    const status = error?.status || error?.response?.status;
    // The status travels with the error: a caller that can wait (Arcade
    // advice) retries a busy model (503 when Ollama's queue is full).
    return Object.assign(
      new Error(`Local model "${modelName}" for ${job} failed${status ? ` (HTTP ${status})` : ''}: ${error?.message || 'unknown error'}`),
      { status, code: error?.code },
    );
  };

  const requireClient = (messages, systemInstruction) => {
    if (!client) {
      throw new Error(`No local model is configured for ${job} (set LLM_BASE_URL and its model in .env)`);
    }
    const apiMessages = toApiMessages({ messages, systemInstruction });
    if (apiMessages.length === 0) throw new Error(`${job} was given no messages to send`);
    return apiMessages;
  };

  // Asks once with the thinking switch, and once more without it if this
  // server rejects the switch (then never sends it again).
  const withThinkingFallback = async request => {
    try {
      return await request();
    } catch (error) {
      if (!thinkingSwitch.reasoning_effort || !rejectsThinkingSwitch(error)) throw error;
      thinkingSwitch = {};
      return request();
    }
  };

  // `timeoutMs` shortens the wait for one call below the caller-wide default
  // (never lengthens it), for a job whose answer is optional and must not hold
  // a response back. Time spent waiting in the queue is not counted.
  const call = async ({ messages, systemInstruction = '', temperature = 0.7, maxTokens = 2048, json = false, timeoutMs: callTimeoutMs, priority = defaultPriority, signal } = {}) => {
    const apiMessages = requireClient(messages, systemInstruction);
    const lease = await scheduler.acquire(priority, { signal });
    let completion;
    try {
      completion = await withThinkingFallback(() => client.chat.completions.create({
        model: modelName,
        messages: apiMessages,
        temperature,
        max_tokens: maxTokens,
        ...thinkingSwitch,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        stream: false,
      }, {
        signal: lease.signal,
        ...(callTimeoutMs ? { timeout: Math.min(callTimeoutMs, timeoutMs) } : {}),
      }));
    } catch (error) {
      throw failure(error, lease.signal);
    } finally {
      lease.release();
    }

    const reply = withoutThinking(String(completion?.choices?.[0]?.message?.content || ''));
    if (!reply) {
      const finish = completion?.choices?.[0]?.finish_reason;
      throw new Error(`Local model "${modelName}" for ${job} returned an empty reply${finish ? ` (finish_reason: ${finish})` : ''}`);
    }
    return reply;
  };

  // The answer as it is written, piece by piece, for a reader who is watching
  // (Lumi). On a CPU-only host a short answer takes tens of seconds to finish,
  // but the first words can be on screen in a few.
  //
  // `firstTokenMs` limits the wait for the first piece once the model has the
  // request; `idleMs` limits any later gap. The whole answer has no limit of its
  // own: an answer that keeps coming is never cut off.
  async function* stream({ messages, systemInstruction = '', temperature = 0.7, maxTokens = 2048, priority = 'interactive', signal, firstTokenMs = timeoutMs, idleMs = timeoutMs } = {}) {
    const apiMessages = requireClient(messages, systemInstruction);
    const lease = await scheduler.acquire(priority, { signal });
    const controller = new AbortController();
    const follow = source => source?.addEventListener('abort', () => controller.abort(source.reason), { once: true });
    follow(lease.signal);
    follow(signal);
    let timer = null;
    const arm = ms => {
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(new Error(`no answer from the model for ${ms} ms`)), ms);
    };
    const filter = createThinkingFilter();
    let wrote = false;
    try {
      arm(firstTokenMs);
      const response = await withThinkingFallback(() => client.chat.completions.create({
        model: modelName,
        messages: apiMessages,
        temperature,
        max_tokens: maxTokens,
        ...thinkingSwitch,
        stream: true,
      }, { signal: controller.signal, timeout: firstTokenMs }));
      for await (const part of response) {
        const piece = part?.choices?.[0]?.delta?.content;
        if (!piece) continue;
        arm(idleMs);
        const text = filter.push(piece);
        if (text) {
          wrote = true;
          yield text;
        }
      }
      // An aborted stream can simply end instead of throwing: a model that went
      // quiet must still count as a failure, not as a finished answer.
      if (controller.signal.aborted) throw controller.signal.reason || new Error('aborted');
      const rest = filter.end();
      if (rest) {
        wrote = true;
        yield rest;
      }
      if (!wrote) throw new Error('returned an empty reply');
    } catch (error) {
      if (signal?.aborted) throw abortError(signal);
      const reason = controller.signal.aborted ? controller.signal.reason : null;
      throw failure(reason instanceof Error && reason.code !== 'LLM_PREEMPTED' ? reason : error, lease.signal);
    } finally {
      clearTimeout(timer);
      lease.release();
    }
  }

  return {
    enabled,
    model: modelName,
    baseURL: url,
    call,
    stream,
    isIdle: () => !scheduler || scheduler.isIdle(),
  };
}

module.exports = { createLlmCaller, llmSettingsFromEnv, createScheduler, createThinkingFilter };
