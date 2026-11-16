// Shapes the cosmetic effects draw on a canvas (fix list item 8).
//
// Drawn as paths rather than emoji or image files: an emoji looks different on
// every phone and laptop and blurs when scaled up, and an image has to load
// before the first click shows anything. Every function draws centred on (0, 0)
// at the size it is given; the caller has already translated, rotated and set
// the alpha.

// ---------------------------------------------------------------- leaves ---
const LEAF = new Path2D('M0 -1 C0.55 -0.7 0.62 0.2 0 1 C-0.62 0.2 -0.55 -0.7 0 -1 Z');
const LEAF_VEIN = new Path2D('M0 -0.9 L0 0.95 M0 -0.25 L0.28 -0.48 M0 0.15 L-0.3 -0.08 M0 0.45 L0.26 0.25');
const MAPLE = new Path2D(
  'M0 -1 L0.18 -0.55 L0.5 -0.68 L0.4 -0.3 L0.88 -0.25 L0.6 0.05 L0.75 0.32 L0.3 0.25 '
  + 'L0.08 0.55 L0.06 1 L-0.06 1 L-0.08 0.55 L-0.3 0.25 L-0.75 0.32 L-0.6 0.05 L-0.88 -0.25 '
  + 'L-0.4 -0.3 L-0.5 -0.68 L-0.18 -0.55 Z',
);

export const LEAF_COLORS = ['#16a34a', '#22c55e', '#65a30d', '#84cc16', '#eab308', '#f59e0b', '#ea580c', '#dc2626'];

export function drawLeaf(ctx, size, color, kind = 0) {
  ctx.scale(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.fill(kind === 1 ? MAPLE : LEAF);
  ctx.lineWidth = 0.07;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke(LEAF_VEIN);
}

// ------------------------------------------------------------- snowflake ---
export function drawSnowflake(ctx, radius, detailed = true) {
  if (!detailed || radius < 4) {
    // A pale blue dot with a blue rim: a plain white one disappears on the
    // near-white middle of every light theme.
    ctx.fillStyle = '#f0f9ff';
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, radius * 0.75), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return;
  }
  // A light blue outline under the white arms, so the flake still reads on
  // the near-white middle of a light theme.
  for (const [stroke, width] of [['rgba(2, 132, 199, 0.85)', radius * 0.3], ['#ffffff', radius * 0.13]]) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let arm = 0; arm < 6; arm += 1) {
      const a = (arm * Math.PI) / 3;
      const cos = Math.cos(a), sin = Math.sin(a);
      ctx.moveTo(0, 0);
      ctx.lineTo(cos * radius, sin * radius);
      for (const at of [0.45, 0.72]) {
        const bx = cos * radius * at, by = sin * radius * at;
        const len = radius * (at === 0.45 ? 0.32 : 0.22);
        for (const side of [-1, 1]) {
          const b = a + side * 0.75;
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(b) * len, by + Math.sin(b) * len);
        }
      }
    }
    ctx.stroke();
  }
}

// A four-point twinkle, used for frost glints, firework glitter and confetti.
export function drawTwinkle(ctx, size, color) {
  const s = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
  ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
  ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
  ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
  ctx.fill();
}

