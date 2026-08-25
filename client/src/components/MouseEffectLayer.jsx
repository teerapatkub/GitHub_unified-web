import { useEffect, useRef, useState } from 'react';

const API_BASE = 'http://localhost:3001';

function parseEffects(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function effectDuration(effect) {
  return Math.max(200, Math.min(Number(effect?.duration) || 800, 5000));
}

export default function MouseEffectLayer({ user }) {
  const [effects, setEffects] = useState([]);
  const [bursts, setBursts] = useState([]);
  const lastHoverAt = useRef(0);

  useEffect(() => {
    setEffects(parseEffects(user?.mouse_effect_data));
  }, [user?.mouse_effect_data]);

  useEffect(() => {
    const onEquipped = (event) => setEffects(parseEffects(event.detail?.effects));
    window.addEventListener('pysim:mouse-effect-equipped', onEquipped);
    return () => window.removeEventListener('pysim:mouse-effect-equipped', onEquipped);
  }, []);

  useEffect(() => {
    if (!effects.length) return undefined;

    const spawn = (trigger, x, y) => {
      const matching = effects.filter((effect) => String(effect?.trigger || 'click').toLowerCase() === trigger);
      if (!matching.length) return;

      const next = matching.map((effect) => ({
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        visual: effect.visual || '*',
        color: effect.color || '#38bdf8',
        size: Math.max(12, Math.min(Number(effect.size) || 24, 160)),
        duration: effectDuration(effect),
      }));
      setBursts((current) => [...current, ...next]);
      next.forEach((burst) => {
        window.setTimeout(() => {
          setBursts((current) => current.filter((entry) => entry.id !== burst.id));
        }, burst.duration);
      });
    };

    const onClick = (event) => spawn('click', event.clientX, event.clientY);
    const onDoubleClick = (event) => spawn('dblclick', event.clientX, event.clientY);
    const onPointerMove = (event) => {
      if (Date.now() - lastHoverAt.current < 160) return;
      lastHoverAt.current = Date.now();
      spawn('hover', event.clientX, event.clientY);
    };

    window.addEventListener('click', onClick);
    window.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [effects]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {bursts.map((burst) => {
        const isImage = typeof burst.visual === 'string' && (burst.visual.startsWith('http') || burst.visual.startsWith('/uploads'));
        const source = burst.visual.startsWith('/uploads') ? `${API_BASE}${burst.visual}` : burst.visual;
        return (
          <span
            key={burst.id}
            className="absolute flex items-center justify-center"
            style={{
              left: burst.x,
              top: burst.y,
              width: burst.size,
              height: burst.size,
              color: burst.color,
              transform: 'translate(-50%, -50%)',
              animation: `pysim-click-effect ${burst.duration}ms ease-out forwards`,
            }}
          >
            {isImage ? (
              <img src={source} alt="" className="h-full w-full object-contain" />
            ) : (
              <span style={{ fontSize: burst.size, lineHeight: 1 }}>{burst.visual}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
