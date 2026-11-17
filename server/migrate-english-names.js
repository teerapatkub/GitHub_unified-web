// English names for content that was stored only in Thai (fix list item
// 16.10, UI review 2026-11-18). English mode showed Thai chapter and lesson
// titles, cosmetic names and achievements because those tables had no English
// column. Problems already carry title_en/desc_en and are not touched here.
//
// Columns added (all nullable; a missing English value falls back to Thai on
// the client, client/src/utils/problemText.js pickLocalized):
//   modules.title_en, modules.description_en
//   lessons.title_en, lessons.description_en
//   shop_items.name_en, shop_items.description_en
//   shop_sets.description_en            (name_en already exists)
//   achievements.name_en, achievements.description_en
//
// Rows are matched by what identifies them on every database rather than by
// serial ids, which differ between a fresh seed and production:
//   modules / lessons - their Thai title as seeded
//   shop items        - item_type + Thai name
//   shop sets         - set_key
//   achievements      - code
// A row whose Thai text was edited by an administrator simply gets no English
// and keeps showing Thai. English already written is never overwritten, so an
// administrator's own translation wins. Python terms (print(), input(), range,
// try...except, ...) are kept as they are.

const MODULES = [
  ['เริ่มต้นรู้จักกับภาษาไพธอน', 'Getting Started with Python'],
  ['ตัวแปรและการจัดการข้อมูล', 'Variables and Data'],
  ['นิพจน์และตัวดำเนินการ', 'Expressions and Operators'],
  ['การควบคุมทิศทางและการทำงานซ้ำ', 'Control Flow and Loops'],
  ['การใช้งานฟังก์ชัน', 'Functions'],
  ['โมดูลและแพ็กเกจ', 'Modules and Packages'],
  ['การจัดการข้อผิดพลาด', 'Error Handling'],
  ['การจัดการแฟ้มข้อมูล', 'Working with Files'],
  ['การเขียนโปรแกรมเชิงวัตถุ', 'Object-Oriented Programming'],
];