// ---------------------------------------------------------------- bubble ---
export function drawBubble(ctx, radius) {
  const g = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  g.addColorStop(0.55, 'rgba(165, 243, 252, 0.25)');
  g.addColorStop(1, 'rgba(8, 145, 178, 0.35)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, radius * 0.09);
  ctx.strokeStyle = 'rgba(8, 145, 178, 0.6)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.38, -radius * 0.42, radius * 0.22, radius * 0.13, -0.7, 0, Math.PI * 2);
  ctx.fill();
}

// ------------------------------------------------------------------ fish ---
export const FISH_COLORS = [
  ['#f97316', '#fed7aa'], ['#facc15', '#fef9c3'], ['#ec4899', '#fbcfe8'],
  ['#3b82f6', '#bfdbfe'], ['#14b8a6', '#99f6e4'], ['#a855f7', '#e9d5ff'],
];

// Faces +x. `wag` is the tail angle in radians.
export function drawFish(ctx, size, [body, belly], wag = 0) {
  const s = size / 2;
  ctx.save();
  ctx.translate(-s * 0.55, 0);
  ctx.rotate(wag);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-s * 0.55, -s * 0.45);
  ctx.quadraticCurveTo(-s * 0.4, 0, -s * 0.55, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.62, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(s * 0.05, s * 0.14, s * 0.42, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.arc(-s * 0.1, 0, s * 0.3, -1.1, 1.1);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(s * 0.32, -s * 0.08, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(s * 0.35, -s * 0.08, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

// --------------------------------------------------------------- lantern ---
// A Thai sky lantern (khom loi): a paper bag lit from below. `flicker` 0..1.
export function drawLantern(ctx, size, flicker = 1) {
  const w = size * 0.5, h = size * 0.7;
  const glow = ctx.createRadialGradient(0, h * 0.15, 2, 0, 0, size * 0.9);
  glow.addColorStop(0, `rgba(253, 186, 116, ${0.5 * flicker})`);
  glow.addColorStop(1, 'rgba(253, 186, 116, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  const paper = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  paper.addColorStop(0, '#fb923c');
  paper.addColorStop(0.55, '#fdba74');
  paper.addColorStop(1, '#fef3c7');
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.moveTo(-w * 0.62, -h / 2);
  ctx.quadraticCurveTo(0, -h * 0.62, w * 0.62, -h / 2);
  ctx.lineTo(w * 0.5, h / 2);
  ctx.quadraticCurveTo(0, h * 0.56, -w * 0.5, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(194, 65, 12, 0.45)';
  ctx.lineWidth = Math.max(0.8, size * 0.02);
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, -h * 0.53);
  ctx.lineTo(-w * 0.16, h * 0.5);
  ctx.moveTo(w * 0.2, -h * 0.53);
  ctx.lineTo(w * 0.16, h * 0.5);
  ctx.stroke();
  ctx.fillStyle = `rgba(254, 240, 138, ${0.6 + 0.4 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.46, w * 0.14, h * 0.07 * (0.8 + flicker * 0.4), 0, 0, Math.PI * 2);
  ctx.fill();
}

// --------------------------------------------------------------- monster ---
// Ten faces, shown in turn by the Little Monsters click effect so every click
// meets a new one. Each is a recipe, drawn below.
export const MONSTERS = [
  { body: '#a78bfa', belly: '#ede9fe', shape: 'round', eyes: 1, top: 'horns', mouth: 'fangs' },
  { body: '#4ade80', belly: '#dcfce7', shape: 'blob', eyes: 2, top: 'antenna', mouth: 'smile' },
  { body: '#f472b6', belly: '#fce7f3', shape: 'round', eyes: 2, top: 'ears', mouth: 'tongue' },
  { body: '#fb923c', belly: '#ffedd5', shape: 'square', eyes: 3, top: 'horns', mouth: 'open' },
  { body: '#38bdf8', belly: '#e0f2fe', shape: 'ghost', eyes: 2, top: 'none', mouth: 'o' },
  { body: '#facc15', belly: '#fef9c3', shape: 'blob', eyes: 1, top: 'antenna', mouth: 'fangs' },
  { body: '#2dd4bf', belly: '#ccfbf1', shape: 'round', eyes: 3, top: 'ears', mouth: 'smile' },
  { body: '#f87171', belly: '#fee2e2', shape: 'square', eyes: 2, top: 'horns', mouth: 'tongue' },
  { body: '#c084fc', belly: '#f3e8ff', shape: 'ghost', eyes: 1, top: 'antenna', mouth: 'open' },
  { body: '#a3e635', belly: '#ecfccb', shape: 'blob', eyes: 2, top: 'ears', mouth: 'fangs' },
];

const OUTLINE = '#3b1f5c';

function monsterBody(ctx, shape, s, t) {
  ctx.beginPath();
  if (shape === 'square') {
    const r = s * 0.35;
    ctx.roundRect(-s * 0.82, -s * 0.78, s * 1.64, s * 1.62, r);
  } else if (shape === 'ghost') {
    ctx.moveTo(-s * 0.8, s * 0.75);
    ctx.lineTo(-s * 0.8, -s * 0.1);
    ctx.arc(0, -s * 0.1, s * 0.8, Math.PI, 0);
    ctx.lineTo(s * 0.8, s * 0.75);
    const waves = 4;
    for (let i = waves; i > 0; i -= 1) {
      const x1 = -s * 0.8 + (s * 1.6 * (i - 0.5)) / waves;
      const x0 = -s * 0.8 + (s * 1.6 * (i - 1)) / waves;
      const dip = s * (0.18 + 0.05 * Math.sin(t * 6 + i));
      ctx.quadraticCurveTo(x1, s * 0.75 + dip, x0, s * 0.75);
    }
    ctx.closePath();
  } else if (shape === 'blob') {
    const n = 9;
    for (let i = 0; i <= n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      const r = s * (0.86 + 0.07 * Math.sin(a * 3 + t * 4));
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.92 + s * 0.04;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    ctx.ellipse(0, s * 0.04, s * 0.86, s * 0.82, 0, 0, Math.PI * 2);
  }
}

// `blink` 0 = open, 1 = shut.
export function drawMonster(ctx, size, m, t = 0, blink = 0) {
  const s = size / 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, s * 0.07);
  ctx.strokeStyle = OUTLINE;

  // What sticks out of the top goes behind the body.
  ctx.fillStyle = m.body;
  if (m.top === 'horns') {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * s * 0.25, -s * 0.62);
      ctx.quadraticCurveTo(side * s * 0.55, -s * 1.25, side * s * 0.62, -s * 1.05);
      ctx.quadraticCurveTo(side * s * 0.6, -s * 0.75, side * s * 0.55, -s * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#fde68a';
      ctx.fill();
      ctx.stroke();
    }
  } else if (m.top === 'antenna') {
    for (const side of [-1, 1]) {
      const wob = Math.sin(t * 7 + side) * s * 0.08;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.2, -s * 0.7);
      ctx.quadraticCurveTo(side * s * 0.3, -s * 1.05, side * s * 0.38 + wob, -s * 1.2);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(side * s * 0.38 + wob, -s * 1.2, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (m.top === 'ears') {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * s * 0.25, -s * 0.7);
      ctx.lineTo(side * s * 0.7, -s * 1.1);
      ctx.lineTo(side * s * 0.75, -s * 0.45);
      ctx.closePath();
      ctx.fillStyle = m.body;
      ctx.fill();
      ctx.stroke();
    }
  }

  monsterBody(ctx, m.shape, s, t);
  ctx.fillStyle = m.body;
  ctx.fill();
  ctx.stroke();

  // Belly
  ctx.fillStyle = m.belly;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.42, s * 0.48, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeSets = { 1: [[0, -s * 0.18, 0.34]], 2: [[-s * 0.3, -s * 0.15, 0.22], [s * 0.3, -s * 0.15, 0.22]], 3: [[-s * 0.38, -s * 0.08, 0.16], [0, -s * 0.32, 0.2], [s * 0.38, -s * 0.08, 0.16]] };
  for (const [ex, ey, er] of eyeSets[m.eyes] || eyeSets[2]) {
    const r = s * er;
    const open = Math.max(0.08, 1 - blink);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, r, r * open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (open > 0.3) {
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.ellipse(ex + r * 0.15, ey + r * 0.1 * open, r * 0.5, r * 0.5 * open, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + r * 0.32, ey - r * 0.12 * open, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * s * 0.55, s * 0.18, s * 0.13, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  const my = s * 0.2;
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  if (m.mouth === 'o') {
    ctx.ellipse(0, my + s * 0.05, s * 0.12, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.mouth === 'open' || m.mouth === 'tongue' || m.mouth === 'fangs') {
    ctx.moveTo(-s * 0.3, my);
    ctx.quadraticCurveTo(0, my + s * 0.42, s * 0.3, my);
    ctx.closePath();
    ctx.fill();
    if (m.mouth === 'tongue') {
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.ellipse(0, my + s * 0.2, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (m.mouth === 'fangs') {
      ctx.fillStyle = '#ffffff';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * s * 0.2, my + s * 0.02);
        ctx.lineTo(side * s * 0.12, my + s * 0.02);
        ctx.lineTo(side * s * 0.16, my + s * 0.15);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else {
    ctx.lineWidth = Math.max(1.5, s * 0.07);
    ctx.moveTo(-s * 0.24, my);
    ctx.quadraticCurveTo(0, my + s * 0.25, s * 0.24, my);
    ctx.stroke();
  }
}

// --------------------------------------------------------------- snowman ---
export function drawSnowman(ctx, size, wave = 0) {
  const s = size / 2;
  ctx.lineWidth = Math.max(1.2, s * 0.05);
  ctx.strokeStyle = '#7dd3fc';
  ctx.fillStyle = '#ffffff';
  for (const [y, r] of [[s * 0.45, s * 0.5], [-s * 0.3, s * 0.35]]) {
    ctx.beginPath();
    ctx.arc(0, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Arm, waving
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, s * 0.25);
  ctx.lineTo(-s * 0.85, s * 0.05);
  ctx.save();
  ctx.translate(s * 0.4, s * 0.25);
  ctx.rotate(-0.6 + Math.sin(wave) * 0.45);
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.48, 0);
  ctx.restore();
  ctx.stroke();
  // Scarf
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-s * 0.36, -s * 0.05, s * 0.72, s * 0.14);
  ctx.fillRect(s * 0.1, -s * 0.02, s * 0.14, s * 0.36);
  // Hat
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-s * 0.36, -s * 0.66, s * 0.72, s * 0.08);
  ctx.fillRect(-s * 0.24, -s * 1.0, s * 0.48, s * 0.36);
  // Face
  ctx.fillStyle = '#1e293b';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * s * 0.12, -s * 0.36, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.28);
  ctx.lineTo(s * 0.3, -s * 0.24);
  ctx.lineTo(0, -s * 0.2);
  ctx.closePath();
  ctx.fill();
}

// ------------------------------------------------- the four original sets ---
// Added 2026-11-17 when the Space, Sakura, Pixel Art and Cyber sets got the
// same treatment as the five new ones.

// Sakura petal: a rounded teardrop with the little notch at its tip.
const PETAL = new Path2D('M0 1 C-0.75 0.55 -0.7 -0.45 -0.2 -0.95 L0 -0.72 L0.2 -0.95 C0.7 -0.45 0.75 0.55 0 1 Z');
export const PETAL_COLORS = ['#fbcfe8', '#f9a8d4', '#f472b6', '#fce7f3', '#fda4af'];

export function drawPetal(ctx, size, color) {
  ctx.scale(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.fill(PETAL);
  ctx.lineWidth = 0.08;
  ctx.strokeStyle = 'rgba(219, 39, 119, 0.55)';
  ctx.stroke(PETAL);
}

// A whole blossom: five petals round a yellow centre. `open` 0..1.
export function drawBlossom(ctx, size, open = 1) {
  for (let i = 0; i < 5; i += 1) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.translate(0, -size * 0.28 * open);
    drawPetal(ctx, size * 0.5 * (0.4 + 0.6 * open), i % 2 ? '#f9a8d4' : '#fbcfe8');
    ctx.restore();
  }
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#db2777';
  for (let i = 0; i < 5; i += 1) {
    const a = (i * Math.PI * 2) / 5 + 0.6;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * size * 0.13, Math.sin(a) * size * 0.13, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Five-point star with a darker rim.
export function drawStar(ctx, size, fill, rim = 'rgba(91, 33, 182, 0.6)') {
  const r = size / 2;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.strokeStyle = rim;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// A ringed planet. `tilt` in radians.
export function drawPlanet(ctx, size, [body, band] = ['#a78bfa', '#c4b5fd'], tilt = -0.35) {
  const r = size / 2;
  ctx.save();
  ctx.rotate(tilt);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.7, r * 0.45, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = band;
  ctx.fillRect(-r, -r * 0.25, r * 2, r * 0.22);
  ctx.fillRect(-r, r * 0.3, r * 2, r * 0.14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.4, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = r * 0.08;
  ctx.strokeStyle = 'rgba(76, 29, 149, 0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.rotate(tilt);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.7, r * 0.45, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

// 8-bit sprites drawn from a grid: one character per pixel, '.' is empty.
const SPRITES = {
  heart: ['.XX.XX.', 'XWXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  coin: ['..XXX..', '.XYYYX.', 'XYYWYYX', 'XYYWYYX', 'XYYWYYX', '.XYYYX.', '..XXX..'],
  star: ['...X...', '...X...', '.XXXXX.', 'XXXWXXX', '.XXXXX.', '.XX.XX.', 'X.....X'],
  gem: ['.XXXXX.', 'XWYYYYX', 'XYYYYYX', '.XYYYX.', '..XYX..', '...X...'],
};
export const SPRITE_NAMES = Object.keys(SPRITES);

export function drawSprite(ctx, name, size, color, accent = '#fde047') {
  const rows = SPRITES[name] || SPRITES.heart;
  const cell = size / rows[0].length;
  const ox = -size / 2, oy = -(rows.length * cell) / 2;
  // A one-cell dark outline drawn first keeps the shape crisp on any theme.
  ctx.fillStyle = 'rgba(20, 83, 45, 0.85)';
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== '.') ctx.fillRect(ox + x * cell - cell * 0.18, oy + y * cell - cell * 0.18, cell * 1.36, cell * 1.36);
  }));
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '.') return;
    ctx.fillStyle = c === 'W' ? '#ffffff' : c === 'Y' ? accent : color;
    ctx.fillRect(ox + x * cell, oy + y * cell, cell + 0.4, cell + 0.4);
  }));
}

// A jagged lightning bolt from (0,0) to (dx,dy), different every call.
export function boltPoints(dx, dy, segments = 6, jag = 0.22) {
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const pts = [[0, 0]];
  for (let i = 1; i < segments; i += 1) {
    const t = i / segments, off = (Math.random() - 0.5) * 2 * jag * len / segments * 2;
    pts.push([dx * t + nx * off, dy * t + ny * off]);
  }
  pts.push([dx, dy]);
  return pts;
}

export function drawBolt(ctx, pts, color, width = 3) {
  for (const [stroke, w] of [[color, width * 2.4], ['#ffffff', width]]) {
    ctx.strokeStyle = stroke;
    ctx.globalAlpha *= stroke === color ? 0.55 : 1;
    ctx.lineWidth = w;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    if (stroke === color) ctx.globalAlpha /= 0.55;
  }
}

// A hexagon outline, for the cyber scan rings.
export function hexPath(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}
