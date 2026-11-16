// The owner's own artwork for the last four themes (2026-11-17): Sakura, Cyber
// and Pixel Art from the original sets, and the Lantern Festival set added the
// same day. The others got theirs in migrate-forest-artwork.js and
// migrate-theme-artwork.js.
//
// Its own migration because those are applied and their source is their
// checksum. A theme is moved only while it still points at the art it was
// seeded with, so art an administrator uploaded in its place stays. Every new
// file name has its keyword (sakura, cyber, pixel, lantern), which picks the
// theme's colours and moving scene on the client.
//
// The Sakura row was a hand-uploaded theme adopted into its set, so its old
// art has a numeric file name. That file, and the Cyber and Pixel SVGs, stay in
// seed-assets: the core seed still writes those paths on a fresh database
// before this migration moves them.

const THEME_ART = [
  { setKey: 'sakura', from: '/uploads/1782844342595-474510254.png', to: '/uploads/sakura-theme.webp' },
  { setKey: 'cyber', from: '/uploads/cyber-theme.svg', to: '/uploads/cyber-theme.webp' },
  { setKey: 'pixel', from: '/uploads/pixel-theme.svg', to: '/uploads/pixel-theme.webp' },
  { setKey: 'lantern', from: '/uploads/lantern-theme.svg', to: '/uploads/lantern-theme.webp' },
];

async function migrateThemeArtworkClassic(db) {
  for (const { setKey, from, to } of THEME_ART) {
    await db.query(
      `UPDATE shop_items SET asset_url = ?
        WHERE set_key = ? AND item_type = 'THEME' AND asset_url = ?`,
      [to, setKey, from],
    );
  }
}

module.exports = { migrateThemeArtworkClassic, THEME_ART };
