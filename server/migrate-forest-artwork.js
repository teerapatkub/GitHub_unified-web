// The Whispering Forest theme gets the owner's own artwork (2026-11-17): a
// pastel woodland with animals at the edges and a cream middle for the page
// text, replacing the first SVG drawn for migration 202611170001.
//
// Its own migration because 202611170001 has already been applied, and an
// applied migration's source is its checksum. Only a row still pointing at the
// old art is moved, so art an administrator uploaded in its place stays.
// The file name keeps "forest", which is what picks the theme's colours and
// its falling-leaves scene on the client.

const OLD_ART = '/uploads/forest-theme.svg';
const NEW_ART = '/uploads/forest-theme.webp';

async function migrateForestArtwork(db) {
  await db.query(
    `UPDATE shop_items SET asset_url = ?
      WHERE set_key = 'forest' AND item_type = 'THEME' AND asset_url = ?`,
    [NEW_ART, OLD_ART],
  );
}

module.exports = { migrateForestArtwork, NEW_ART };
