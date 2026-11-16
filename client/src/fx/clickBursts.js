// What happens where the player clicks, for each cosmetic click effect
// (fix list item 8). The names are the `fx` field of a MOUSE_EFFECT item's
// effects in the database (server/migrate-cosmetics-refresh.js).
import { particle, rand, pick } from './fxLayer.js';
import {
  drawLeaf, drawSnowflake, drawTwinkle, drawBubble, drawFish, drawMonster, drawSnowman,
  drawPetal, drawBlossom, drawStar, drawPlanet, drawSprite, boltPoints, drawBolt, hexPath,
  LEAF_COLORS, FISH_COLORS, MONSTERS, PETAL_COLORS, SPRITE_NAMES,
} from './shapes.js';

const TAU = Math.PI * 2;

// Overshoot then settle: 0 -> 1.25 -> 1, for things that pop into view.
const popIn = (t, hold = 0.75) => {
  if (t < 0.18) {
    const k = t / 0.18;
    return 1.25 * Math.sin((k * Math.PI) / 2);
  }
  if (t < 0.3) return 1.25 - 0.25 * ((t - 0.18) / 0.12);
  if (t > hold) return Math.max(0, 1 - (t - hold) / (1 - hold));
  return 1;
};

// --------------------------------------------------------------- shared ---
const confetti = (layer, x, y, colors, count, speed = [120, 260]) => {
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, TAU), v = rand(...speed);
    const size = rand(6, 12), color = pick(colors);
    layer.add(particle({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, ay: 380, drag: 0.94,
      vr: rand(-8, 8), life: rand(0.7, 1.1), fadeIn: 0, fadeOut: 0.4,
      render: (ctx) => drawTwinkle(ctx, size, color),
    }));
  }
};

const ring = (layer, x, y, { color, from = 6, to = 70, life = 0.6, width = 3, delay = 0 }) => {
  layer.add(particle({
    x, y, life, delay, fadeIn: 0, fadeOut: 0.7, cull: false,
    render: (ctx, p) => {
      const t = p.age / p.life;
      ctx.strokeStyle = color;
      ctx.lineWidth = width * (1 - t * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, from + (to - from) * (1 - (1 - t) ** 3), 0, TAU);
      ctx.stroke();
    },
  }));
};

const glow = (layer, x, y, { color, radius = 60, life = 0.35 }) => {
  layer.add(particle({
    x, y, life, fadeIn: 0, fadeOut: 0.9, cull: false,
    render: (ctx) => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fill();
    },
  }));
};

const speech = (layer, x, y, text, color) => {
  layer.add(particle({
    x, y, vy: -40, life: 1.1, fadeIn: 0.05, fadeOut: 0.35, cull: false,
    scaleAt: (t) => popIn(t, 0.7),
    render: (ctx) => {
      ctx.font = '800 18px "Noto Sans Thai", "Prompt", system-ui, sans-serif';
      const w = ctx.measureText(text).width + 18;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -16, w, 30, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
    },
  }));
};

// -------------------------------------------------------------- monster ---
// Each click shows the next face, so a player clicking around meets all ten
// before one repeats.
let nextMonster = 0;
const SHOUTS = ['แฮ่!', 'บู!', 'ฮึ่ม!', 'ว้าว!', 'งั่ม!', 'จ๊ะเอ๋!'];

