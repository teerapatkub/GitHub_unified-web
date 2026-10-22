// The one place the server talks to a language model.
//
// The model runs on our own machine: Ollama's OpenAI-compatible endpoint at
// LLM_BASE_URL (Spec 0004 - the project must run its own model rather than call
// a provider with an API key). Lumi and the exercise generator use it today;
// the Competitive judge, Arcade advice and the translation script move here in
// the tickets that follow.
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

function toApiMessages({ messages, systemInstruction }) {
  const apiMessages = [];
  if (systemInstruction) apiMessages.push({ role: 'system', content: String(systemInstruction) });
  for (const message of (Array.isArray(messages) ? messages : [])) {
    apiMessages.push({ role: message?.role || 'user', content: String(message?.content ?? '') });
  }
  return apiMessages;
}

// `job` names the caller in errors and logs ("chat", "judge", "advice").
function createLlmCaller({ baseURL, model, timeoutMs = DEFAULT_TIMEOUT_MS, job = 'llm' } = {}) {
  const url = toText(baseURL);
  const modelName = toText(model);
  const enabled = Boolean(url && modelName);
  // Retries are off: the SDK retries timeouts too, so a model that hangs rather
  // than erroring would cost the caller two full timeouts instead of one.
  const client = enabled
    ? new OpenAI({ apiKey: UNUSED_API_KEY, baseURL: url, maxRetries: 0, timeout: timeoutMs })
    : null;
  let thinkingSwitch = NO_THINKING;

  // `timeoutMs` shortens the wait for one call below the caller-wide default
  // (never lengthens it),
  // for a job whose answer is optional and must not hold a response back.
  const call = async ({ messages, systemInstruction = '', temperature = 0.7, maxTokens = 2048, json = false, timeoutMs: callTimeoutMs } = {}) => {
    if (!client) {
      throw new Error(`No local model is configured for ${job} (set LLM_BASE_URL and its model in .env)`);
    }
    const apiMessages = toApiMessages({ messages, systemInstruction });
    if (apiMessages.length === 0) throw new Error(`${job} was given no messages to send`);

    const request = () => client.chat.completions.create({
      model: modelName,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
      ...thinkingSwitch,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      stream: false,
    }, callTimeoutMs ? { timeout: Math.min(callTimeoutMs, timeoutMs) } : undefined);

    let completion;
    try {
      try {
        completion = await request();
      } catch (error) {
        if (!thinkingSwitch.reasoning_effort || !rejectsThinkingSwitch(error)) throw error;
        thinkingSwitch = {};
        completion = await request();
      }
    } catch (error) {
      const status = error?.status || error?.response?.status;
      throw new Error(`Local model "${modelName}" for ${job} failed${status ? ` (HTTP ${status})` : ''}: ${error?.message || 'unknown error'}`);
    }

    const reply = withoutThinking(String(completion?.choices?.[0]?.message?.content || ''));
    if (!reply) {
      const finish = completion?.choices?.[0]?.finish_reason;
      throw new Error(`Local model "${modelName}" for ${job} returned an empty reply${finish ? ` (finish_reason: ${finish})` : ''}`);
    }
    return reply;
  };

  return { enabled, model: modelName, baseURL: url, call };
}

module.exports = { createLlmCaller, llmSettingsFromEnv };
