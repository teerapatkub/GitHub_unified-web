// Who is allowed into the competitive game modes.
//
// The learning side of PySim is open to everyone from the first minute, but
// the game modes are not: Competitive Arena and Arcade Battle Royale both put
// a learner on a 30-60 second clock against other people, and someone who has
// not yet finished the basics loses every round without learning anything from
// it. The gate exists so a beginner meets those modes after the lessons have
// given them something to bring.
//
// One number decides it, in one place, so the button, the route guard and the
// server all mean the same thing by "unlocked".
export const GAME_MODE_MIN_LEVEL = 10;

// The rank a player reaches at that level. The request phrased the rule as
// "ผู้เชี่ยวชาญ or level 10", and these are the same milestone - there is no
// separate expert flag anywhere in the data, so the level IS the rank.
export const GAME_MODE_RANK_TH = 'ผู้เชี่ยวชาญ';
export const GAME_MODE_RANK_EN = 'Expert';

export const levelOf = (user) => {
  const level = Number(user?.level);
  return Number.isFinite(level) && level > 0 ? level : 1;
};

export const canEnterGameModes = (user) => {
  // Admins are not learners and should not have to grind a level to inspect a
  // mode they are responsible for.
  if (String(user?.role || '').toLowerCase() === 'admin') return true;
  if (user?.isGuest) return false;
  return levelOf(user) >= GAME_MODE_MIN_LEVEL;
};

// How many more levels this player needs. 0 once they are in.
export const levelsRemaining = (user) => Math.max(0, GAME_MODE_MIN_LEVEL - levelOf(user));

export const gameModeLockMessage = (user, lang = 'th') => {
  const remaining = levelsRemaining(user);
  if (lang === 'en') {
    return `Game modes unlock at ${GAME_MODE_RANK_EN} rank (level ${GAME_MODE_MIN_LEVEL}). `
      + `You are level ${levelOf(user)} — ${remaining} to go. Keep going in the lessons.`;
  }
  return `โหมดเกมจะปลดล็อกเมื่อถึงระดับ${GAME_MODE_RANK_TH} (เลเวล ${GAME_MODE_MIN_LEVEL}) `
    + `ตอนนี้คุณอยู่เลเวล ${levelOf(user)} เหลืออีก ${remaining} เลเวล เรียนบทเรียนต่อได้เลย`;
};
