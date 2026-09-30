import { useRef } from 'react';
import { assetUrl } from '../config/api.js';
import { getShopThemePalette } from '../themes/shopPalette.js';
import MouseEffectLayer from './MouseEffectLayer';

// A visitor sees the owner's equipped look without changing their own settings.
export default function ProfileAppearance({ user, children }) {
  const surfaceRef = useRef(null);
  const background = assetUrl(user.theme_asset_url);
  const palette = background ? getShopThemePalette(user) : null;
  return (
    <div
      ref={surfaceRef}
      data-profile-appearance
      className="min-h-screen"
      style={{
        backgroundColor: palette?.bg || '#f8fafc',
        backgroundImage: background ? `url(${JSON.stringify(background)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <MouseEffectLayer user={user} targetRef={surfaceRef} />
      {children}
    </div>
  );
}