function popMonster(layer, x, y, { size = 64, delay = 0, vx = 0, hop = false, shout = true } = {}) {
  const m = MONSTERS[nextMonster % MONSTERS.length];
  nextMonster += 1;
  const life = hop ? 1.6 : 1.25;
  layer.add(particle({
    x, y, vx, vy: hop ? -420 : -70, ay: hop ? 900 : 0, life, delay, fadeIn: 0, fadeOut: 0.18,
    rot: rand(-0.15, 0.15), cull: false,
    // Squash on landing and a little wobble while it stands there.
    scaleAt: (t) => popIn(t, 0.8),
    onUpdate: (p) => {
      if (hop && p.y > y && p.vy > 0) { p.y = y; p.vy = -p.vy * 0.45; }
      p.rot = Math.sin(p.age * 9) * 0.08;
    },
    render: (ctx, p) => {
      const t = p.age / p.life;
      const blink = t > 0.45 && t < 0.52 ? 1 : 0;
      ctx.save();
      const squash = 1 + Math.sin(p.age * 18) * 0.04;
      ctx.scale(squash, 2 - squash);
      drawMonster(ctx, size, m, p.age, blink);
      ctx.restore();
    },
  }));
  if (shout && !delay) speech(layer, x, y - size * 1.05, pick(SHOUTS), m.body === '#facc15' ? '#a16207' : m.body);
  return m;
}

function monster(layer, x, y, { reduced }) {
  const m = popMonster(layer, x, y, { size: 64, shout: !reduced });
  if (reduced) return;
  ring(layer, x, y, { color: m.body, to: 56, width: 4 });
  confetti(layer, x, y, [m.body, '#fde047', '#ffffff', m.belly], 10);
}

function monsterParade(layer, x, y, { reduced }) {
  const count = reduced ? 1 : 5;
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * 62;
    popMonster(layer, x + offset, y, { size: 50, delay: i * 0.12, vx: offset * 0.4, hop: !reduced, shout: false });
  }
  if (!reduced) speech(layer, x, y - 90, 'ขบวนมอนสเตอร์!', '#7c3aed');
}

// --------------------------------------------------------------- leaves ---
const leaf = (fields) => {
  const color = pick(LEAF_COLORS), kind = Math.random() < 0.3 ? 1 : 0, size = fields.size || rand(16, 28);
  return particle({
    ay: 90, terminal: 70, drag: 0.95, sway: rand(30, 70), swayFreq: rand(2, 4), windK: 0.9,
    vr: rand(-4, 4), fadeIn: 0.05, fadeOut: 0.3, ...fields,
    render: (ctx, p) => {
      // A leaf turning over in the air looks thinner, then full again.
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.age * 3 + p.phase)));
      drawLeaf(ctx, size, color, kind);
    },
  });
};

function leaves(layer, x, y, { reduced }) {
  const count = reduced ? 4 : 16;
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, TAU), v = rand(150, 380);
    layer.add(leaf({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rand(1.8, 2.6) }));
  }
  if (!reduced) {
    ring(layer, x, y, { color: 'rgba(34, 197, 94, 0.55)', to: 60, width: 5 });
    glow(layer, x, y, { color: 'rgba(187, 247, 208, 0.9)', radius: 50 });
  }
}

// Leaves caught in a little whirlwind around the click, then let go.
function leafWhirl(layer, x, y, { reduced }) {
  const count = reduced ? 6 : 28;
  for (let i = 0; i < count; i += 1) {
    const start = (i / count) * TAU, spin = 7 + rand(-1, 1), climb = rand(30, 70);
    layer.add(leaf({
      x, y, life: rand(2.2, 2.8), ay: 0, sway: 0, windK: 0, fadeIn: 0.1,
      onUpdate: (p) => {
        if (p.age < 1.1) {
          const r = 16 + p.age * 95;
          const a = start + p.age * spin;
          p.x = x + Math.cos(a) * r;
          p.y = y + Math.sin(a) * r * 0.45 - p.age * climb;
          p.vx = -Math.sin(a) * r * spin * 0.35;
          p.vy = Math.cos(a) * r * spin * 0.15;
        } else {
          p.ay = 90;
          p.sway = 50;
        }
      },
    }));
  }
  if (!reduced) {
    for (let k = 0; k < 3; k += 1) {
      ring(layer, x, y, { color: 'rgba(132, 204, 22, 0.45)', from: 10, to: 90 + k * 30, width: 3, delay: k * 0.15, life: 0.8 });
    }
  }
}

