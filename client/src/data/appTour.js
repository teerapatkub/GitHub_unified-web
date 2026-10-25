// First-run tours led by Lumi (components/tour/GuidedTour.jsx).
//
// Each step points at elements marked `data-tour="..."`; a step whose element
// is not on screen is skipped. Text is { th, en } or a function of the
// player, so a step can say something different to a locked beginner and to
// a player who is already allowed into the competitive modes.
//
// Whether a tour has been seen lives on the account (server/tutorials.js).
import { GAME_MODE_MIN_LEVEL, canEnterGameModes } from '../utils/gameModeAccess.js';

const sel = (name) => `[data-tour="${name}"]`;

export const appTours = {
  'app-overview': {
    steps: [
      {
        id: 'welcome',
        lumi: 'happy',
        title: { th: 'ยินดีต้อนรับสู่ PyArena!', en: 'Welcome to PyArena!' },
        body: {
          th: 'สวัสดี ฉันชื่อ Lumi เดี๋ยวพาดูว่าปุ่มแต่ละอันบนแถบด้านบนใช้ทำอะไร ใช้เวลาไม่ถึงนาที',
          en: "Hi, I'm Lumi! Let me show you what each button on the top bar does. It takes less than a minute.",
        },
      },
      {
        id: 'learn',
        target: [sel('nav-brand'), sel('nav-learn')],
        lumi: 'smile',
        title: { th: 'บทเรียน', en: 'Lessons' },
        body: {
          th: 'จุดเริ่มต้นของทุกคน เรียน Python ทีละบท ทำแบบฝึกหัดเพื่อรับ XP และเหรียญ กดโลโก้เมื่อไรก็กลับมาที่นี่',
          en: 'Where everyone starts. Learn Python one lesson at a time and earn XP and coins from exercises. The logo always brings you back here.',
        },
      },
      {
        id: 'game-modes',
        target: [sel('nav-competitive'), sel('nav-arcade')],
        lumi: (user) => (canEnterGameModes(user) ? 'happy' : 'neutral'),
        title: { th: 'โหมดแข่งขัน', en: 'Competitive modes' },
        body: (user) => (canEnterGameModes(user)
          ? {
            th: 'Competitive และ Arcade คือโหมดแข่งกับผู้เล่นคนอื่น คุณเข้าได้แล้ว กดเข้าไปดูได้เลย แล้วฉันจะพาแนะนำตอนเข้าครั้งแรก',
            en: "Competitive and Arcade are where you play against other people. They are open to you, so go in any time and I'll show you around on your first visit.",
          }
          : {
            th: `Competitive และ Arcade คือโหมดแข่งกับผู้เล่นคนอื่น ปลดล็อกที่ LV. ${GAME_MODE_MIN_LEVEL} เรียนเก็บเลเวลไปก่อนนะ`,
            en: `Competitive and Arcade are where you play against other people. They unlock at LV. ${GAME_MODE_MIN_LEVEL}, so keep learning for now.`,
          }),
      },
      {
        id: 'coins',
        target: sel('coins'),
        lumi: 'smile',
        title: { th: 'เหรียญ', en: 'Coins' },
        body: {
          th: 'เหรียญที่คุณมีอยู่ ได้จากการทำแบบฝึกหัด ความสำเร็จ และการแข่ง นำไปแลกของตกแต่งในร้านค้าได้',
          en: 'Your coins. You earn them from exercises, achievements and matches, and spend them in the shop.',
        },
      },
      {
        id: 'shop',
        target: sel('shop'),
        lumi: 'happy',
        title: { th: 'ร้านค้าของตกแต่ง', en: 'Cosmetic shop' },
        body: {
          th: 'ใช้เหรียญซื้อธีม กรอบโปรไฟล์ เอฟเฟกต์เมาส์ และรูปโปรไฟล์ แต่งบัญชีให้เป็นสไตล์ของคุณ',
          en: 'Spend coins on themes, profile frames, cursor effects and profile pictures to make your account your own.',
        },
      },
      {
        id: 'leaderboard',
        target: sel('leaderboard'),
        lumi: 'smile',
        title: { th: 'ตารางอันดับ', en: 'Leaderboard' },
        body: {
          th: 'ดูว่าคุณอยู่อันดับเท่าไรเมื่อเทียบกับผู้เล่นคนอื่น',
          en: 'See where you rank against everyone else.',
        },
      },
      {
        id: 'profile',
        target: sel('profile'),
        lumi: 'neutral',
        title: { th: 'โปรไฟล์ของคุณ', en: 'Your profile' },
        body: {
          th: 'กดที่รูปเพื่อเปิดเมนู ดูโปรไฟล์ ความสำเร็จที่ปลดล็อก และออกจากระบบ เลเวลของคุณดูได้ในหน้าโปรไฟล์',
          en: 'Tap your picture to open the menu: your profile, the achievements you unlocked, and log out. Your level is on your profile page.',
        },
      },
      {
        id: 'language',
        target: sel('language'),
        lumi: 'smile',
        title: { th: 'เปลี่ยนภาษา', en: 'Language' },
        body: {
          th: 'สลับระหว่างภาษาไทยและภาษาอังกฤษ โจทย์ทุกข้อมีให้ทั้งสองภาษา',
          en: 'Switch between Thai and English. Every problem comes in both languages.',
        },
      },
      {
        id: 'help',
        target: sel('tour-help'),
        lumi: 'happy',
        title: { th: 'ลืมก็ไม่เป็นไร', en: 'Forgot something?' },
        body: {
          th: 'กดปุ่มนี้เมื่อไรก็ได้ ฉันจะพาดูหน้านั้นใหม่อีกรอบ ขอให้สนุกกับการเขียนโค้ดนะ!',
          en: 'Press this button any time and I will walk you through the page again. Have fun coding!',
        },
      },
    ],
  },

  'arcade-lobby': {
    steps: [
      {
        id: 'welcome',
        lumi: 'happy',
        title: { th: 'ยินดีต้อนรับสู่ Arcade!', en: 'Welcome to Arcade!' },
        body: {
          th: 'แข่งเขียนโค้ด 5 คน 4 รอบ ทุกรอบมีโจทย์ใหม่ คนที่คะแนนสะสมต่ำสุดจะตกรอบ ระหว่างรอบซื้อไอเทมไว้ป่วนคู่แข่งหรือป้องกันตัวได้',
          en: 'Five players, four rounds, a new problem each round. The lowest total scores get knocked out, and between rounds you can buy items to sabotage rivals or protect yourself.',
        },
      },
      {
        id: 'search',
        target: sel('arcade-search'),
        lumi: 'smile',
        title: { th: 'เข้าห้องเพื่อน', en: "Join a friend's room" },
        body: {
          th: 'ใส่รหัสห้องแบบ ARC-xxxx ที่เพื่อนส่งให้ เพื่อเข้าห้องนั้นทันที',
          en: 'Type the ARC-xxxx code a friend sent you to jump straight into their room.',
        },
      },
      {
        id: 'create',
        target: sel('arcade-create'),
        lumi: 'happy',
        title: { th: 'สร้างห้องเอง', en: 'Create a room' },
        body: {
          th: 'เป็นหัวห้อง เลือกความยาก ตั้งรหัสผ่าน และเพิ่มบอทให้ครบ 5 คนได้ ไม่ต้องรอเพื่อนก็เล่นได้',
          en: 'Host your own room: pick the difficulty, set a password, and fill empty seats with bots so you never have to wait.',
        },
      },
      {
        id: 'rooms',
        target: sel('arcade-rooms'),
        lumi: 'smile',
        title: { th: 'ห้องที่เปิดอยู่', en: 'Open rooms' },
        body: {
          th: 'ห้องสาธารณะที่ยังรับคนอยู่ ห้องที่มีรูปกุญแจต้องใช้รหัสผ่าน',
          en: 'Public rooms that still have seats. A padlock means the room needs a password.',
        },
      },
      {
        id: 'stats',
        target: sel('arcade-stats'),
        lumi: 'neutral',
        title: { th: 'สถิติและประวัติ', en: 'Stats and history' },
        body: {
          th: 'ผลงานรวมของคุณ ด้านล่างคือแมตช์ที่เคยเล่น กดดูโค้ดที่ส่งในแต่ละรอบย้อนหลังได้',
          en: 'Your career record. Below it are your past matches; open one to review the code you sent each round.',
        },
      },
      {
        id: 'glossary',
        target: sel('arcade-glossary'),
        lumi: 'shock',
        title: { th: 'คู่มือไอเทม', en: 'Item guide' },
        body: {
          th: 'สงสัยว่าไอคอนไอเทมแต่ละอันทำอะไร เช่น หมอกหมึก หรือแช่แข็งเวลา เปิดดูที่นี่ได้ตลอด แม้ระหว่างแข่ง',
          en: 'Wondering what an item icon does, like Ink Fog or Time Freeze? Look it up here any time, even mid-match.',
        },
      },
    ],
  },

  'competitive-feed': {
    steps: [
      {
        id: 'welcome',
        target: sel('competitive-intro'),
        lumi: 'happy',
        title: { th: 'ยินดีต้อนรับสู่ Competitive Arena!', en: 'Welcome to Competitive Arena!' },
        body: {
          th: 'เหมือนตลาดงานของนักพัฒนา ผู้เล่นโพสต์โจทย์พร้อมรางวัลและเวลาจำกัด ใครก็กดรับงานได้ คนที่แก้ได้ดีที่สุดก่อนหมดเวลาได้รางวัลไป',
          en: 'Think of it as a job board for developers. Players post a problem with a reward and a deadline, anyone can take the job, and the best solution before time runs out wins.',
        },
      },
      {
        id: 'scoring',
        target: sel('competitive-scoring'),
        lumi: 'neutral',
        title: { th: 'ตัดสินอย่างไร', en: 'How answers are judged' },
        body: {
          th: 'คำตอบถูกให้คะแนนตามสัดส่วนเหล่านี้ ไม่ใช่แค่ถูกหรือผิด',
          en: 'Answers are scored on these weighted parts, not just right or wrong.',
        },
      },
      {
        id: 'post',
        target: sel('competitive-post'),
        lumi: 'smile',
        title: { th: 'โพสต์โจทย์', en: 'Post a challenge' },
        body: {
          th: 'ตั้งโจทย์ของคุณเอง กำหนดรางวัล เวลา และเทสเคส ให้คนอื่นมาแข่งกันแก้',
          en: 'Write your own problem with a reward, a time limit and test cases, and let others compete to solve it.',
        },
      },
      {
        id: 'card',
        target: sel('competitive-card'),
        lumi: 'happy',
        title: { th: 'รับงาน', en: 'Take a job' },
        body: {
          th: 'แต่ละโพสต์บอกรางวัลและเวลาที่เหลือ กดรับงานแล้วเปิดตัวแก้โค้ดเพื่อเขียนคำตอบ',
          en: 'Each post shows its reward and time left. Take the job, then open the editor to write your answer.',
        },
      },
      {
        id: 'mailbox',
        target: sel('competitive-mailbox'),
        lumi: 'smile',
        title: { th: 'กล่องจดหมาย', en: 'Mailbox' },
        body: {
          th: 'ผลการแข่งและรางวัลจะส่งมาที่นี่ ตัวเลขสีแดงคือข้อความที่ยังไม่ได้อ่าน',
          en: 'Results and rewards arrive here. The red number is how many you have not read yet.',
        },
      },
    ],
  },
};

const pick = (value, user) => (typeof value === 'function' ? value(user) : value);

// The tour as this player and language should see it.
export function resolveTour(tourId, user, isThai) {
  const tour = appTours[tourId];
  if (!tour) return [];
  const lang = isThai ? 'th' : 'en';
  return tour.steps.map((step) => ({
    id: step.id,
    target: step.target,
    lumi: pick(step.lumi, user) || 'smile',
    title: pick(step.title, user)[lang],
    body: pick(step.body, user)[lang],
  }));
}

// Who gets a tour opened for them without asking: a signed-in learner who has
// finished the sign-up survey (level 0 means it is still running) and has
// not seen this tour on any device. Guests keep a per-browser record instead.
export function shouldAutoStartTour({ tourId, user, seenLocally = [] }) {
  if (!user || String(user.role || '').toLowerCase() === 'admin') return false;
  if (Number(user.level) <= 0) return false;
  const seen = user.isGuest ? seenLocally : (Array.isArray(user.tutorials_seen) ? user.tutorials_seen : null);
  // An account whose profile has not loaded yet has an unknown record: wait.
  if (!seen) return false;
  return !seen.includes(tourId);
}
