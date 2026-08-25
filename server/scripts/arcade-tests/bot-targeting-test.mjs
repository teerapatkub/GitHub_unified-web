// Do bots actually attack the player who is winning?
//
//   node scripts/arcade-tests/bot-targeting-test.mjs      (no server, no DB)
//
// Reported from real play on 2026-08-26: "the bots never attack me, even when
// I am ahead on score." Two separate causes, both of which this pins down.
//
// 1. TWO DIFFERENT SCOREBOARDS. A bot's own this.score is a local invention
//    (+100..500 per round it "finishes"), while the human's playerState.score
//    is the real server-computed one, capped near 300 a round. pickAttackTarget
//    compared the two directly, so a bot's imaginary score almost always beat
//    the leading human's real one and the item went to another bot.
//
// 2. A SHIELD MADE THE PLAYER INVISIBLE. Targets already carrying a debuff are
//    skipped, which is correct - but a player's own bought buffs (shield,
//    scoreMultiplier) live in the SAME activeEffects list, stored with a
//    ~27-hour expiry. Buying a shield therefore removed the player from every
//    bot's candidate list for the rest of the match. A player in the lead is
//    exactly the player who buys a shield.
//
// Runs the REAL BotAIEngine with its JSON import inlined, same loader as
// bot-progress-test.mjs.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const botDir = path.resolve(here, '../../../client/src/pages/Arcade/bot');
const config = JSON.parse(fs.readFileSync(path.resolve(here, '../../../shared/arcadeConfig.json'), 'utf8'));

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

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

const { BotAIEngine } = await import(moduleUrl('botAI.js'));

const ATTACK_ITEM = { id: 'inkFog', type: 'attack', price: 400 };

// A human who is genuinely ahead: a realistic server score, no debuff on them.
const leadingPlayer = (over = {}) => ({
    name: 'test1',
    score: 280,
    cash: 1000,
    eliminated: false,
    activeEffects: [],
    ...over,
});

// Three rivals whose LOCAL score is inflated the way the coding tick inflates
// it, but whose REAL (server) score is behind the human's.
const makeRivals = () => ['Bot_A', 'Bot_B', 'Bot_C'].map((name, i) => {
    const bot = new BotAIEngine(name);
    bot.score = 900 + i * 100;   // local, imaginary
    return bot;
});
const realScores = { test1: 280, Bot_A: 120, Bot_B: 90, Bot_C: 60 };

// 1. The whole point. The human leads on the real scoreboard, so the human is
//    the target - regardless of what the bots believe their own scores are.
{
    const rivals = makeRivals();
    const target = rivals[0].pickAttackTarget(leadingPlayer(), rivals, realScores);
    check(target?.name === 'test1',
        'ผู้เล่นที่คะแนนนำจริงต้องถูกเลือกเป็นเป้าหมาย',
        `เลือก ${target?.name}`);
}

// 2. The rule is "attack the leader", not "attack the human". A bot genuinely
//    in front must still be picked over a trailing human, or this fix would
//    just be the old hardcoded-human-target bug wearing a new hat.
{
    const rivals = makeRivals();
    const target = rivals[2].pickAttackTarget(
        leadingPlayer({ score: 40 }), rivals, { ...realScores, test1: 40, Bot_A: 500 });
    check(target?.name === 'Bot_A',
        'ถ้าบอทนำจริง เป้าหมายต้องเป็นบอทตัวนั้น ไม่ใช่ผู้เล่นเสมอไป',
        `เลือก ${target?.name}`);
}

// 3. THE SHIELD CASE. A shield is the player's own buff and must not make them
//    untargetable. (It still BLOCKS the hit - that is botManager's job, and it
//    consumes the shield. Being unhittable for one item is the point; being
//    unselectable forever is the bug.)
{
    const rivals = makeRivals();
    const shielded = leadingPlayer({
        activeEffects: [{ type: 'shield', expiresAt: Date.now() + 99999999 }],
    });
    const target = rivals[0].pickAttackTarget(shielded, rivals, realScores);
    check(target?.name === 'test1',
        'ผู้เล่นที่ถือเกราะต้องยังถูกเลือกเป็นเป้าหมายได้',
        `เลือก ${target?.name}`);
}