const LESSONS = [
  ['ทำความรู้จักและโครงสร้างการเขียนโปรแกรมภาษาไพธอน', 'Meet Python and the Structure of a Program'],
  ['ไวยากรณ์พื้นฐาน และคำสั่งแสดงผล print()', 'Basic Syntax and Output with print()'],
  ['คำสั่งรับค่า input() และการแปลงชนิดข้อมูล', 'Reading Input with input() and Type Conversion'],
  ['การจัดรูปแบบสายอักขระ ตัวเลข และคำสั่ง help()', 'Formatting Strings and Numbers, and help()'],
  ['หลักการตั้งชื่อตัวแปร การใช้งานตัวแปร และคำสงวน', 'Naming and Using Variables, and Reserved Keywords'],
  ['ชนิดข้อมูลพื้นฐาน (Numbers & Strings)', 'Basic Data Types (Numbers & Strings)'],
  ['ชนิดข้อมูลเชิงประกอบ (List, Tuple, Dictionary, Set)', 'Compound Data Types (List, Tuple, Dictionary, Set)'],
  ['ตัวดำเนินการคำนวณ เปรียบเทียบ กำหนดค่า และตรรกศาสตร์', 'Arithmetic, Comparison, Assignment and Logical Operators'],
  ['ตัวดำเนินการระดับบิต สมาชิก (in) และเอกลักษณ์ (is)', 'Bitwise, Membership (in) and Identity (is) Operators'],
  ['ลำดับความสำคัญของตัวดำเนินการ', 'Operator Precedence'],
  ['การควบคุมทิศทางแบบเลือกทำ (if, else, elif, nested if)', 'Making Decisions (if, else, elif, nested if)'],
  ['การทำงานซ้ำด้วย While loop และ For loop (พร้อม range)', 'Repetition with While Loops and For Loops (with range)'],
  ['คำสั่งควบคุมลูป (break, continue, pass) และลูปซ้อนลูป', 'Loop Control (break, continue, pass) and Nested Loops'],
  ['พื้นฐานการสร้าง เรียกใช้ และประโยชน์ของฟังก์ชัน', 'Function Basics: Defining, Calling and Why They Help'],
  ['การส่งผ่านอาร์กิวเมนต์ประเภทต่าง ๆ และ Anonymous/Lambda Function', 'Kinds of Arguments and Anonymous/Lambda Functions'],
  ['การส่งค่ากลับ (return) ขอบเขตตัวแปร (Scope) และ Recursion', 'Return Values (return), Variable Scope and Recursion'],
  ['การใช้งานโมดูล และคำสั่งนำเข้า (import / from...import)', 'Using Modules and Imports (import / from...import)'],
  ['ตำแหน่งการโหลดโมดูล (PYTHONPATH) และการสร้างแพ็กเกจ (Packages)', 'Where Modules Load From (PYTHONPATH) and Creating Packages'],
  ['ทำความรู้จักและจัดการข้อผิดพลาด (Exception Handling / try...except)', 'Understanding and Handling Errors (Exception Handling / try...except)'],
  ['การสร้าง Exception เอง (raise) และการตรวจสอบสมมติฐาน (Assertions)', 'Raising Your Own Exceptions (raise) and Assertions'],
  ['การเปิด-ปิด และอ่าน-เขียนข้อมูลในไฟล์ (File Handling)', 'Opening, Closing, Reading and Writing Files (File Handling)'],
  ['การใช้คำสั่ง with ร่วมกับไฟล์ และการจัดการโฟลเดอร์/ไดเรกทอรี', 'Using with for Files, and Managing Folders/Directories'],
  ['แนวคิด OOP การสร้างคลาส (Class) และวัตถุ (Instance)', 'OOP Concepts: Creating Classes (Class) and Objects (Instance)'],
  ['การสืบทอดคุณสมบัติ (Inheritance) และ Overriding / Overloading', 'Inheritance, Overriding and Overloading'],
];

