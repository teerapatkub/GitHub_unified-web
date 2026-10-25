// Browser-tab titles per route (Spec 0005 ticket 11, audit P2 #9). Every page
// used to be "Python Coder Game", the project's old name, so tabs, history and
// screen readers could not tell pages apart. Longest prefix wins.
const TITLES = [
  ['/matchmaking/history', 'ประวัติการเล่น Arcade', 'Arcade match history'],
  ['/matchmaking', 'Arcade', 'Arcade'],
  ['/competitive-arena', 'Competitive Arena', 'Competitive Arena'],
  ['/online', 'Competitive Arena', 'Competitive Arena'],
  ['/learn', 'บทเรียน', 'Lessons'],
  ['/lesson', 'บทเรียน', 'Lesson'],
  ['/exercise', 'แบบฝึกหัด', 'Exercise'],
  ['/mini-game', 'มินิเกม', 'Mini-game'],
  ['/debug', 'ฝึกแก้บั๊ก', 'Debug practice'],
  ['/challenge', 'ความท้าทาย', 'Challenge'],
  ['/promotion-exam', 'สอบเลื่อนขั้น', 'Promotion exam'],
  ['/profile', 'โปรไฟล์', 'Profile'],
  ['/achievements', 'ความสำเร็จ', 'Achievements'],
  ['/leaderboard', 'ตารางอันดับ', 'Leaderboard'],
  ['/shop', 'ร้านค้า', 'Shop'],
  ['/login', 'เข้าสู่ระบบ', 'Sign in'],
  ['/admin', 'ผู้ดูแลระบบ', 'Admin'],
];

export const SITE_NAME = 'PyArena';

export function titleForPath(pathname, lang) {
  const path = String(pathname || '/');
  const match = TITLES
    .filter(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];
  if (!match) return SITE_NAME;
  return `${lang === 'en' ? match[2] : match[1]} · ${SITE_NAME}`;
}
