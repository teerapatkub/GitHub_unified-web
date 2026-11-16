// What moves on the page while a shop theme is on (fix list item 8): leaves
// for the forest, snow for winter, and so on. A scene has a quiet baseline and,
// every so often, an "event" - a gust of wind, a snow spell, a fireworks show -
// so the page is alive without something flying past the text all the time.
//
// Chosen by keyword in the theme's name or art file name, the same rule
// themes/shopPalette.js uses for colours, because item ids differ between
// databases while '/uploads/forest-theme.webp' is the same everywhere.
import { particle, rand, pick } from './fxLayer.js';
import {
  drawLeaf, drawSnowflake, drawBubble, drawFish, drawLantern, drawMonster, drawStar, drawSprite,
  LEAF_COLORS, FISH_COLORS, MONSTERS,
} from './shapes.js';
import { fireworkBurst, comet, petal } from './clickBursts.js';

const TAU = Math.PI * 2;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// Calls `spawn` about `perSecond` times a second, scaled to the screen size.
const emitter = () => {
  let debt = 0;
  return (dt, perSecond, env, spawn) => {
    debt += dt * perSecond * env.area;
    while (debt >= 1) {
      debt -= 1;
      spawn();
    }
  };
};

// Waits a random time, runs an event for its duration, waits again.
// `firstIn` brings the first event forward (a shop preview lasts seconds).
const cycle = (quiet, active, firstIn) => {
  let state = 'quiet';
  let left = firstIn ?? rand(...quiet) * 0.5;
  let duration = 1;
  return {
    tick(dt) {
      left -= dt;
      if (left <= 0) {
        if (state === 'quiet') { state = 'active'; duration = rand(...active); left = duration; }
        else { state = 'quiet'; left = rand(...quiet); }
      }
      return state === 'active' ? 1 - left / duration : -1; // progress 0..1, or -1 when quiet
    },
  };
};

const ambient = (fields) => particle({ ambient: true, ...fields });

// --------------------------------------------------------------- forest ---
function forestScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const fall = emitter(), gustLeaves = emitter(), streaks = emitter();
  const gust = cycle([18, 32], [4.5, 6], soon);
  let dir = 1;
  const spawnLeaf = (env, fromSide) => {
    const color = pick(LEAF_COLORS), kind = Math.random() < 0.3 ? 1 : 0, size = rand(16, 30);
    return ambient({
      x: fromSide ? (dir > 0 ? -30 : env.w + 30) : rand(0, env.w),
      y: fromSide ? rand(0, env.h * 0.7) : -30,
      vy: rand(25, 50), ay: 30, terminal: rand(45, 80), sway: rand(30, 60), swayFreq: rand(1.2, 2.4),
      windK: rand(0.8, 1.2), drag: 0.985, vr: rand(-2, 2), life: 18, fadeIn: 0.02, fadeOut: 0.05, alpha: 0.92,
      render: (ctx, p) => {
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.age * 2 + p.phase)));
        drawLeaf(ctx, size, color, kind);
      },
    });
  };
  return {
    tick(dt, env, layer) {
      fall(dt, 0.7, env, () => {
        if (layer.count((p) => p.ambient) < 30 * env.area) layer.add(spawnLeaf(env, false));
      });
      const g = gust.tick(dt);
      if (g < 0) {
        env.wind *= Math.pow(0.4, dt);
        if (Math.random() < dt * 0.05) dir = Math.random() < 0.5 ? 1 : -1;
        return;
      }
      // Wind rises, holds, and dies down over the gust.
      env.wind = dir * 320 * Math.sin(Math.PI * Math.min(1, g * 1.15));
      gustLeaves(dt, 7, env, () => layer.add(spawnLeaf(env, true)));
      // The wind itself: pale streaks sweeping across.
      streaks(dt, 5, env, () => {
        const len = rand(80, 200), y = rand(0, env.h), speed = dir * rand(700, 1000);
        layer.add(ambient({
          x: dir > 0 ? -len : env.w + len, y, vx: speed, life: 1.6, fadeIn: 0.2, fadeOut: 0.4, alpha: 0.5,
          render: (ctx, p) => {
            // Pale green rather than white: white vanishes on the light theme.
            ctx.strokeStyle = 'rgba(101, 163, 13, 0.55)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            const curl = Math.sin(p.age * 3 + p.phase) * 18;
            ctx.moveTo(-dir * len, 0);
            ctx.quadraticCurveTo(-dir * len * 0.4, curl, 0, 0);
            ctx.stroke();
          },
        }));
      });
    },
  };
}