// [item_type, Thai name, English name, English description]. A null
// description is left empty: the free Heart cursor has no Thai description, and
// an English one alone would show through in Thai mode too (the fallback goes
// both ways).
const SHOP_ITEMS = [
  ['MOUSE_EFFECT', 'Heart', 'Heart', null],
  ['THEME', 'ธีมซากุระ', 'Sakura Theme', 'Turns the background and colours of the whole site into a pink sakura garden'],
  ['PROFILE_FRAME', 'กรอบกลีบซากุระ', 'Sakura Petal Frame', 'A pink round frame decorated with sakura blossoms and branches'],
  ['MOUSE_EFFECT', 'กลีบซากุระปลิว', 'Drifting Sakura Petals', 'Clicks scatter sakura petals that flutter and slowly fall. Double-click for a blossom that opens and spins its petals out in a spiral'],
  ['THEME', 'ธีมอวกาศ', 'Space Theme', 'Turns the background and colours of the whole site into pastel-purple outer space'],
  ['PROFILE_FRAME', 'กรอบดาวเคราะห์', 'Planet Frame', 'An orbit frame fading from purple to blue, with planets and stars'],
  ['MOUSE_EFFECT', 'ฝุ่นดาว', 'Stardust', 'Clicks scatter colourful stars and send shooting stars flying. Double-click for a planet with a moon in orbit'],
  ['THEME', 'ธีมพิกเซลอาร์ต', 'Pixel Art Theme', 'Turns the background of the whole site into an 8-bit game scene with pixel clouds, grass and mystery boxes'],
  ['PROFILE_FRAME', 'กรอบบล็อกพิกเซล', 'Pixel Block Frame', 'A square grid-block frame with stepped corners, decorated with hearts and coins'],
  ['MOUSE_EFFECT', 'หัวใจพิกเซล', 'Pixel Hearts', 'Clicks pop up 8-bit hearts, coins, stars and gems with points. Double-click for LEVEL UP!'],
  ['THEME', 'ธีมไซเบอร์', 'Cyber Theme', 'Turns the background of the whole site into a neon circuit board with pink and blue signal traces on a light base'],
  ['PROFILE_FRAME', 'กรอบวงจรนีออน', 'Neon Circuit Frame', 'A segmented round frame with solder points and HUD-style targeting corners'],
  ['MOUSE_EFFECT', 'ประกายไฟฟ้า', 'Electric Sparks', 'Clicks send lightning around the cursor with 0s and 1s scattering. Double-click for a hexagonal scanner that locks on and discharges'],
  ['THEME', 'ธีมเมืองมอนสเตอร์', 'Monster Town Theme', 'Tiny monsters peek out from the edges of the screen now and then, with glowing specks floating about'],
  ['PROFILE_FRAME', 'กรอบมอนสเตอร์กะพริบตา', 'Blinking Monster Frame', 'A purple round frame with horns, big blinking eyes and tiny fangs'],
  ['MOUSE_EFFECT', 'มอนสเตอร์โผล่', 'Monster Pop-up', 'Every click pops out a monster with a new face, never the same twice. Double-click and they come as a parade'],
  ['THEME', 'ธีมป่าใบไม้ร่วง', 'Autumn Forest Theme', 'Leaves keep falling, and every half minute a gust of wind blows them across the screen'],
  ['PROFILE_FRAME', 'กรอบเถาวัลย์', 'Vine Frame', 'Green vines wrapped around the picture, with leaves swaying in the wind, mushrooms and wildflowers'],
  ['MOUSE_EFFECT', 'ใบไม้ปลิว', 'Blowing Leaves', 'Clicks spin out leaves of many colours that slowly drift down. Double-click for a whirlwind'],
  ['THEME', 'ธีมหน้าหนาว', 'Winter Theme', 'Snowmen, pine trees and a wooden cabin, with light snowfall and a small blizzard passing now and then'],
  ['PROFILE_FRAME', 'กรอบเกล็ดหิมะ', 'Snowflake Frame', 'An icy blue frame with slowly turning snowflakes and snow settled on the top edge'],
  ['MOUSE_EFFECT', 'หิมะโปรยปราย', 'Snow Flurry', 'Clicks throw snowflakes up that drift slowly down with a cold sparkle. Double-click for a ring of snowstorm'],
  ['THEME', 'ธีมใต้ทะเลลึก', 'Deep Sea Theme', 'Coral, swaying seaweed, bubbles always rising and schools of fish swimming across now and then'],
  ['PROFILE_FRAME', 'กรอบปะการังและเปลือกหอย', 'Coral and Shell Frame', 'A sea-blue frame decorated with coral, shells, a starfish and rising bubbles'],
  ['MOUSE_EFFECT', 'ฟองอากาศแตก', 'Popping Bubbles', 'Clicks make a ripple and bubbles that float up and pop. Double-click and fish dart out'],
  ['THEME', 'ธีมเทศกาลโคมลอย', 'Lantern Festival Theme', 'An orange-purple evening sky with lanterns always rising and a big fireworks show now and then'],
  ['PROFILE_FRAME', 'กรอบโคมทอง', 'Golden Lantern Frame', 'A gold frame with Thai patterns, hanging lanterns swaying and twinkling sparks'],
  ['MOUSE_EFFECT', 'พลุเฉลิมฉลอง', 'Celebration Fireworks', 'Clicks burst into sparks of many colours with a twinkle. Double-click for a two-layer heart firework'],
  ['MOUSE_EFFECT', 'ดาวตก', 'Shooting Star', 'The cursor leaves a shooting-star trail behind the mouse'],
  ['PROFILE_PICTURE', 'แมวส้ม', 'Orange Cat', 'A friendly-looking orange cat profile picture'],
  ['PROFILE_PICTURE', 'หุ่นยนต์', 'Robot', 'A robot profile picture with glowing eyes'],
  ['PROFILE_PICTURE', 'นักบินอวกาศ', 'Astronaut', 'An astronaut among the stars profile picture'],
  ['PROFILE_PICTURE', 'แชมป์สนาม', 'Arena Champion', 'A champion profile picture. Only from an achievement; cannot be bought'],
  ['PROFILE_PICTURE', 'บัณฑิตไพธอน', 'Python Graduate', 'A graduate profile picture. Only from an achievement; cannot be bought'],
  ['PROFILE_FRAME', 'กรอบทองแดง Lv.25', 'Bronze Frame Lv.25', 'A bronze frame with a number 25 shield. Level 25 reward only; cannot be bought'],
  ['PROFILE_FRAME', 'กรอบเงิน Lv.50', 'Silver Frame Lv.50', 'A silver frame with wings and light running around the ring. Level 50 reward only; cannot be bought'],
  ['PROFILE_FRAME', 'กรอบทอง Lv.75', 'Gold Frame Lv.75', 'A gold frame with a crown and olive branches. Level 75 reward only; cannot be bought'],
  ['PROFILE_FRAME', 'กรอบเพชร Lv.100', 'Diamond Frame Lv.100', 'A spinning rainbow diamond frame with gems in orbit. Level 100 reward only; cannot be bought'],
  ['PROFILE_PICTURE', 'นักไพธอนครึ่งร้อย', 'Half-Century Pythonista', 'A python with a number 50 medal. Level 50 reward only; cannot be bought'],
  ['PROFILE_PICTURE', 'ปรมาจารย์ไพธอน', 'Python Grandmaster', 'A golden python wearing a crown. Level 100 reward only; cannot be bought'],
];

