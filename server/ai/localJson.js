// Ask the local model (Ollama, Spec 0004) for one JSON object, for the
// generators admins and players run on demand: lesson pre/post quizzes and
// Competitive problems. These were first written against Gemini with an API
// key; the advisor's rule is no external AI provider, so they share the
// chatbot's local model (LLM_CHAT_MODEL) - the same model that already writes
// practice problems.
//
// A generation is long (a 4B model on a 4 GB laptop GPU writes ~13 tokens/s;
// ten quiz questions are ~2,000 tokens) and someone is waiting on a preview,
// not a game clock, so it gets its own, longer timeout: LLM_GENERATE_TIMEOUT_MS.
//
// Errors carry an HTTP status the routes pass straight to the browser, and
// never the model's own text.
const { createLlmCaller, llmSettingsFromEnv } = require('./llm');

const DEFAULT_GENERATE_TIMEOUT_MS = 240000;
const fail = (status, message) => Object.assign(new Error(message), { status });

// The first {...} block, so a stray sentence or code fence around it does not
// throw the whole answer away.
const firstJsonObject = (raw) => {
  const text = String(raw || '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON object');
  return JSON.parse(text.slice(start, end + 1));
};

function createLocalJsonAsker(env = process.env, { createCaller = createLlmCaller } = {}) {
  const llm = createCaller({
    ...llmSettingsFromEnv(env),
    model: env.LLM_CHAT_MODEL,
    timeoutMs: Number(env.LLM_GENERATE_TIMEOUT_MS) || DEFAULT_GENERATE_TIMEOUT_MS,
    job: 'generate',
  });

  // `schema` is a JSON Schema; Ollama's JSON mode does not enforce one, so it
  // goes into the instruction and every caller validates the result itself.
  return async function askLocalJson({ instruction, data, schema, maxTokens = 4096, priority = 'normal' }) {
    if (!llm.enabled) {
      throw fail(503, 'ยังไม่ได้ตั้งค่าโมเดลในเครื่อง (LLM_BASE_URL และ LLM_CHAT_MODEL) จึงสร้างด้วย AI ไม่ได้');
    }
    const shape = schema ? `\nReturn ONLY one JSON object matching this JSON Schema:\n${JSON.stringify(schema)}` : '\nReturn ONLY one JSON object.';
    let raw;
    try {
      raw = await llm.call({
        systemInstruction: `${instruction}${shape}`,
        messages: [{ role: 'user', content: typeof data === 'string' ? data : JSON.stringify(data) }],
        temperature: 0.4,
        maxTokens,
        json: true,
        priority,
      });
    } catch (error) {
      // Idle work cancelled for someone else: the caller tries again later.
      if (error?.code === 'LLM_PREEMPTED') throw error;
      if (Number(error?.status) === 503 || Number(error?.status) === 429) throw fail(429, 'โมเดลในเครื่องกำลังทำงานอื่นอยู่ กรุณารอสักครู่แล้วลองใหม่');
      if (/timed? ?out|abort/i.test(String(error?.message))) throw fail(504, 'โมเดลในเครื่องใช้เวลานานเกินไป กรุณาลองใหม่');
      throw fail(502, 'โมเดลในเครื่องไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง');
    }
    try {
      return firstJsonObject(raw);
    } catch {
      throw fail(422, 'AI ส่งข้อมูลไม่ครบหรืออ่านผลลัพธ์ไม่ได้ กรุณาสร้างใหม่');
    }
  };
}

module.exports = { createLocalJsonAsker, firstJsonObject, DEFAULT_GENERATE_TIMEOUT_MS };
