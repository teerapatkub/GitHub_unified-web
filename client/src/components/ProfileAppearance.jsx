import { useEffect, useRef } from 'react';
import { assetUrl } from '../config/api.js';
import { getShopThemePalette } from '../themes/shopPalette.js';
import { showProfileScene } from '../fx/index.js';
import MouseEffectLayer from './MouseEffectLayer';

// The light veil over the lower part of the art, the same one the site's own
// theme background gets (index.css, html[data-theme^="shop-theme-"]): the
// art's busiest part is at the bottom, behind whatever text is there.
const VEIL = 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 45%, '
  + 'rgba(255, 255, 255, 0.55) 72%, rgba(255, 255, 255, 0.72) 100%)';

// A visitor sees the owner's equipped look without changing their own settings:
// the owner's theme art, its moving scene, and their click effect on this page.
export default function ProfileAppearance({ user, children }) {
  const surfaceRef = useRef(null);
  const background = assetUrl(user.theme_asset_url);
  const palette = background ? getShopThemePalette(user) : null;
  const themeText = background ? `${user.theme_name || ''} ${user.theme_asset_url || ''}` : '';

  // While this profile is open the owner's scene plays; leaving hands the
  // screen back to the viewer's own theme.
  useEffect(() => showProfileScene(themeText), [themeText]);

  return (
    <div
      ref={surfaceRef}
      data-profile-appearance
      className="min-h-screen"
      style={{
        backgroundColor: palette?.bg || '#f8fafc',
        backgroundImage: background ? `${VEIL}, url(${JSON.stringify(background)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Fixed like the site's own theme background, so the veil and the art
        // stay lined up however far the profile is scrolled.
        backgroundAttachment: 'fixed',
      }}
    >
      <MouseEffectLayer user={user} targetRef={surfaceRef} />
      {children}
    </div>
  );
}