// --------------------------------------------------------------- winter ---
function winterScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const fall = emitter();
  const spell = cycle([10, 18], [14, 22], soon);
  const spawnFlake = (env, heavy) => {
    const near = Math.random() < (heavy ? 0.35 : 0.2);
    const r = near ? rand(7, 12) : rand(2, 5);
    return ambient({
      x: rand(-40, env.w + 40), y: -20,
      vy: near ? rand(50, 80) : rand(25, 45), terminal: near ? 90 : 50, sway: rand(15, 40), swayFreq: rand(0.8, 1.8),
      windK: near ? 0.5 : 0.3, vr: rand(-1, 1), life: 30, fadeIn: 0.01, fadeOut: 0.02, alpha: near ? 0.95 : 0.75,
      render: (ctx) => drawSnowflake(ctx, r, near),
    });
  };
  return {
    tick(dt, env, layer) {
      const s = spell.tick(dt);
      // Between spells only a stray flake now and then; during one, real
      // snowfall that builds up and tapers off, with a light drift of wind.
      const rate = s < 0 ? 0.25 : 2 + 12 * Math.sin(Math.PI * s);
      env.wind = s < 0 ? env.wind * Math.pow(0.5, dt) : 40 * Math.sin(env.time * 0.4);
      fall(dt, rate, env, () => {
        if (layer.count((p) => p.ambient) < 160 * env.area) layer.add(spawnFlake(env, s > 0.3 && s < 0.7));
      });
    },
  };
}

// -------------------------------------------------------------- monster ---
function monsterScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const spores = emitter();
  const peek = cycle([9, 18], [3.2, 3.2], soon);
  const flyBy = cycle([20, 34], [5, 5], soon);
  let peeking = false, flying = false;
  const SPORE_COLORS = ['#c4b5fd', '#86efac', '#f9a8d4', '#fde68a', '#67e8f9'];
  return {
    tick(dt, env, layer) {
      spores(dt, 0.8, env, () => {
        const r = rand(3, 7), color = pick(SPORE_COLORS);
        layer.add(ambient({
          x: rand(0, env.w), y: env.h + 10, vy: rand(-35, -18), sway: rand(10, 30), swayFreq: rand(0.6, 1.4),
          life: rand(12, 20), fadeIn: 0.1, fadeOut: 0.3, alpha: 0.75,
          render: (ctx, p) => {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
            g.addColorStop(0, color);
            g.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = g;
            ctx.globalAlpha *= 0.6 + 0.4 * Math.sin(p.age * 3 + p.phase);
            ctx.beginPath();
            ctx.arc(0, 0, r * 2.5, 0, TAU);
            ctx.fill();
          },
        }));
      });

      // A monster rises from the bottom edge, looks around, blinks, and ducks back down.
      const p = peek.tick(dt);
      if (p >= 0 && !peeking) {
        peeking = true;
        const m = pick(MONSTERS), size = rand(90, 130), x = rand(size, env.w - size);
        layer.add(ambient({
          x, y: env.h + size * 0.6, life: 3.2, fadeIn: 0, fadeOut: 0, cull: false,
          onUpdate: (q) => {
            const t = q.age / q.life;
            const up = t < 0.2 ? ease(t / 0.2) : t > 0.8 ? 1 - ease((t - 0.8) / 0.2) : 1;
            q.y = env.h + size * 0.6 - up * size * 0.85;
            q.rot = Math.sin(q.age * 2.5) * 0.12 * up;
          },
          render: (ctx, q) => {
            const t = q.age / q.life;
            const blink = (t > 0.38 && t < 0.42) || (t > 0.58 && t < 0.62) ? 1 : 0;
            drawMonster(ctx, size, m, q.age, blink);
          },
        }));
      } else if (p < 0) peeking = false;

      // Now and then a small one bounces across the top of the screen.
      const f = flyBy.tick(dt);
      if (f >= 0 && !flying) {
        flying = true;
        const m = pick(MONSTERS), dir = Math.random() < 0.5 ? 1 : -1, size = 48, baseY = rand(110, env.h * 0.35);
        layer.add(ambient({
          x: dir > 0 ? -60 : env.w + 60, y: baseY, vx: dir * (env.w + 120) / 5, life: 5, fadeIn: 0, fadeOut: 0, cull: false,
          onUpdate: (q) => { q.y = baseY - Math.abs(Math.sin(q.age * 4)) * 60; },
          render: (ctx, q) => {
            if (dir < 0) ctx.scale(-1, 1);
            ctx.scale(1, 0.9 + 0.1 * Math.abs(Math.cos(q.age * 4)));
            drawMonster(ctx, size, m, q.age, 0);
          },
        }));
      } else if (f < 0) flying = false;
    },
  };
}

