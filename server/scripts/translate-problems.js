/**
 * Fill in the English half of the problem bank.
 *
 *   node scripts/translate-problems.js [--mode lesson] [--limit 10] [--batch 5] [--dry]
 *
 * Only 40 of the 192 problems (the Arcade ones) were ever written in two
 * languages, so switching the site to EN left the other 152 showing Thai. The
 * merged `problems` table has title_en/desc_en/hint_en on every row already;
 * this fills them.
 *
 * WHAT THIS TOUCHES, AND WHAT IT MUST NOT
 * ---------------------------------------
 * Prose only: title, description, hint. `starter_code`, `solution_code` and
 * `test_cases` are never written by this script, because they are what decides
 * whether a learner's answer is correct. scripts/bilingual-check.js hashes those
 * three columns and compares against scripts/problem-code-baseline.json to prove
 * it.
 *
 * Thirteen problems expect the learner's program to PRINT THAI. For those the
 * Thai string is part of the specification, not part of the prose: an English
 * description that says print "Welcome to the Python lesson" describes a program
 * that fails every test case. Those literals are pinned - handed to the model as
 * strings to keep byte for byte, then verified in the reply before the row is
 * written.
 *
 * Rows already written in English (several competitive ones are) are copied
 * across without spending a request.
 *
 * Re-running skips whatever is already translated, so a partial run - or a new
 * batch of problems added later - costs only the rows that still need it.
 */
require('dotenv').config();
const OpenAI = require('openai');
const { Client } = require('pg');

const argv = process.argv.slice(2);
// Accepts both --mode=lesson and --mode lesson; a flag with no value is true.
const arg = (name, fallback) => {
    const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (i === -1) return fallback;
    if (argv[i].includes('=')) return argv[i].split('=').slice(1).join('=');
    const next = argv[i + 1];
    return next && !next.startsWith('--') ? next : true;
};
const MODE = arg('mode', null);
const LIMIT = Number(arg('limit', 0)) || 0;
const BATCH = Math.max(1, Number(arg('batch', 5)) || 5);
const DRY = Boolean(arg('dry', false));
// --force retranslates rows that already have English, for fixing a bad batch.
const FORCE = Boolean(arg('force', false));
const IDS = String(arg('ids', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

// Same key and model as the Lumi chatbot (NVIDIA_API_KEY / NVIDIA_AI_MODEL).
// Deliberately NOT the Arcade code judge's key: that one runs at the end of every
// round of every live match, and its token budget is not spare capacity for a
// batch job. See the AI Models table in CLAUDE.md.
const API_KEY = String(process.env.NVIDIA_API_KEY || '').trim();
const MODEL = String(process.env.NVIDIA_AI_MODEL || '').trim();
const TIMEOUT_MS = Number(process.env.NVIDIA_AI_TIMEOUT_MS || 90000);

if (!API_KEY || !MODEL) {
    console.error('NVIDIA_API_KEY / NVIDIA_AI_MODEL are not set in server/.env');
    process.exit(1);
}

const ai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    maxRetries: 0,
    timeout: TIMEOUT_MS,
});

const THAI_CLASS = '฀-๿';
const THAI = new RegExp(`[${THAI_CLASS}]`);
const hasThai = (s) => THAI.test(String(s || ''));

// Maximal runs of Thai text, including the spaces inside them. "สวัสดี Lumi"
// yields "สวัสดี", so a description that writes the value as a placeholder is
// still matched by the part that has to survive translation.
const RUN_RE = new RegExp(`[${THAI_CLASS}]+(?:[ ${THAI_CLASS}]*[${THAI_CLASS}])?`, 'g');
const thaiRuns = (text) => {
    const out = [];
    for (const m of String(text || '').matchAll(RUN_RE)) {
        const run = m[0].trim();
        if (run.length >= 2) out.push(run);
    }
    return out;
};

// The Thai literals a correct answer has to produce, gathered from the test
// cases rather than guessed from the prose.
const pinnedStrings = (testCases) => {
    const found = new Set();
    const walk = (v) => {
        if (typeof v === 'string') { thaiRuns(v).forEach((r) => found.add(r)); return; }
        if (Array.isArray(v)) { v.forEach(walk); return; }
        if (v && typeof v === 'object') { Object.values(v).forEach(walk); }
    };
    walk(testCases);
    return [...found].sort((a, b) => b.length - a.length);
};

