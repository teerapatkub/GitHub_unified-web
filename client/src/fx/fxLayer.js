// A full-screen canvas that animates cosmetic particles (fix list item 8).
//
// It only runs requestAnimationFrame while it has something to draw - a
// particle alive, or an ambient scene playing - and stops when the tab is
// hidden, so an equipped theme costs nothing on a page nobody is looking at.

const MAX_PARTICLES = 700;

export const reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (items) => items[Math.floor(Math.random() * items.length)];

/**
 * One moving thing. Everything is optional except `render(ctx, p, env)`, which
 * draws it centred on (0, 0).
 *
 *   x, y, vx, vy     position and velocity (px, px/s)
 *   ax, ay           acceleration (gravity is a positive ay)
 *   drag             fraction of velocity kept per 1/60 s
 *   terminal         maximum downward speed
 *   windK            how much the scene's wind pushes it
 *   sway, swayFreq   side-to-side flutter (px/s, rad/s)
 *   rot, vr          rotation and spin
 *   life, delay      seconds alive, seconds before it appears
 *   fadeIn, fadeOut  share of life spent fading
 *   scaleAt(t)       size over life (t is 0..1); default 1
 *   onUpdate(p,dt,env) / onDeath(p, layer)
 */
export function particle(fields) {
  return {
    x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 1, terminal: Infinity, windK: 0,
    sway: 0, swayFreq: 2, phase: Math.random() * Math.PI * 2,
    rot: 0, vr: 0, life: 1, age: 0, delay: 0, alpha: 1, fadeIn: 0.1, fadeOut: 0.3,
    cull: true,
    ...fields,
  };
}

const step = (p, dt, env) => {
  p.vx += (p.ax + env.wind * p.windK) * dt;
  p.vy += p.ay * dt;
  if (p.drag !== 1) {
    const keep = Math.pow(p.drag, dt * 60);
    p.vx *= keep;
    p.vy *= keep;
  }
  if (p.vy > p.terminal) p.vy = p.terminal;
  p.x += p.vx * dt + (p.sway ? Math.cos(p.age * p.swayFreq + p.phase) * p.sway * dt : 0);
  p.y += p.vy * dt;
  p.rot += p.vr * dt;
};

const alphaAt = (p, t) => {
  let a = p.alpha;
  if (p.fadeIn > 0 && t < p.fadeIn) a *= t / p.fadeIn;
  if (p.fadeOut > 0 && t > 1 - p.fadeOut) a *= (1 - t) / p.fadeOut;
  return Math.max(0, Math.min(1, a));
};

export function createFxLayer({ zIndex, label }) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.fxLayer = label;
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: String(zIndex),
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const env = { w: 0, h: 0, time: 0, wind: 0, area: 1 };
  let particles = [];
  let scene = null;
  let frame = 0;
  let last = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    env.w = window.innerWidth;
    env.h = window.innerHeight;
    // How much screen there is relative to a laptop, so a phone gets fewer
    // leaves rather than the same number crammed together.
    env.area = Math.max(0.35, Math.min(1.5, (env.w * env.h) / (1440 * 900)));
    canvas.width = Math.round(env.w * dpr);
    canvas.height = Math.round(env.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const tick = (now) => {
    frame = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    env.time += dt;
    if (scene) scene.tick(dt, env, api);

    ctx.clearRect(0, 0, env.w, env.h);
    // Bursts that spawn bursts (a lantern rocket that becomes a firework) add
    // to `particles` while this loop runs, so it walks a snapshot instead.
    const current = particles;
    particles = [];
    const alive = [];
    for (const p of current) {
      if (p.delay > 0) {
        p.delay -= dt;
        alive.push(p);
        continue;
      }
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) {
        p.onDeath?.(p, api);
        continue;
      }
      step(p, dt, env);
      p.onUpdate?.(p, dt, env);
      const margin = 160;
      if (p.cull && (p.x < -margin || p.x > env.w + margin || p.y > env.h + margin || p.y < -margin * 2)) continue;
      ctx.save();
      ctx.globalAlpha = alphaAt(p, t);
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);
      const scale = p.scaleAt ? p.scaleAt(t, p) : 1;
      if (scale !== 1) ctx.scale(scale, scale);
      p.render(ctx, p, env);
      ctx.restore();
      alive.push(p);
    }
    particles = alive.concat(particles);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
    if (particles.length || scene) schedule();
    else ctx.clearRect(0, 0, env.w, env.h);
  };

  const schedule = () => {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = 0;
      schedule();
    }
  };
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  const api = {
    env,
    add(...items) {
      particles.push(...items);
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
      schedule();
    },
    count(filter) {
      return filter ? particles.filter(filter).length : particles.length;
    },
    setScene(next) {
      scene?.stop?.(api);
      scene = next || null;
      env.wind = 0;
      // The old scene's leaves or fish go with it; a click burst stays.
      particles = particles.filter((p) => !p.ambient);
      schedule();
    },
    get scene() { return scene; },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.remove();
    },
  };
  return api;
}