// ---------------------------------------------------------------- ocean ---
function oceanScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const rise = emitter();
  const school = cycle([14, 26], [7, 7], soon);
  let swimming = false;
  return {
    tick(dt, env, layer) {
      rise(dt, 1.1, env, () => {
        const r = rand(3, 11);
        layer.add(ambient({
          x: rand(0, env.w), y: env.h + 15, vy: rand(-70, -35), ay: -6, sway: rand(15, 35), swayFreq: rand(1.5, 3),
          life: rand(10, 16), fadeIn: 0.05, fadeOut: 0.08, alpha: 0.8,
          render: (ctx) => drawBubble(ctx, r),
        }));
      });
      const s = school.tick(dt);
      if (s >= 0 && !swimming) {
        swimming = true;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const colors = pick(FISH_COLORS), count = Math.round(rand(6, 11));
        const baseY = rand(env.h * 0.25, env.h * 0.8), speed = (env.w + 400) / 7;
        for (let i = 0; i < count; i += 1) {
          // A loose arrowhead: the leader in front, the rest fanned behind.
          const row = Math.ceil(i / 2), side = i % 2 === 0 ? 1 : -1;
          const offX = -row * 46 * dir, offY = i === 0 ? 0 : side * row * 22 + rand(-6, 6);
          const size = rand(26, 36);
          layer.add(ambient({
            x: (dir > 0 ? -60 : env.w + 60) + offX, y: baseY + offY, vx: dir * speed, life: 9, fadeIn: 0, fadeOut: 0.05, cull: false,
            onUpdate: (q) => { q.y = baseY + offY + Math.sin(q.age * 2 + row) * 18; },
            render: (ctx, q) => {
              if (dir < 0) ctx.scale(-1, 1);
              drawFish(ctx, size, colors, Math.sin(q.age * 14 + i) * 0.35);
            },
          }));
        }
      } else if (s < 0) swimming = false;
    },
  };
}

