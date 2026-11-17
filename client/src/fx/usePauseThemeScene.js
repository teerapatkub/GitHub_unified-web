import { useEffect } from 'react';
import { pauseThemeScene } from './index.js';

// Keeps the theme's moving scene off while `active` is true and the component
// is on screen (see pauseThemeScene).
export default function usePauseThemeScene(active = true) {
  useEffect(() => (active ? pauseThemeScene() : undefined), [active]);
}