// ----------------------------------------------------------------- snow ---
const flake = (fields) => {
  const r = fields.r || rand(5, 11);
  return particle({
    ay: 110, terminal: 55, drag: 0.95, sway: rand(20, 45), swayFreq: rand(1.5, 3), windK: 0.6,
    vr: rand(-1.5, 1.5), fadeIn: 0.05, fadeOut: 0.35, ...fields,
    render: (ctx) => drawSnowflake(ctx, r, true),
  });
};

function frostGlints(layer, x, y, count, spread) {
  for (let i = 0; i < count; i += 1) {
    const size = rand(8, 16);
    layer.add(particle({
      x: x + rand(-spread, spread), y: y + rand(-spread, spread), life: rand(0.5, 0.9), delay: rand(0, 0.4),
      fadeIn: 0.3, fadeOut: 0.5, vr: rand(-2, 2),
      render: (ctx) => drawTwinkle(ctx, size, '#7dd3fc'),
    }));
  }
}

function snow(layer, x, y, { reduced }) {
  // Thrown up and out in a fan, then left to drift down: fired all at one
  // point with slow speeds they read as one white lump for the first moment.
  const count = reduced ? 5 : 18;
  for (let i = 0; i < count; i += 1) {
    const a = -Math.PI / 2 + ((i / (count - 1)) - 0.5) * 2.6 + rand(-0.12, 0.12);
    const v = rand(320, 540);
    layer.add(flake({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 0.955, life: rand(2.2, 3) }));
  }
  if (!reduced) {
    glow(layer, x, y, { color: 'rgba(224, 242, 254, 0.95)', radius: 55, life: 0.5 });
    frostGlints(layer, x, y, 8, 50);
  }
}

function snowStorm(layer, x, y, { reduced }) {
  const count = reduced ? 6 : 36;
  for (let i = 0; i < count; i += 1) {
    const start = (i / count) * TAU;
    layer.add(flake({
      x, y, life: rand(2.4, 3), ay: 0, sway: 0, r: rand(5, 10),
      onUpdate: (p) => {
        if (p.age < 1) {
          const r = 20 + p.age * 130;
          const a = start + p.age * 5;
          p.x = x + Math.cos(a) * r;
          p.y = y + Math.sin(a) * r;
        } else if (!p.released) {
          p.released = true;
          p.vx = (p.x - x) * 0.9;
          p.vy = (p.y - y) * 0.4 - 60;
          p.ay = 110;
          p.sway = 30;
        }
      },
    }));
  }
  if (reduced) return;
  // A snowman pops up in the middle and waves.
  layer.add(particle({
    x, y, life: 1.9, fadeIn: 0, fadeOut: 0.2, cull: false,
    scaleAt: (t) => popIn(t, 0.82),
    render: (ctx, p) => drawSnowman(ctx, 70, p.age * 9),
  }));
  frostGlints(layer, x, y, 14, 110);
}

// -------------------------------------------------------------- bubbles ---
const bubble = (fields) => {
  const r = fields.r || rand(5, 14);
  return particle({
    ay: -60, drag: 0.97, sway: rand(25, 50), swayFreq: rand(2, 4), fadeIn: 0.1, fadeOut: 0.15,
    ...fields,
    // A bubble that reaches the end of its life pops instead of fading.
    onDeath: (p, layer) => ring(layer, p.x, p.y, { color: 'rgba(8, 145, 178, 0.7)', from: r * 0.6, to: r * 2.2, life: 0.25, width: 2 }),
    render: (ctx) => drawBubble(ctx, r),
  });
};