const SYSTEM = [
    'You translate Thai programming-exercise text into English for a Python learning site aimed at beginners.',
    'Reply with JSON only - no markdown fence, no commentary.',
    'Keep the instructional voice and the level of detail of the original. Do not add hints and do not shorten.',
    'Never translate Python keywords, function or variable names, module names, or anything the program is supposed to output.',
    'A block headed MUST_PRINT lists text the learner’s program has to print character for character.',
    'Wherever the Thai text quotes one of those strings, quote the very same characters in the English text - translating one turns a correct answer into a wrong one.',
    'MUST_PRINT is a constraint for you, not part of the problem: never repeat the heading or the list itself in your answer.',
].join('\n');

const buildPrompt = (items) => {
    const blocks = items.map((it) => {
        const lines = [`### id ${it.problem_id}`];
        if (it.needTitle) lines.push(`title_th: ${it.title_th}`);
        if (it.needDesc) lines.push(`desc_th: ${it.desc_th}`);
        if (it.needHint) lines.push(`hint_th: ${it.hint_th}`);
        if (it.pinned.length) lines.push(`MUST_PRINT: ${it.pinned.map((s) => JSON.stringify(s)).join(', ')}`);
        return lines.join('\n');
    });
    const shape = items.map((it) => {
        const fields = [];
        if (it.needTitle) fields.push('"title_en":"..."');
        if (it.needDesc) fields.push('"desc_en":"..."');
        if (it.needHint) fields.push('"hint_en":"..."');
        return `{"id":${it.problem_id},${fields.join(',')}}`;
    }).join(',');
    return `${blocks.join('\n\n')}\n\nReturn exactly this JSON array shape, same ids, same order:\n[${shape}]`;
};

const parseReply = (raw) => {
    let text = String(raw || '').trim();
    // Models fence the JSON even when told not to.
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) text = fence[1].trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('reply contained no JSON array');
    return JSON.parse(text.slice(start, end + 1));
};