// 4. scoreMultiplier is a buff too, and it is bought by exactly the player who
//    is pushing for the lead.
{
    const rivals = makeRivals();
    const buffed = leadingPlayer({
        activeEffects: [{ type: 'scoreMultiplier', expiresAt: Date.now() + 99999999 }],
    });
    check(rivals[0].pickAttackTarget(buffed, rivals, realScores)?.name === 'test1',
        'ไอเทมคูณคะแนนของผู้เล่นเองต้องไม่ทำให้ตัวเองหายไปจากรายชื่อเป้าหมาย');
}

// 5. A REAL debuff still protects the player from being hit twice over. This is
//    the behaviour the buff check was borrowing, and it has to survive.
{
    const rivals = makeRivals();
    const inked = leadingPlayer({
        activeEffects: [{ type: 'inkFog', expiresAt: Date.now() + 5000 }],
    });
    const target = rivals[0].pickAttackTarget(inked, rivals, realScores);
    check(target?.name !== 'test1',
        'ผู้เล่นที่โดนดีบัฟอยู่แล้วต้องไม่ถูกซ้ำ',
        `เลือก ${target?.name}`);
}

// 6. An expired debuff is not a debuff. Without this the player is protected
//    for the rest of the match by the first item that ever hit them.
{
    const rivals = makeRivals();
    const expired = leadingPlayer({
        activeEffects: [{ type: 'inkFog', expiresAt: Date.now() - 1000 }],
    });
    check(rivals[0].pickAttackTarget(expired, rivals, realScores)?.name === 'test1',
        'ดีบัฟที่หมดอายุแล้วต้องไม่กันการถูกเลือกอีก');
}

// 7. Revenge still overrides the leader rule most of the time. Checked over
//    many draws because it is deliberately probabilistic (80%).
{
    const rivals = makeRivals();
    rivals[0].revengeTarget = 'test1';
    let hits = 0;
    for (let i = 0; i < 400; i++) {
        if (rivals[0].pickAttackTarget(leadingPlayer({ score: 10 }), rivals,
            { ...realScores, test1: 10, Bot_A: 999 })?.name === 'test1') hits++;
    }
    check(hits > 280 && hits < 380,
        'บอทที่ผูกใจเจ็บต้องแก้แค้นคนที่โจมตีมันเป็นส่วนใหญ่',
        `${hits}/400 ครั้ง`);
}

// 8. An eliminated player is not a target.
{
    const rivals = makeRivals();
    check(rivals[0].pickAttackTarget(leadingPlayer({ eliminated: true }), rivals, realScores)?.name !== 'test1',
        'ผู้เล่นที่ตกรอบแล้วต้องไม่ถูกโจมตี');
}

// 9. With no scoreboard supplied at all the bot must still choose someone
//    rather than crash - the local scores are the fallback.
{
    const rivals = makeRivals();
    check(Boolean(rivals[0].pickAttackTarget(leadingPlayer(), rivals)),
        'ไม่มีตารางคะแนนส่งมาก็ยังต้องเลือกเป้าหมายได้');
}

// 10. End to end through update(): a bot holding an attack item during a real
//     round must actually fire it at the leading human. This is what the
//     player was not seeing happen.
{
    const rivals = makeRivals();
    const attacker = rivals[0];
    attacker.inventory = [{ ...ATTACK_ITEM }];
    attacker.lastItemUseAttempt = 0;   // due for a decision right now

    const fired = [];
    // maybeUseItem rolls Math.random() < 0.6 before doing anything; pin it so
    // this asserts on the targeting, not on the dice.
    const realRandom = Math.random;
    Math.random = () => 0;
    try {
        for (let i = 0; i < 5 && fired.length === 0; i++) {
            attacker.update('ROUND_3', leadingPlayer(), rivals,
                (from, to, item) => fired.push({ from, to, item }), realScores);
        }
    } finally {
        Math.random = realRandom;
    }
    check(fired.length === 1 && fired[0].to === 'test1',
        'บอทที่มีไอเทมโจมตีต้องยิงใส่ผู้เล่นที่นำอยู่จริงในรอบเล่น',
        fired.length ? `ยิงใส่ ${fired[0].to}` : 'ไม่ได้ยิงเลย');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