function bubbles(layer, x, y, { reduced }) {
  for (let k = 0; k < (reduced ? 1 : 3); k += 1) {
    ring(layer, x, y, { color: 'rgba(14, 165, 233, 0.6)', from: 4, to: 50 + k * 26, width: 3, delay: k * 0.14, life: 0.7 });
  }
  const count = reduced ? 3 : 14;
  for (let i = 0; i < count; i += 1) {
    layer.add(bubble({ x: x + rand(-20, 20), y: y + rand(-10, 10), vx: rand(-90, 90), vy: rand(-180, -40), life: rand(0.9, 1.8) }));
  }
}

function fishDash(layer, x, y, { reduced }) {
  const count = reduced ? 1 : 5;
  for (let i = 0; i < count; i += 1) {
    const dir = i % 2 === 0 ? 1 : -1;
    const colors = pick(FISH_COLORS), size = rand(30, 44), speed = rand(320, 460);
    const lane = (i - (count - 1) / 2) * 26;
    layer.add(particle({
      x, y: y + lane, vx: dir * speed, life: 1.6, fadeIn: 0.05, fadeOut: 0.25, drag: 0.985, cull: false,
      onUpdate: (p, dt) => {
        p.y = y + lane + Math.sin(p.age * 8 + i) * 10;
        p.trailClock = (p.trailClock || 0) + dt;
        if (!reduced && p.trailClock > 0.07) {
          p.trailClock = 0;
          layer.add(bubble({ x: p.x - dir * size * 0.5, y: p.y, r: rand(3, 6), vy: rand(-60, -20), life: rand(0.5, 0.9) }));
        }
      },
      render: (ctx, p) => {
        if (dir < 0) ctx.scale(-1, 1);
        drawFish(ctx, size, colors, Math.sin(p.age * 22) * 0.4);
      },
    }));
  }
  bubbles(layer, x, y, { reduced: true });
}

// ------------------------------------------------------------ fireworks ---
const FIREWORK_PALETTES = [
  ['#f59e0b', '#fde047', '#fb923c'], ['#ec4899', '#f472b6', '#fde68a'],
  ['#8b5cf6', '#22d3ee', '#ffffff'], ['#ef4444', '#f59e0b', '#fef08a'], ['#10b981', '#a3e635', '#fde047'],
];

// One spark with a short trail. Drawn with a dark-ish core colour rather than
// additive light, so it still shows on the light themes.
const spark = (layer, x, y, vx, vy, color, { life = rand(1.1, 1.6), glitter = true, width = 2.6 } = {}) => {
  layer.add(particle({
    x, y, vx, vy, ay: 150, drag: 0.955, life, fadeIn: 0, fadeOut: 0.45, cull: false, trail: [],
    onUpdate: (p) => {
      p.trail.push(p.x, p.y);
      if (p.trail.length > 12) p.trail.splice(0, 2);
      if (glitter && !p.crackled && p.age > p.life * 0.55) {
        p.crackled = true;
        for (let i = 0; i < 2; i += 1) {
          const size = rand(5, 9);
          layer.add(particle({
            x: p.x + rand(-6, 6), y: p.y + rand(-6, 6), vy: rand(10, 40), life: rand(0.3, 0.6), fadeIn: 0, fadeOut: 0.6,
            render: (ctx) => drawTwinkle(ctx, size, '#fef08a'),
          }));
        }
      }
    },
    render: (ctx, p) => {
      ctx.translate(-p.x, -p.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < p.trail.length; i += 2) {
        if (i === 0) ctx.moveTo(p.trail[i], p.trail[i + 1]); else ctx.lineTo(p.trail[i], p.trail[i + 1]);
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, width * 0.55, 0, TAU);
      ctx.fill();
    },
  }));
};