// -------------------------------------------------------------- lantern ---
function lanternScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const rise = emitter();
  const show = cycle([22, 36], [5, 7], soon);
  let nextBurst = 0;
  let filled = false;
  // `along` 0..1: how far through its climb the lantern already is. Lanterns
  // take half a minute to cross the screen, so the scene opens with some
  // already in the sky rather than an empty one.
  const lantern = (env, along = 0) => {
    const size = rand(26, 46), life = rand(26, 36);
    const vy = rand(-30, -18);
    return ambient({
      lantern: true, x: rand(env.w * 0.05, env.w * 0.95), y: env.h + 40 + vy * life * along,
      age: life * along, vy, sway: rand(10, 22), swayFreq: rand(0.4, 0.9),
      life, fadeIn: 0.04, fadeOut: 0.25, alpha: 0.95,
      // Shrinks as it rises, so it reads as going up and away.
      scaleAt: (t) => 1 - t * 0.55,
      render: (ctx, p) => drawLantern(ctx, size, 0.75 + 0.25 * Math.sin(p.age * 9 + p.phase)),
    });
  };
  return {
    tick(dt, env, layer) {
      if (!filled) {
        filled = true;
        for (let i = 0; i < Math.round(7 * env.area); i += 1) layer.add(lantern(env, rand(0.1, 0.7)));
      }
      rise(dt, 0.35, env, () => {
        if (layer.count((p) => p.lantern) >= 14 * env.area) return;
        layer.add(lantern(env));
      });

      const s = show.tick(dt);
      if (s < 0) { nextBurst = 0; return; }
      nextBurst -= dt;
      if (nextBurst > 0) return;
      nextBurst = rand(0.35, 0.9);
      // A rocket climbs, leaving a trail, and bursts where it stops.
      const x = rand(env.w * 0.12, env.w * 0.88), top = rand(env.h * 0.12, env.h * 0.42);
      const climb = 1.1;
      layer.add(ambient({
        x, y: env.h + 10, vy: -(env.h + 10 - top) / climb, life: climb, fadeIn: 0, fadeOut: 0, cull: false,
        render: (ctx) => {
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, TAU);
          ctx.fill();
          const g = ctx.createLinearGradient(0, 0, 0, 40);
          g.addColorStop(0, 'rgba(251, 146, 60, 0.9)');
          g.addColorStop(1, 'rgba(251, 146, 60, 0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 40);
          ctx.stroke();
        },
        onDeath: (p) => fireworkBurst(layer, p.x, p.y, { scale: rand(0.75, 1.1) }),
      }));
    },
  };
}

// ----------------------------------------------------------------- space ---
function spaceScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const twinkle = emitter(), shower = emitter();
  const meteors = cycle([14, 26], [3.5, 4.5], soon);
  const STAR_COLORS = ['#a78bfa', '#7c3aed', '#38bdf8', '#f472b6', '#facc15'];
  return {
    tick(dt, env, layer) {
      // Stars that fade in, twinkle a few times and fade out where they are.
      twinkle(dt, 2, env, () => {
        if (layer.count((p) => p.ambient) > 45 * env.area) return;
        const size = rand(8, 16), color = pick(STAR_COLORS);
        layer.add(ambient({
          x: rand(0, env.w), y: rand(0, env.h), life: rand(3, 5), fadeIn: 0.3, fadeOut: 0.4, alpha: 0.85, vr: rand(-0.5, 0.5),
          scaleAt: (t, p) => 0.7 + 0.3 * Math.sin(p.age * 5 + p.phase),
          render: (ctx) => drawStar(ctx, size, color),
        }));
      });
      // A meteor shower: shooting stars streak down from the upper right.
      if (meteors.tick(dt) < 0) return;
      shower(dt, 5, env, () => {
        const v = rand(650, 900), a = Math.PI * rand(0.7, 0.8);
        comet(layer, rand(env.w * 0.3, env.w + 200), rand(-80, env.h * 0.3), Math.cos(a) * v, Math.sin(a) * v,
          pick(['#7c3aed', '#38bdf8', '#ec4899']), { life: 1.4, ambient: true });
      });
    },
  };
}

// ---------------------------------------------------------------- sakura ---
function sakuraScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const fall = emitter(), gustPetals = emitter();
  const breeze = cycle([16, 28], [4.5, 6], soon);
  let dir = 1;
  const spawn = (env, fromSide) => {
    const p = petal({
      x: fromSide ? (dir > 0 ? -20 : env.w + 20) : rand(0, env.w),
      y: fromSide ? rand(0, env.h * 0.7) : -20,
      vy: rand(20, 40), ay: 25, terminal: rand(40, 65), drag: 0.985, life: 20, fadeIn: 0.02, fadeOut: 0.05, alpha: 0.95,
    });
    p.ambient = true;
    return p;
  };
  return {
    tick(dt, env, layer) {
      fall(dt, 1.1, env, () => {
        if (layer.count((p) => p.ambient) < 40 * env.area) layer.add(spawn(env, false));
      });
      const g = breeze.tick(dt);
      if (g < 0) {
        env.wind *= Math.pow(0.4, dt);
        if (Math.random() < dt * 0.05) dir = Math.random() < 0.5 ? 1 : -1;
        return;
      }
      // A spring breeze: a flurry of petals blown across the page.
      env.wind = dir * 240 * Math.sin(Math.PI * Math.min(1, g * 1.15));
      gustPetals(dt, 12, env, () => layer.add(spawn(env, true)));
    },
  };
}