const SHOP_SETS = [
  ['space', 'A space web theme, a planet profile frame and a stardust cursor'],
  ['sakura', 'A sakura web theme, a sakura petal profile frame and a drifting petal cursor'],
  ['pixel', 'An 8-bit pixel web theme, a block profile frame and a pixel heart cursor'],
  ['cyber', 'A neon circuit web theme, a circuit profile frame and an electric spark cursor'],
  ['monster', 'A town of cute round monsters, a blinking monster frame, and a click effect whose monster keeps changing face'],
  ['forest', 'A forest where leaves always fall and the wind gusts now and then, a vine frame, and a blowing-leaves click effect'],
  ['winter', 'Snow falling now and then with snowmen in the background, a snowflake frame, and a snow flurry click effect'],
  ['ocean', 'An undersea world with rising bubbles and schools of fish passing by, a shell frame, and a bubble click effect'],
  ['lantern', 'An evening sky with lanterns slowly rising and fireworks now and then, a golden lantern frame, and a fireworks click effect'],
];

const SPECIAL = ' and get a special cosmetic that the shop does not sell';
// [code, English name, English description]
const ACHIEVEMENTS = [
  ['first_lesson', 'First Lesson Done', 'Finish your first lesson, with its post-lesson quiz and all of its exercises'],
  ['five_lessons', 'Five Lessons Down', 'Finish 5 lessons'],
  ['half_course', 'Halfway There', 'Finish half of the course (12 lessons)'],
  ['all_lessons', 'Course Complete', 'Finish every lesson in the course'],
  ['first_exercise', 'First Code Passed', 'Pass an exercise for the first time'],
  ['twenty_exercises', 'Hard Worker', 'Pass 20 exercises'],
  ['sixty_exercises', 'Dedicated Trainee', 'Pass 60 exercises'],
  ['first_perfect', 'First Perfect Score', 'Get full marks on a post-lesson quiz'],
  ['five_perfect', 'Five Perfect Scores', 'Get full marks on the post-lesson quiz of 5 lessons'],
  ['first_minigame', 'The Adventure Begins', 'Finish a story mini-game for the first time'],
  ['five_minigames', 'Adventurer', 'Finish 5 story mini-game stages'],
  ['first_arcade', 'Into the Arena', 'Finish one Arcade Battle Royale match'],
  ['ten_arcade', 'Arena Regular', 'Finish 10 Arcade matches'],
  ['first_win', 'First Win', 'Win an Arcade match for the first time'],
  ['ten_wins', 'Arena Champion', 'Win 10 Arcade matches'],
  ['perfect_round', 'Flawless Round', 'Pass every test case in one Arcade round'],
  ['streak_seven', 'Seven-Day Streak', 'Earn XP seven days in a row'],
  ['level_ten', 'Level 10', 'Reach level 10'],
  ['first_cosmetic', 'First Makeover', 'Buy your first cosmetic from the shop'],
  ['full_set', 'Complete Set', 'Own every piece of any one theme set'],
  ['level_twenty', 'Level 20', 'Reach level 20'],
  ['level_twentyfive', 'Bronze Perseverance', `Reach level 25${SPECIAL}`],
  ['level_thirty', 'Level 30', 'Reach level 30'],
  ['level_forty', 'Level 40', 'Reach level 40'],
  ['level_fifty', 'Halfway to 100', `Reach level 50${SPECIAL}`],
  ['level_sixty', 'Level 60', 'Reach level 60'],
  ['level_seventy', 'Level 70', 'Reach level 70'],
  ['level_seventyfive', 'Golden Crown', `Reach level 75${SPECIAL}`],
  ['level_eighty', 'Level 80', 'Reach level 80'],
  ['level_ninety', 'Level 90', 'Reach level 90'],
  ['level_hundred', 'Python Grandmaster', `Reach level 100${SPECIAL}`],
];