export function fireworkBurst(layer, x, y, { reduced = false, scale = 1, palette = pick(FIREWORK_PALETTES) } = {}) {
  const count = reduced ? 10 : Math.round(54 * scale);
  glow(layer, x, y, { color: `${palette[1]}cc`, radius: 90 * scale, life: 0.4 });
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU + rand(-0.05, 0.05);
    const v = rand(180, 330) * scale;
    spark(layer, x, y, Math.cos(a) * v, Math.sin(a) * v, i % 3 === 0 ? palette[1] : palette[0], { glitter: !reduced });
  }
  if (!reduced) {
    // A tighter inner ring in the second colour.
    for (let i = 0; i < Math.round(18 * scale); i += 1) {
      const a = rand(0, TAU), v = rand(60, 140) * scale;
      spark(layer, x, y, Math.cos(a) * v, Math.sin(a) * v, palette[2], { life: rand(0.7, 1), glitter: false, width: 2 });
    }
  }
}

function firework(layer, x, y, { reduced }) {
  fireworkBurst(layer, x, y, { reduced });
}

// The heart curve, x = 16 sin^3 t, y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t.
function fireworkHeart(layer, x, y, { reduced }) {
  const count = reduced ? 14 : 64;
  const colors = ['#ec4899', '#f43f5e', '#fb7185'];
  glow(layer, x, y, { color: 'rgba(251, 207, 232, 0.95)', radius: 110, life: 0.45 });
  for (let i = 0; i < count; i += 1) {
    const t = (i / count) * TAU;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    spark(layer, x, y, hx * 16, hy * 16, pick(colors), { life: 1.5, glitter: !reduced });
  }
  if (reduced) return;
  // A second, golden ring a moment later.
  layer.add(particle({
    x, y, life: 0.3, cull: false, render: () => {},
    onDeath: () => fireworkBurst(layer, x, y, { scale: 1.25, palette: ['#f59e0b', '#fde047', '#ffffff'] }),
  }));
}

// ---------------------------------------------------------------- space ---
const STAR_COLORS = ['#fde047', '#c4b5fd', '#a78bfa', '#7dd3fc', '#f9a8d4'];

// A shooting star: a bright head with a fading tail along its path.
export const comet = (layer, x, y, vx, vy, color, { life = 0.9, ambient = false } = {}) => {
  layer.add(particle({
    x, y, vx, vy, drag: 0.985, life, fadeIn: 0, fadeOut: 0.5, cull: false, trail: [], ambient,
    onUpdate: (p) => {
      p.trail.push(p.x, p.y);
      if (p.trail.length > 20) p.trail.splice(0, 2);
    },
    render: (ctx, p) => {
      const base = ctx.globalAlpha;
      ctx.translate(-p.x, -p.y);
      ctx.lineCap = 'round';
      for (let i = 2; i < p.trail.length; i += 2) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = base * (i / p.trail.length) * 0.8;
        ctx.lineWidth = 1 + (i / p.trail.length) * 3;
        ctx.beginPath();
        ctx.moveTo(p.trail[i - 2], p.trail[i - 1]);
        ctx.lineTo(p.trail[i], p.trail[i + 1]);
        ctx.stroke();
      }
      ctx.globalAlpha = base;
      ctx.translate(p.x, p.y);
      drawTwinkle(ctx, 16, '#ffffff');
      drawTwinkle(ctx, 10, color);
    },
  }));
};

function stardust(layer, x, y, { reduced }) {
  const count = reduced ? 5 : 16;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU + rand(-0.2, 0.2), v = rand(140, 320), size = rand(10, 20), color = pick(STAR_COLORS);
    layer.add(particle({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 0.93, ay: 20, vr: rand(-5, 5),
      life: rand(1, 1.5), fadeIn: 0, fadeOut: 0.45,
      // Stars twinkle: the size pulses as they drift.
      scaleAt: (t, p) => 0.8 + 0.3 * Math.sin(p.age * 14 + p.phase),
      render: (ctx) => drawStar(ctx, size, color),
    }));
  }
  if (reduced) return;
  glow(layer, x, y, { color: 'rgba(196, 181, 253, 0.9)', radius: 60 });
  ring(layer, x, y, { color: 'rgba(124, 58, 237, 0.55)', to: 70, width: 3 });
  // Three shooting stars fly off up and away from the click.
  for (let i = 0; i < 3; i += 1) {
    const a = rand(-2.6, -0.5), v = rand(420, 560);
    comet(layer, x, y, Math.cos(a) * v, Math.sin(a) * v, pick(['#a78bfa', '#38bdf8', '#f472b6']));
  }
}