// ----------------------------------------------------------------- pixel ---
function pixelScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const clouds = emitter(), floaters = emitter(), coins = emitter();
  const rain = cycle([18, 30], [4, 5], soon);
  let seeded = false;
  // A blocky cloud drawn on a 10px grid.
  const CLOUD = ['..XXX.....', '.XXXXX.XX.', 'XXXXXXXXXX', '.XXXXXXXX.'];
  const cloud = (env, x) => {
    const cell = pick([8, 10, 12]);
    return ambient({
      cloud: true, x, y: rand(60, env.h * 0.4), vx: rand(12, 26), life: 120, fadeIn: 0.01, fadeOut: 0.01, alpha: 0.9,
      render: (ctx) => {
        CLOUD.forEach((row, ry) => [...row].forEach((c, rx) => {
          if (c === '.') return;
          ctx.fillStyle = ry === CLOUD.length - 1 ? '#d1fae5' : '#ffffff';
          ctx.fillRect((rx - 5) * cell, (ry - 2) * cell, cell, cell);
        }));
        ctx.strokeStyle = 'rgba(22, 163, 74, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-5 * cell, -2 * cell, 10 * cell, 4 * cell);
      },
    });
  };
  return {
    tick(dt, env, layer) {
      if (!seeded) {
        seeded = true;
        for (let i = 0; i < 3; i += 1) layer.add(cloud(env, rand(0, env.w)));
      }
      clouds(dt, 0.06, env, () => {
        if (layer.count((p) => p.cloud) < 4) layer.add(cloud(env, -140));
      });
      // Little hearts and stars bob upward now and then.
      floaters(dt, 0.5, env, () => {
        const name = pick(['heart', 'star']);
        layer.add(ambient({
          x: rand(0, env.w), y: env.h + 20, vy: rand(-45, -25), life: 16, fadeIn: 0.05, fadeOut: 0.2, alpha: 0.85,
          onUpdate: (p) => { p.x += Math.sign(Math.sin(p.age * 2 + p.phase)) * 0.4; },
          render: (ctx) => drawSprite(ctx, name, 18, name === 'heart' ? '#ef4444' : '#facc15'),
        }));
      });
      // Coin rain: coins drop from the top, spinning.
      if (rain.tick(dt) < 0) return;
      coins(dt, 10, env, () => {
        layer.add(ambient({
          x: rand(0, env.w), y: -20, vy: rand(160, 260), ay: 120, life: 8, fadeIn: 0, fadeOut: 0.05,
          render: (ctx, p) => {
            ctx.scale(Math.max(0.15, Math.abs(Math.cos(p.age * 6 + p.phase))), 1);
            drawSprite(ctx, 'coin', 22, '#f59e0b');
          },
        }));
      });
    },
  };
}

