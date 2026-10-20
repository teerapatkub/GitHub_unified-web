// Shop money paid after each Arcade round.
//
// It used to be 500/400/300/200/100 by the round's rank alone, from a start of
// zero. The cheapest item costs 300, so after round 1 the leader could buy two
// sabotage items while last place could buy nothing: the player already
// ahead got the tools to stay ahead, and a comeback was close to impossible.
//
// Now every round pays three parts (shared/arcadeConfig.json, roundCash):
//   base      the same for everyone - always enough for one item
//   rank      a smaller reward for this round's score, so playing well still pays
//   comeback  for the lowest total scores among the players still in, so the
//             ones who most need an item can afford one; the leader never gets it
// Equal scores get equal money.
const { roundCash } = require('../../shared/arcadeConfig.json');

/**
 * @param {Array<{name:string, roundScore:number, totalScore:number, eliminated:boolean}>} players
 * @returns {Map<string, {base:number, rank:number, comeback:number, total:number}>}
 */
function roundCashFor(players, config = roundCash) {
  const survivors = players.filter(p => !p.eliminated);
  const leaderTotal = Math.max(...survivors.map(p => p.totalScore));
  const pay = new Map();
  // The bonus table is for five players; a smaller room is spread across it so
  // its last place still gets the last (zero) bonus, not the second one.
  const steps = config.rankBonus.length - 1;
  for (const player of players) {
    const above = players.filter(other => other.roundScore > player.roundScore).length;
    const rank = config.rankBonus[players.length > 1 ? Math.round(above * steps / (players.length - 1)) : 0] || 0;
    let comeback = 0;
    if (!player.eliminated && survivors.length > 1 && player.totalScore < leaderTotal) {
      const fromBottom = survivors.filter(other => other.totalScore < player.totalScore).length;
      comeback = config.comebackBonus[fromBottom] || 0;
    }
    pay.set(player.name, { base: config.base, rank, comeback, total: config.base + rank + comeback });
  }
  return pay;
}

module.exports = { roundCashFor };
