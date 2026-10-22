// A stand-in for Ollama's OpenAI-compatible endpoint, for tests that boot the
// real server with LLM_BASE_URL pointing here (Spec 0004: the one test seam for
// every AI job). It records every request and answers however the test says.
const http = require('node:http');

const completion = (model, content) => ({
  id: 'chatcmpl-fake',
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model,
  choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
});

async function startFakeOllama() {
  const requests = [];
  // reply(request) returns one of:
  //   { content }            200 with that assistant message
  //   { status, body }       that HTTP status and JSON body
  //   { delayMs, ...above }  the same, after waiting
  let reply = () => ({ content: 'สวัสดีจาก Ollama ปลอม' });

  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', async () => {
      let body = null;
      try { body = JSON.parse(raw || 'null'); } catch { body = raw; }
      const request = { method: req.method, path: req.url, body };
      requests.push(request);
      const answer = (await reply(request)) || {};
      if (answer.delayMs) await new Promise(resolve => setTimeout(resolve, answer.delayMs));
      if (res.destroyed) return;
      if (answer.status && answer.status !== 200) {
        res.writeHead(answer.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(answer.body || { error: 'fake failure' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(completion(body?.model, answer.content ?? '')));
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

  return {
    baseURL: `http://127.0.0.1:${server.address().port}/v1`,
    requests,
    chatRequests: () => requests.filter(r => r.path === '/v1/chat/completions'),
    respond: fn => { reply = fn; },
    reset: () => { requests.length = 0; },
    close: () => new Promise(resolve => {
      server.closeAllConnections?.();
      server.close(resolve);
    }),
  };
}

module.exports = { startFakeOllama };