// A ringed planet appears with three moons circling it.
function planetOrbit(layer, x, y, { reduced }) {
  const colors = pick([['#a78bfa', '#c4b5fd'], ['#38bdf8', '#bae6fd'], ['#f472b6', '#fbcfe8'], ['#fb923c', '#fed7aa']]);
  layer.add(particle({
    x, y, life: 1.9, fadeIn: 0, fadeOut: 0.2, cull: false,
    scaleAt: (t) => popIn(t, 0.8),
    render: (ctx) => drawPlanet(ctx, 46, colors),
  }));
  if (reduced) return;
  for (let i = 0; i < 3; i += 1) {
    const start = (i / 3) * TAU, radius = 60 + i * 16, speed = 3.4 - i * 0.6, size = 10 + i * 2;
    const color = ['#fde047', '#e0e7ff', '#7dd3fc'][i];
    layer.add(particle({
      x, y, life: 1.9, fadeIn: 0.1, fadeOut: 0.2, cull: false,
      onUpdate: (p) => {
        const a = start + p.age * speed;
        p.x = x + Math.cos(a) * radius;
        p.y = y + Math.sin(a) * radius * 0.4;
      },
      render: (ctx) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(76, 29, 149, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, TAU);
        ctx.fill();
        ctx.stroke();
      },
    }));
  }
  confetti(layer, x, y, STAR_COLORS, 14, [160, 320]);
}

// --------------------------------------------------------------- sakura ---
export const petal = (fields) => {
  const color = pick(PETAL_COLORS), size = fields.size || rand(12, 20);
  return particle({
    ay: 70, terminal: 55, drag: 0.95, sway: rand(30, 60), swayFreq: rand(2, 3.5), windK: 0.9,
    vr: rand(-4, 4), fadeIn: 0.05, fadeOut: 0.3, ...fields,
    render: (ctx, p) => {
      ctx.scale(0.5 + 0.5 * Math.abs(Math.cos(p.age * 3.5 + p.phase)), 1);
      drawPetal(ctx, size, color);
    },
  });
};

function sakura(layer, x, y, { reduced }) {
  const count = reduced ? 5 : 20;
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, TAU), v = rand(140, 340);
    layer.add(petal({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, life: rand(1.8, 2.6) }));
  }
  if (reduced) return;
  glow(layer, x, y, { color: 'rgba(251, 207, 232, 0.95)', radius: 55 });
  ring(layer, x, y, { color: 'rgba(236, 72, 153, 0.5)', to: 64, width: 4 });
}

// A blossom opens where you double-click, then lets its petals go in a spiral.
function sakuraBloom(layer, x, y, { reduced }) {
  layer.add(particle({
    x, y, life: 1.2, fadeIn: 0, fadeOut: 0.25, cull: false, vr: 1.2,
    onDeath: (p, l) => {
      if (reduced) return;
      for (let i = 0; i < 24; i += 1) {
        const a = (i / 24) * TAU, v = rand(160, 300);
        l.add(petal({ x, y, vx: Math.cos(a) * v - Math.sin(a) * 120, vy: Math.sin(a) * v + Math.cos(a) * 120, life: rand(2, 2.8) }));
      }
      ring(l, x, y, { color: 'rgba(236, 72, 153, 0.55)', to: 110, width: 4, life: 0.8 });
    },
    render: (ctx, p) => drawBlossom(ctx, 90, Math.min(1, (p.age / p.life) * 2.2)),
  }));
  glow(layer, x, y, { color: 'rgba(252, 231, 243, 0.95)', radius: 80, life: 1 });
}

