import { Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isCanvasClickFx, playClickFx, previewThemeScene, themeHasScene } from '../../fx/index.js';

const parseEffects = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Lets a shopper try a cosmetic before paying for it (fix list item 8): a click
// effect plays from the button, a theme's moving scene plays over the page for
// a few seconds. Renders nothing for items with neither.
export default function CosmeticTryButton({ type, effects, themeText, className = '' }) {
  const { t } = useTranslation();
  const list = parseEffects(effects);
  const click = list.find((e) => String(e?.trigger || 'click') === 'click' && isCanvasClickFx(e?.fx));
  const dbl = list.find((e) => String(e?.trigger) === 'dblclick' && isCanvasClickFx(e?.fx));
  const base = `inline-flex min-h-target items-center gap-1.5 whitespace-nowrap rounded-lg border border-pysim-primary/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-pysim-primary transition-colors hover:bg-pysim-primary/10 ${className}`;

  if (type === 'MOUSE_EFFECT' && click) {
    const at = (event) => {
      const box = event.currentTarget.getBoundingClientRect();
      return [box.left + box.width / 2, box.top + box.height / 2];
    };
    return (
      <button
        type="button"
        data-profile-appearance
        className={base}
        title={t('shop.tryEffectHint', 'คลิกเพื่อลอง ดับเบิลคลิกเพื่อดูอีกแบบ')}
        onClick={(event) => playClickFx(click.fx, ...at(event))}
        onDoubleClick={(event) => dbl && playClickFx(dbl.fx, ...at(event))}
      >
        <Sparkles size={14} /> {t('shop.tryEffect', 'ลองคลิก')}
      </button>
    );
  }

  if (type === 'THEME' && themeHasScene(themeText)) {
    return (
      <button type="button" className={base} title={t('shop.previewSceneHint', 'ดูฉากเคลื่อนไหวของธีมนี้สักครู่')} onClick={() => previewThemeScene(themeText)}>
        <Play size={14} /> {t('shop.previewScene', 'ดูฉาก')}
      </button>
    );
  }
  return null;
}
