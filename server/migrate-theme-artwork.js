// The owner's own artwork for four more themes (2026-11-17), after the forest
// one (migrate-forest-artwork.js): Deep Sea, Little Monsters and Winter, whose
// first art was drawn for migration 202611170001, and the original Space theme.
//
// Its own migration because the earlier ones are applied and their source is
// their checksum. A theme is moved only while it still points at the old art,
// so art an administrator uploaded in its place stays. Every new file name
// keeps its keyword (ocean, monster, winter, space), which is what picks the
// theme's colours and moving scene on the client.

const THEME_ART = [
  { setKey: 'ocean', from: '/uploads/ocean-theme.svg', to: '/uploads/ocean-theme.webp' },
  { setKey: 'monster', from: '/uploads/monster-theme.svg', to: '/uploads/monster-theme.webp' },
  { setKey: 'winter', from: '/uploads/winter-theme.svg', to: '/uploads/winter-theme.webp' },
  { setKey: 'space', from: '/uploads/space-theme.png', to: '/uploads/space-theme.webp' },
];

async function migrateThemeArtwork(db) {
  for (const { setKey, from, to } of THEME_ART) {
    await db.query(
      `UPDATE shop_items SET asset_url = ?
        WHERE set_key = ? AND item_type = 'THEME' AND asset_url = ?`,
      [to, setKey, from],
    );
  }
}

module.exports = { migrateThemeArtwork, THEME_ART };