// ----------------------------------------------------------------- cyber ---
function cyberScene({ preview = false } = {}) {
  const soon = preview ? 1.2 : undefined;
  const pulses = emitter(), streams = emitter();
  const glitch = cycle([16, 28], [3, 3.5], soon);
  const COLORS = ['#e11d8f', '#06b6d4', '#a855f7'];
  // A signal running along a circuit trace: straight, then one right-angle turn.
  const pulse = (env) => {
    const color = pick(COLORS), speed = rand(260, 420), horizontal = Math.random() < 0.6;
    const turnAt = rand(0.3, 0.7);
    const sx = horizontal ? -20 : Math.round(rand(0, env.w) / 40) * 40;
    const sy = horizontal ? Math.round(rand(0, env.h) / 40) * 40 : -20;
    const span = horizontal ? env.w : env.h;
    return ambient({
      x: sx, y: sy, life: (span * 1.2) / speed, fadeIn: 0.02, fadeOut: 0.1, cull: false, trail: [],
      onUpdate: (p) => {
        const d = p.age * speed, turn = span * turnAt;
        if (horizontal) {
          p.x = sx + Math.min(d, turn);
          p.y = sy + Math.max(0, d - turn) * (sy > env.h / 2 ? -1 : 1);
        } else {
          p.y = sy + Math.min(d, turn);
          p.x = sx + Math.max(0, d - turn) * (sx > env.w / 2 ? -1 : 1);
        }
        p.trail.push(p.x, p.y);
        if (p.trail.length > 30) p.trail.splice(0, 2);
      },
      render: (ctx, p) => {
        ctx.translate(-p.x, -p.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha *= 0.75;
        ctx.beginPath();
        for (let i = 0; i < p.trail.length; i += 2) {
          if (i === 0) ctx.moveTo(p.trail[i], p.trail[i + 1]); else ctx.lineTo(p.trail[i], p.trail[i + 1]);
        }
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, TAU);
        ctx.fill();
        ctx.stroke();
      },
    });
  };
  return {
    tick(dt, env, layer) {
      pulses(dt, 0.9, env, () => {
        if (layer.count((p) => p.ambient) < 14 * env.area) layer.add(pulse(env));
      });
      const g = glitch.tick(dt);
      if (g < 0) return;
      // A glitch: a scan band sweeps down while columns of 0/1 rain past.
      if (!layer.count((p) => p.scanBand)) {
        layer.add(ambient({
          scanBand: true, x: 0, y: -40, vy: env.h / 2.6, life: 3, fadeIn: 0.05, fadeOut: 0.1, cull: false,
          render: (ctx) => {
            const g2 = ctx.createLinearGradient(0, -30, 0, 30);
            g2.addColorStop(0, 'rgba(6, 182, 212, 0)');
            g2.addColorStop(0.5, 'rgba(6, 182, 212, 0.22)');
            g2.addColorStop(1, 'rgba(225, 29, 143, 0)');
            ctx.fillStyle = g2;
            ctx.fillRect(0, -30, env.w, 60);
            ctx.fillStyle = 'rgba(225, 29, 143, 0.6)';
            ctx.fillRect(0, 0, env.w, 1.5);
          },
        }));
      }
      streams(dt, 14, env, () => {
        const text = Math.random() < 0.5 ? '0' : '1', color = pick(COLORS);
        layer.add(ambient({
          x: Math.round(rand(0, env.w) / 24) * 24, y: -10, vy: rand(380, 560), life: 3, fadeIn: 0, fadeOut: 0.2, alpha: 0.7,
          render: (ctx) => {
            ctx.font = '700 15px ui-monospace, "Cascadia Code", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.fillText(text, 0, 0);
          },
        }));
      });
    },
  };
}

// Each scene is matched by any of its words. The Sakura theme's art is a
// hand-uploaded file with a numeric name, so its Thai item name is what
// identifies it.
const SCENES = [
  [['monster'], monsterScene],
  [['forest'], forestScene],
  [['winter'], winterScene],
  [['ocean'], oceanScene],
  [['lantern'], lanternScene],
  [['space', 'อวกาศ'], spaceScene],
  [['sakura', 'ซากุระ', '474510254'], sakuraScene],
  [['pixel', 'พิกเซล'], pixelScene],
  [['cyber', 'ไซเบอร์'], cyberScene],
];

/** The scene factory for a theme, or null when the theme has none. */
export function sceneForTheme(themeText) {
  const text = String(themeText || '').toLowerCase();
  const found = SCENES.find(([words]) => words.some((word) => text.includes(word)));
  return found ? found[1] : null;
}