// ---------------------------------------------------------------- pixel ---
const PIXEL_COLORS = ['#16a34a', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b'];
const SPRITE_COLOR = { heart: '#ef4444', coin: '#f59e0b', star: '#facc15', gem: '#3b82f6' };

// Square bits that fall like a broken 8-bit block.
const pixelBits = (layer, x, y, count, speed = [140, 300]) => {
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, TAU), v = rand(...speed), size = pick([6, 8, 10]), color = pick(PIXEL_COLORS);
    layer.add(particle({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, ay: 700, life: rand(0.8, 1.2), fadeIn: 0, fadeOut: 0.3,
      render: (ctx) => {
        ctx.fillStyle = 'rgba(20, 83, 45, 0.85)';
        ctx.fillRect(-size / 2 - 1.5, -size / 2 - 1.5, size + 3, size + 3);
        ctx.fillStyle = color;
        ctx.fillRect(-size / 2, -size / 2, size, size);
      },
    }));
  }
};

const pixelText = (layer, x, y, text, color, size = 18) => {
  layer.add(particle({
    x, y, life: 1, fadeIn: 0, fadeOut: 0.35, cull: false,
    // Moves in whole steps, like a sprite on a low-resolution screen.
    onUpdate: (p) => { p.y = y - Math.floor(p.age * 10) * 6; },
    scaleAt: (t) => (t < 0.12 ? 1.4 : 1),
    render: (ctx) => {
      ctx.font = `900 ${size}px "Courier New", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#14532d';
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
    },
  }));
};

// Each click pops the next sprite - heart, coin, star, gem - with a score.
let nextSprite = 0;
function pixelPop(layer, x, y, { reduced }) {
  const name = SPRITE_NAMES[nextSprite % SPRITE_NAMES.length];
  nextSprite += 1;
  layer.add(particle({
    x, y, vy: -300, ay: 900, life: 1, fadeIn: 0, fadeOut: 0.25, cull: false,
    onUpdate: (p) => {
      if (p.y > y && p.vy > 0) { p.y = y; p.vy = -p.vy * 0.4; }
    },
    render: (ctx) => drawSprite(ctx, name, 34, SPRITE_COLOR[name], name === 'gem' ? '#93c5fd' : '#fde047'),
  }));
  if (reduced) return;
  pixelText(layer, x, y - 46, { coin: '+100', heart: '+1UP', star: '+500', gem: '+250' }[name], '#fde047', 16);
  pixelBits(layer, x, y, 10);
}

// A ring of sprites and a "LEVEL UP!" banner.
function pixelLevelUp(layer, x, y, { reduced }) {
  pixelText(layer, x, y - 60, 'LEVEL UP!', '#4ade80', 22);
  if (reduced) return;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * TAU, name = SPRITE_NAMES[i % SPRITE_NAMES.length];
    layer.add(particle({
      x, y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, drag: 0.9, life: 1.3, fadeIn: 0, fadeOut: 0.3, cull: false,
      render: (ctx) => drawSprite(ctx, name, 24, SPRITE_COLOR[name]),
    }));
  }
  // A square shockwave that grows in steps, like everything else here.
  layer.add(particle({
    x, y, life: 0.5, fadeIn: 0, fadeOut: 0.6, cull: false,
    render: (ctx, p) => {
      const r = 10 + Math.floor((p.age / p.life) * 8) * 12;
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 5;
      ctx.strokeRect(-r, -r, r * 2, r * 2);
    },
  }));
  pixelBits(layer, x, y, 22, [200, 420]);
}

// ---------------------------------------------------------------- cyber ---
const CYBER = ['#e11d8f', '#06b6d4', '#a855f7'];

const bolt = (layer, x, y, dx, dy, color, life = 0.32, delay = 0) => {
  let pts = boltPoints(dx, dy);
  layer.add(particle({
    x, y, life, delay, fadeIn: 0, fadeOut: 0.6, cull: false,
    // Re-jag once mid-flash so it crackles instead of sitting still.
    onUpdate: (p) => {
      if (!p.flicked && p.age > life * 0.4) { p.flicked = true; pts = boltPoints(dx, dy); }
    },
    render: (ctx) => drawBolt(ctx, pts, color, 2.2),
  }));
};

const dataBits = (layer, x, y, count) => {
  for (let i = 0; i < count; i += 1) {
    const text = Math.random() < 0.5 ? '0' : '1', color = pick(CYBER), a = rand(0, TAU), v = rand(80, 200);
    layer.add(particle({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 0.94, life: rand(0.7, 1.1), fadeIn: 0, fadeOut: 0.5,
      render: (ctx) => {
        ctx.font = '700 15px ui-monospace, "Cascadia Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
      },
    }));
  }
};

function cyberSpark(layer, x, y, { reduced }) {
  const count = reduced ? 2 : 6;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU + rand(-0.3, 0.3), len = rand(50, 95);
    bolt(layer, x, y, Math.cos(a) * len, Math.sin(a) * len, CYBER[i % CYBER.length]);
  }
  if (reduced) return;
  glow(layer, x, y, { color: 'rgba(103, 232, 249, 0.85)', radius: 45, life: 0.25 });
  layer.add(particle({
    x, y, life: 0.55, fadeIn: 0, fadeOut: 0.6, cull: false, vr: 3,
    render: (ctx, p) => {
      hexPath(ctx, 12 + (p.age / p.life) * 40);
      ctx.strokeStyle = '#e11d8f';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    },
  }));
  dataBits(layer, x, y, 8);
}

// A scan: hexagon rings sweep out, a crosshair locks on, then it discharges.
function cyberScan(layer, x, y, { reduced }) {
  for (let k = 0; k < (reduced ? 1 : 3); k += 1) {
    layer.add(particle({
      x, y, life: 0.9, delay: k * 0.12, fadeIn: 0, fadeOut: 0.5, cull: false, rot: k * 0.3,
      render: (ctx, p) => {
        hexPath(ctx, 14 + (1 - (1 - p.age / p.life) ** 2) * (90 + k * 30));
        ctx.strokeStyle = CYBER[k];
        ctx.lineWidth = 3 - k * 0.6;
        ctx.setLineDash([10, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      },
    }));
  }
  layer.add(particle({
    x, y, life: 1.1, fadeIn: 0.05, fadeOut: 0.2, cull: false,
    render: (ctx, p) => {
      const lock = Math.min(1, p.age / 0.35), r = 46 - lock * 18;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        ctx.beginPath();
        ctx.moveTo(sx * r, sy * (r - 10));
        ctx.lineTo(sx * r, sy * r);
        ctx.lineTo(sx * (r - 10), sy * r);
        ctx.stroke();
      }
      ctx.fillStyle = '#e11d8f';
      ctx.font = '700 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lock < 1 ? 'SCANNING' : 'LOCKED', 0, r + 16);
    },
    onDeath: (p, l) => {
      if (reduced) return;
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * TAU, len = rand(80, 140);
        bolt(l, x, y, Math.cos(a) * len, Math.sin(a) * len, CYBER[i % 3], 0.4, rand(0, 0.12));
      }
      dataBits(l, x, y, 16);
    },
  }));
}

export const CLICK_FX = {
  monster,
  'monster-parade': monsterParade,
  leaves,
  'leaf-whirl': leafWhirl,
  snow,
  'snow-storm': snowStorm,
  bubbles,
  'fish-dash': fishDash,
  firework,
  'firework-heart': fireworkHeart,
  // The four original sets (2026-11-17).
  stardust,
  'planet-orbit': planetOrbit,
  sakura,
  'sakura-bloom': sakuraBloom,
  'pixel-pop': pixelPop,
  'pixel-levelup': pixelLevelUp,
  'cyber-spark': cyberSpark,
  'cyber-scan': cyberScan,
};
