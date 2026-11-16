import { useEffect } from 'react';
import { useTheme } from '../contexts/useTheme.js';
import { setThemeScene } from '../fx/index.js';

// Plays the moving scene of the shop theme that is on - falling leaves, snow,
// fish, lanterns (fix list item 8). The scene is picked by keyword from the
// theme's name and art (fx/ambientScenes.js); a built-in theme has none.
export default function ThemeSceneLayer() {
  const { theme } = useTheme();
  const text = theme?.category === 'shop' ? `${theme.name || ''} ${theme.backgroundImage || ''}` : '';
  useEffect(() => {
    setThemeScene(text);
  }, [text]);
  useEffect(() => () => setThemeScene(''), []);
  return null;
}
