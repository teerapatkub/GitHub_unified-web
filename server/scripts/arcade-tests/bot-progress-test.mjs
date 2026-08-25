// Does a bot's "Round Progress" bar climb once and stop, or does it loop?
//
//   node scripts/arcade-tests/bot-progress-test.mjs      (no server, no DB)
//
// A player watching an Arcade round saw every bot's bar fill in about three
// seconds, snap back to 0, and do it again for the whole round — roughly
// thirteen times per 60-second round. The bar is the only signal a player has
// for how close an opponent is to finishing, so one that resets means nothing
// at all. The cause: the coding tick advanced 15-39% per typing interval and
// set `progress = 0` on reaching 100 so it could count another "solve".
//
// This runs the REAL BotAIEngine, tick by tick, at the real 1s tick rate the
// gameplay loop uses (simulated, not waited on). The module is loaded from
// source with its JSON import inlined, because Node will not import a `.json`
// module the way Vite does — the alternative was a copy of the logic in the
// test, which would keep passing after the real file broke.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const botDir = path.resolve(here, '../../../client/src/pages/Arcade/bot');
const config = JSON.parse(fs.readFileSync(path.resolve(here, '../../../shared/arcadeConfig.json'), 'utf8'));

// Each module is rewritten and turned into a data: URL, and its own relative
// imports are rewritten to the data: URLs of their rewritten selves - a plain
// file:// import for a dependency would hit the same JSON-module wall one level
// down.
const cache = new Map();
const moduleUrl = (file) => {
    if (cache.has(file)) return cache.get(file);
    let src = fs.readFileSync(path.join(botDir, file), 'utf8').replace(/\r\n/g, '\n');
    src = src.replace(/^import\s+(\w+)\s+from\s+'[^']*\.json';$/gm,
        (_m, name) => `const ${name} = ${JSON.stringify(config)};`);
    src = src.replace(/from\s+'\.\/([\w.-]+\.js)'/g, (_m, dep) => `from '${moduleUrl(dep)}'`);
    const url = `data:text/javascript;base64,${Buffer.from(src, 'utf8').toString('base64')}`;
    cache.set(file, url);
    return url;
};
const loadBotModule = (file) => import(moduleUrl(file));

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

const { BotAIEngine } = await loadBotModule('botAI.js');
const { BOT_PROFILES } = await loadBotModule('botProfiles.js');

const TICK_MS = 1000;
const ROUND_SECONDS = 60;

// Drive one round of ticks with a controllable clock, and report the bar's
// whole history rather than just its final value — a bar that wraps looks
// perfectly fine if you only read it at the end.
const runRound = (bot) => {
    const start = 1_000_000;
    let now = start;
    const realNow = Date.now;
    Date.now = () => now;
    const trace = [];
    try {
        bot.resetRoundProgress();
        for (let s = 0; s < ROUND_SECONDS; s++) {
            now += TICK_MS;
            bot.update('ROUND_2', { name: 'human', cash: 0, eliminated: false, activeEffects: [] }, [], () => {});
            trace.push(bot.progress);
        }
    } finally {
        Date.now = realNow;
    }
    return trace;
};

for (const profile of BOT_PROFILES) {
    const bot = new BotAIEngine(profile.name);
    const trace = runRound(bot);

    const drops = trace.filter((v, i) => i > 0 && v < trace[i - 1]).length;
    check(drops === 0, `${profile.name}: หลอดไม่ถอยหลังเลยทั้งรอบ`, `ลดลง ${drops} ครั้ง`);

    const over = trace.filter((v) => v > 100).length;
    check(over === 0, `${profile.name}: หลอดไม่เกิน 100%`, `เกิน ${over} ครั้ง · สูงสุด ${Math.max(...trace).toFixed(1)}%`);

    // And it must actually move: a bar frozen at 0 also never wraps.
    check(trace[trace.length - 1] > trace[0], `${profile.name}: หลอดเดินหน้าจริง`,
        `${trace[0].toFixed(1)}% -> ${trace[trace.length - 1].toFixed(1)}%`);
}

// The pace has to leave the fastest profile finishing inside a normal round and
// the slowest one not — otherwise every bot finishes at the same moment and the
// bar stops telling the player anything, which is the state it was already in.
const finishSecond = (name) => {
    const trace = runRound(new BotAIEngine(name));
    const i = trace.findIndex((v) => v >= 100);
    return i === -1 ? Infinity : i + 1;
};
const fastest = Math.min(...Array.from({ length: 40 }, () => finishSecond('Bot_PyNinja')));
const slowest = Math.max(...Array.from({ length: 40 }, () => finishSecond('Bot_BugHunter')));
check(fastest > 10, 'บอทเร็วที่สุดไม่ได้จบทันทีที่รอบเริ่ม', `เร็วสุด ${fastest} วินาที`);
check(fastest <= ROUND_SECONDS, 'บอทเร็วที่สุดทำโจทย์จบภายในรอบ', `${fastest} วินาที`);
check(slowest > fastest, 'บอทช้ากว่าใช้เวลามากกว่าจริง',
    `เร็ว ${fastest}s vs ช้า ${slowest === Infinity ? 'ไม่จบในรอบ' : slowest + 's'}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
