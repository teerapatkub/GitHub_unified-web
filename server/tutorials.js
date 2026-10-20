// Which first-run tours an account has finished or skipped
// (client/src/data/appTour.js). Kept on the account rather than in the
// browser so a player who signs in on a second device is not walked through
// the same menus again.
const TOUR_ID = /^[a-z0-9-]{1,40}$/;

async function migrateTutorialsSeen(db) {
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorials_seen JSONB NOT NULL DEFAULT '[]'::jsonb`);
}

function installTutorials(app, db) {
  // The auth middleware has already put the signed-in account on req.player;
  // there is no user id in the URL, so nobody can mark another account's tours.
  app.post('/api/user/tutorials/:tourId/seen', async (req, res) => {
    const { tourId } = req.params;
    if (!TOUR_ID.test(tourId)) return res.status(400).json({ error: 'รหัสบทแนะนำไม่ถูกต้อง' });
    try {
      // jsonb_exists() rather than the `?` operator: the db wrapper turns every
      // `?` into a bind parameter.
      await db.query(
        `UPDATE users SET tutorials_seen = tutorials_seen || to_jsonb(?::text)
         WHERE user_id = ? AND NOT jsonb_exists(tutorials_seen, ?)`,
        [tourId, req.player.user_id, tourId]
      );
      const [[row]] = await db.query('SELECT tutorials_seen FROM users WHERE user_id = ?', [req.player.user_id]);
      res.json({ tutorials_seen: row?.tutorials_seen || [] });
    } catch (error) {
      console.error('❌ tutorials seen write failed:', error.message);
      res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
    }
  });
}

module.exports = { migrateTutorialsSeen, installTutorials };
