const arcadeConfig = require('../../shared/arcadeConfig.json');

// The caller owns the room/participant locks and commits this with RESULT.
async function settleArcadeRewards(connection, room) {
  const [standings] = await connection.query(
    'SELECT * FROM arcade_participants WHERE room_id = ? AND match_id = ? ORDER BY score DESC, joined_at ASC, id ASC',
    [room.room_id, room.current_match_id]
  );
  // Lock accounts in a consistent order, even when the same people finish
  // different rooms concurrently. Bots/unregistered names have no wallet.
  const [accounts] = await connection.query(`SELECT u.user_id, u.username FROM users u
    JOIN arcade_participants p ON p.user_name = u.username
    WHERE p.room_id = ? AND p.match_id = ? AND p.participant_kind = 'human' ORDER BY u.user_id FOR UPDATE OF u`,
  [room.room_id, room.current_match_id]);
  for (const account of accounts) {
    const index = standings.findIndex(p => p.user_name === account.username);
    const player = standings[index];
    const rank = index + 1;
    const coins = Number(arcadeConfig.coinRewardByRank[String(rank)] ?? arcadeConfig.coinRewardParticipation ?? 0);
    const [inserted] = await connection.query(`INSERT INTO arcade_reward_receipts
      (match_id, user_id, user_name, final_rank, score, cash, coins)
      VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (match_id, user_id) DO NOTHING`,
    [room.current_match_id, account.user_id, account.username, rank, player.score || 0, player.cash || 0, coins]);
    if (!inserted.affectedRows) continue;
    // This mode grants coins only. Increment the shared wallet without rewriting XP/level.
    await connection.query('UPDATE users SET virtual_currency = COALESCE(virtual_currency, 0) + ? WHERE user_id = ?', [coins, account.user_id]);
    await connection.query(`INSERT INTO arcade_player_stats
      (user_name, matches_played, wins, best_rank, total_score, total_cash_earned, updated_at)
      VALUES (?, 1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_name) DO UPDATE SET
        matches_played = arcade_player_stats.matches_played + 1,
        wins = arcade_player_stats.wins + EXCLUDED.wins,
        best_rank = LEAST(COALESCE(arcade_player_stats.best_rank, EXCLUDED.best_rank), EXCLUDED.best_rank),
        total_score = arcade_player_stats.total_score + EXCLUDED.total_score,
        total_cash_earned = arcade_player_stats.total_cash_earned + EXCLUDED.total_cash_earned,
        updated_at = CURRENT_TIMESTAMP`,
    [account.username, rank === 1 ? 1 : 0, rank, player.score || 0, player.cash || 0]);
    await connection.query('UPDATE arcade_participants SET coins_awarded = ? WHERE id = ? AND match_id = ?', [coins, player.id, room.current_match_id]);
    player.coins_awarded = coins;
  }
  const finalStandings = standings.map((player, index) => ({
    name: player.user_name, rank: index + 1, score: player.score || 0,
    eliminated: Boolean(player.is_eliminated), coins: player.coins_awarded || 0
  }));
  await connection.query('UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = ? WHERE match_id = ? AND ended_at IS NULL', [JSON.stringify(finalStandings), room.current_match_id]);
  await connection.query('UPDATE arcade_round_history SET match_ended_at = CURRENT_TIMESTAMP WHERE match_id = ? AND match_ended_at IS NULL', [room.current_match_id]);
}

module.exports = { settleArcadeRewards };