const COLUMNS = [
  ['modules', 'title_en', 'VARCHAR(255)'],
  ['modules', 'description_en', 'TEXT'],
  ['lessons', 'title_en', 'VARCHAR(255)'],
  ['lessons', 'description_en', 'TEXT'],
  ['shop_items', 'name_en', 'VARCHAR(255)'],
  ['shop_items', 'description_en', 'TEXT'],
  ['shop_sets', 'description_en', 'TEXT'],
  ['achievements', 'name_en', 'VARCHAR(255)'],
  ['achievements', 'description_en', 'TEXT'],
];

// Only fills a value that is still empty: an administrator's English wins.
const blank = (column) => `(${column} IS NULL OR ${column} = '')`;

async function migrateEnglishNames(db) {
  // Table and column names come from the constant list above, never from input.
  for (const [table, column, type] of COLUMNS) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
  }
  for (const [th, en] of MODULES) {
    await db.query(`UPDATE modules SET title_en = ? WHERE title = ? AND ${blank('title_en')}`, [en, th]);
  }
  for (const [th, en] of LESSONS) {
    await db.query(`UPDATE lessons SET title_en = ? WHERE title = ? AND ${blank('title_en')}`, [en, th]);
  }
  for (const [type, th, name, description] of SHOP_ITEMS) {
    await db.query(
      `UPDATE shop_items SET name_en = ? WHERE item_type = ? AND name = ? AND ${blank('name_en')}`,
      [name, type, th],
    );
    if (description) {
      await db.query(
        `UPDATE shop_items SET description_en = ? WHERE item_type = ? AND name = ? AND ${blank('description_en')}`,
        [description, type, th],
      );
    }
  }
  for (const [setKey, description] of SHOP_SETS) {
    await db.query(
      `UPDATE shop_sets SET description_en = ? WHERE set_key = ? AND ${blank('description_en')}`,
      [description, setKey],
    );
  }
  for (const [code, name, description] of ACHIEVEMENTS) {
    await db.query(`UPDATE achievements SET name_en = ? WHERE code = ? AND ${blank('name_en')}`, [name, code]);
    await db.query(
      `UPDATE achievements SET description_en = ? WHERE code = ? AND ${blank('description_en')}`,
      [description, code],
    );
  }
}

module.exports = {
  migrateEnglishNames,
  MODULES,
  LESSONS,
  SHOP_ITEMS,
  SHOP_SETS,
  ACHIEVEMENTS,
};