// A translation is accepted only if it still describes the same program.
const validate = (item, got) => {
    const problems = [];
    const check = (need, field, sourceText, value) => {
        if (!need) return null;
        const text = String(value ?? '').trim();
        if (!text) { problems.push(`${field} empty`); return null; }
        // The pinned-string list is an instruction to the model, not content.
        // One reply pasted the whole heading into the description.
        if (/MUST_PRINT|KEEP EXACTLY/i.test(text)) { problems.push(`${field} echoed the prompt scaffolding`); return null; }
        for (const pin of item.pinned) {
            // Only literals the Thai text itself spelled out are required back -
            // the model cannot restore what was never there.
            if (String(sourceText).includes(pin) && !text.includes(pin)) {
                problems.push(`${field} dropped required output string ${JSON.stringify(pin)}`);
            }
        }
        // Leftover Thai that is not one of the pinned literals means the model
        // gave up on part of the text instead of translating it.
        const stray = thaiRuns(text).filter((r) => !item.pinned.some((p) => p.includes(r) || r.includes(p)));
        if (stray.length) problems.push(`${field} still Thai: ${JSON.stringify(stray.slice(0, 2))}`);
        return text;
    };
    const out = {
        title_en: check(item.needTitle, 'title_en', item.title_th, got?.title_en),
        desc_en: check(item.needDesc, 'desc_en', item.desc_th, got?.desc_en),
        hint_en: check(item.needHint, 'hint_en', item.hint_th, got?.hint_en),
    };
    return { out, problems };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    const where = [];
    const params = [];
    if (!FORCE) {
        where.push(`(coalesce(btrim(p.title_en),'') = '' OR coalesce(btrim(p.desc_en),'') = ''
                    OR (coalesce(btrim(p.hint_th),'') <> '' AND coalesce(btrim(p.hint_en),'') = ''))`);
    }
    if (MODE) { params.push(MODE); where.push(`m.mode = $${params.length}`); }
    if (IDS.length) { params.push(IDS); where.push(`p.problem_id = ANY($${params.length}::bigint[])`); }

    const { rows } = await c.query(`
        SELECT DISTINCT ON (p.problem_id)
               p.problem_id, p.title_th, p.desc_th, p.hint_th,
               p.title_en, p.desc_en, p.hint_en, p.test_cases, m.mode
          FROM problems p JOIN problem_modes m ON m.problem_id = p.problem_id
         ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY p.problem_id`, params);

    const queue = rows.map((r) => ({
        ...r,
        pinned: pinnedStrings(r.test_cases),
        needTitle: FORCE || !String(r.title_en || '').trim(),
        needDesc: FORCE || !String(r.desc_en || '').trim(),
        needHint: Boolean(String(r.hint_th || '').trim()) && (FORCE || !String(r.hint_en || '').trim()),
    })).slice(0, LIMIT || undefined);

    const write = async (id, out) => {
        if (DRY) return;
        await c.query(`
            UPDATE problems
               SET title_en = COALESCE($2, title_en),
                   desc_en  = COALESCE($3, desc_en),
                   hint_en  = COALESCE($4, hint_en),
                   updated_at = NOW()
             WHERE problem_id = $1`,
            [id, out.title_en, out.desc_en, out.hint_en]);
    };

    // Rows already written in English cost nothing - copy them straight across.
    const needsAi = [];
    let copied = 0;
    for (const it of queue) {
        const out = { title_en: null, desc_en: null, hint_en: null };
        if (it.needTitle && !hasThai(it.title_th)) { out.title_en = String(it.title_th || '').trim() || null; it.needTitle = false; }
        if (it.needDesc && !hasThai(it.desc_th)) { out.desc_en = String(it.desc_th || '').trim() || null; it.needDesc = false; }
        if (it.needHint && !hasThai(it.hint_th)) { out.hint_en = String(it.hint_th || '').trim() || null; it.needHint = false; }
        if (out.title_en || out.desc_en || out.hint_en) { await write(it.problem_id, out); copied++; }
        if (it.needTitle || it.needDesc || it.needHint) needsAi.push(it);
    }
    console.log(`${queue.length} problems to fill | ${copied} already English (copied) | ${needsAi.length} need translating`);

    const failures = [];
    let done = 0;

    const runBatch = async (items, attempt = 1) => {
        let reply = null;
        try {
            const completion = await ai.chat.completions.create({
                model: MODEL,
                messages: [
                    { role: 'system', content: SYSTEM },
                    { role: 'user', content: buildPrompt(items) },
                ],
                temperature: 0.2,
                top_p: 0.95,
                max_tokens: 4096,
                chat_template_kwargs: { thinking: false },
                stream: false,
            });
            reply = String(completion?.choices?.[0]?.message?.content || '');
        } catch (e) {
            console.log(`   request failed (attempt ${attempt}): ${e.message}`);
        }

        let parsed = null;
        if (reply) {
            try { parsed = parseReply(reply); } catch (e) { console.log(`   ${e.message} (attempt ${attempt})`); }
        }

        const retry = [];
        if (!Array.isArray(parsed)) {
            retry.push(...items);
        } else {
            const byId = new Map(parsed.filter(Boolean).map((r) => [String(r.id ?? r.problem_id), r]));
            for (const it of items) {
                const got = byId.get(String(it.problem_id));
                if (!got) { retry.push(it); continue; }
                const { out, problems } = validate(it, got);
                if (problems.length) {
                    console.log(`   #${it.problem_id} rejected: ${problems.join(' | ')}`);
                    retry.push(it);
                    continue;
                }
                await write(it.problem_id, out);
                done++;
                console.log(`   #${it.problem_id} [${it.mode}] ${String(out.title_en || it.title_en).slice(0, 60)}`);
            }
        }

        if (!retry.length) return;
        if (attempt >= 3) {
            // One at a time gives the model the least to get wrong; if it still
            // fails, the row is left in Thai rather than written half right.
            if (items.length > 1) { for (const it of retry) await runBatch([it], 1); return; }
            failures.push(`#${retry[0].problem_id} [${retry[0].mode}] ${retry[0].title_th}`);
            return;
        }
        await sleep(1500 * attempt);
        await runBatch(retry, attempt + 1);
    };

    for (let i = 0; i < needsAi.length; i += BATCH) {
        const slice = needsAi.slice(i, i + BATCH);
        console.log(`\n[${i + 1}-${i + slice.length} of ${needsAi.length}] ${slice.map((s) => '#' + s.problem_id).join(' ')}`);
        await runBatch(slice);
    }

    const { rows: [left] } = await c.query(
        `SELECT count(*)::int AS n FROM problems WHERE coalesce(btrim(title_en),'') = '' OR coalesce(btrim(desc_en),'') = ''`);
    await c.end();

    console.log(`\ntranslated ${done} | copied ${copied} | still Thai-only ${left.n}`);
    if (failures.length) {
        console.log(`\n${failures.length} could not be translated and were left untouched:`);
        failures.forEach((f) => console.log('  ' + f));
    }
    process.exitCode = failures.length ? 1 : 0;
})();
