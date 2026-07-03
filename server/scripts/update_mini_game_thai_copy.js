const db = require('../db');

const normalizeLessonTitle = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const buildThaiMiniGameSeeds = (lesson) => {
  const title = normalizeLessonTitle(lesson?.title);
  const displayTitle = lesson?.title || 'บทเรียนนี้';

  if (title.includes('comment')) {
    return [
      {
        title: 'Mini 1: อธิบายโค้ดด้วยคอมเมนต์',
        description: 'เพิ่มคอมเมนต์ด้วยเครื่องหมาย # 1 บรรทัด แล้วแสดงข้อความ "อ่านโค้ดง่ายขึ้น"',
        code: '# อธิบายว่าโค้ดบรรทัดนี้ทำอะไร\nprint("อ่านโค้ดง่ายขึ้น")',
        tests: [{ input: '', expected: 'อ่านโค้ดง่ายขึ้น' }],
      },
      {
        title: 'Mini 2: ปิดโค้ดทดลองด้วยคอมเมนต์',
        description: 'ใช้ # ปิดบรรทัด print("debug") แล้วให้โปรแกรมแสดงเฉพาะ "พร้อมส่งงาน"',
        code: '# print("debug")\nprint("พร้อมส่งงาน")',
        tests: [{ input: '', expected: 'พร้อมส่งงาน' }],
      },
      {
        title: 'Mini 3: โน้ตขั้นตอนก่อนรัน',
        description: 'เขียนคอมเมนต์บอกขั้นตอนสั้น ๆ แล้วแสดงข้อความ "โค้ดนี้มีคำอธิบาย"',
        code: '# ขั้นตอนที่ 1: เตรียมข้อความ\nprint("โค้ดนี้มีคำอธิบาย")',
        tests: [{ input: '', expected: 'โค้ดนี้มีคำอธิบาย' }],
      },
    ];
  }

  if (title.includes('input') || title.includes('รับ')) {
    return [
      {
        title: 'Mini 1: รับชื่อผู้เล่น',
        description: 'รับชื่อจากผู้ใช้ 1 ค่า แล้วแสดงคำทักทายในรูปแบบ "สวัสดี <ชื่อ>"',
        code: 'name = input("ชื่อของคุณ: ")\nprint("สวัสดี", name)',
        tests: [
          { input: 'Lumi', expected: 'สวัสดี Lumi' },
          { input: 'PySim', expected: 'สวัสดี PySim' },
        ],
      },
      {
        title: 'Mini 2: รับของโปรด',
        description: 'รับชื่ออาหาร 1 ค่า แล้วแสดงข้อความในรูปแบบ "ฉันชอบ <อาหาร>"',
        code: 'food = input("อาหารที่ชอบ: ")\nprint("ฉันชอบ", food)',
        tests: [
          { input: 'ราเมง', expected: 'ฉันชอบ ราเมง' },
          { input: 'ข้าวผัด', expected: 'ฉันชอบ ข้าวผัด' },
        ],
      },
      {
        title: 'Mini 3: รับตัวเลขแล้วสะท้อนผล',
        description: 'รับตัวเลข 1 ค่า แล้วแสดงข้อความในรูปแบบ "เลขที่เลือกคือ <ตัวเลข>"',
        code: 'number = input("เลือกเลข: ")\nprint("เลขที่เลือกคือ", number)',
        tests: [
          { input: '7', expected: 'เลขที่เลือกคือ 7' },
          { input: '21', expected: 'เลขที่เลือกคือ 21' },
        ],
      },
    ];
  }

  if (title.includes('ตัวแปร') || title.includes('variable')) {
    return [
      {
        title: 'Mini 1: เก็บชื่อคอร์ส',
        description: 'สร้างตัวแปร course เก็บคำว่า "Python" แล้วแสดงค่าตัวแปรออกทางหน้าจอ',
        code: 'course = "Python"\nprint(course)',
        tests: [{ input: '', expected: 'Python' }],
      },
      {
        title: 'Mini 2: คำนวณคะแนนรวม',
        description: 'สร้างตัวแปร score มีค่า 40 แล้วเพิ่มอีก 10 จากนั้นแสดงผลรวม',
        code: 'score = 40\nscore = score + 10\nprint(score)',
        tests: [{ input: '', expected: '50' }],
      },
      {
        title: 'Mini 3: รวมข้อความจากตัวแปร',
        description: 'สร้างตัวแปร first และ last แล้วแสดงข้อความ "Lumi Python"',
        code: 'first = "Lumi"\nlast = "Python"\nprint(first, last)',
        tests: [{ input: '', expected: 'Lumi Python' }],
      },
    ];
  }

  if (title.includes('type conversion') || title.includes('conversion') || title.includes('ชนิดข้อมูล')) {
    return [
      {
        title: 'Mini 1: แปลงข้อความเป็นจำนวนเต็ม',
        description: 'รับตัวเลข 2 ค่า แปลงด้วย int() แล้วแสดงผลรวม',
        code: 'a = int(input())\nb = int(input())\nprint(a + b)',
        tests: [
          { input: '2\n3', expected: '5' },
          { input: '10\n5', expected: '15' },
        ],
      },
      {
        title: 'Mini 2: แปลงเป็นทศนิยม',
        description: 'รับราคา 1 ค่า แปลงด้วย float() แล้วแสดงราคาหลังบวก 10',
        code: 'price = float(input())\nprint(price + 10)',
        tests: [
          { input: '20', expected_any: ['30.0', '30'] },
          { input: '5.5', expected: '15.5' },
        ],
      },
      {
        title: 'Mini 3: แปลงตัวเลขเป็นข้อความ',
        description: 'กำหนด age = 15 แล้วใช้ str() เพื่อแสดงข้อความ "อายุ 15"',
        code: 'age = 15\nprint("อายุ " + str(age))',
        tests: [{ input: '', expected: 'อายุ 15' }],
      },
    ];
  }

  if (title.includes('if') || title.includes('else') || title.includes('เงื่อนไข')) {
    return [
      {
        title: 'Mini 1: ตรวจคะแนนผ่าน',
        description: 'รับคะแนน 1 ค่า ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง "ผ่าน" ไม่เช่นนั้นให้แสดง "ไม่ผ่าน"',
        code: 'score = int(input())\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")',
        tests: [
          { input: '80', expected: 'ผ่าน' },
          { input: '40', expected: 'ไม่ผ่าน' },
        ],
      },
      {
        title: 'Mini 2: เลขคู่หรือเลขคี่',
        description: 'รับจำนวนเต็ม 1 ค่า ถ้าหาร 2 ลงตัวให้แสดง "เลขคู่" ไม่เช่นนั้นให้แสดง "เลขคี่"',
        code: 'number = int(input())\nif number % 2 == 0:\n    print("เลขคู่")\nelse:\n    print("เลขคี่")',
        tests: [
          { input: '8', expected: 'เลขคู่' },
          { input: '9', expected: 'เลขคี่' },
        ],
      },
      {
        title: 'Mini 3: ส่วนลดสมาชิก',
        description: 'รับคำว่า yes หรือ no ถ้าเป็น yes ให้แสดง "ได้ส่วนลด" ถ้าไม่ใช่ให้แสดง "ราคาปกติ"',
        code: 'member = input()\nif member == "yes":\n    print("ได้ส่วนลด")\nelse:\n    print("ราคาปกติ")',
        tests: [
          { input: 'yes', expected: 'ได้ส่วนลด' },
          { input: 'no', expected: 'ราคาปกติ' },
        ],
      },
    ];
  }

  if (title.includes('for loop') || title.includes('while loop') || title.includes('loop')) {
    return [
      {
        title: 'Mini 1: นับเลขตามจำนวน',
        description: 'รับ n แล้วแสดงเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
        code: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
        tests: [
          { input: '3', expected: '1 2 3' },
          { input: '1', expected: '1' },
        ],
      },
      {
        title: 'Mini 2: รวมเลขด้วยลูป',
        description: 'รับ n แล้วหาผลรวมตั้งแต่ 1 ถึง n จากนั้นแสดงผลรวม',
        code: 'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)',
        tests: [
          { input: '4', expected: '10' },
          { input: '5', expected: '15' },
        ],
      },
      {
        title: 'Mini 3: พิมพ์คำซ้ำ',
        description: 'รับจำนวนครั้ง แล้วแสดงคำว่า "Python" ตามจำนวนนั้น',
        code: 'count = int(input())\nfor i in range(count):\n    print("Python")',
        tests: [
          { input: '2', expected: 'Python Python' },
          { input: '1', expected: 'Python' },
        ],
      },
    ];
  }

  return [
    {
      title: `Mini 1: เริ่มโจทย์ ${displayTitle}`,
      description: `เขียนโปรแกรม Python แสดงข้อความ "พร้อมเรียน ${displayTitle}"`,
      code: `print("พร้อมเรียน ${displayTitle}")`,
      tests: [{ input: '', expected: `พร้อมเรียน ${displayTitle}` }],
    },
    {
      title: `Mini 2: ทบทวน ${displayTitle}`,
      description: 'สร้างตัวแปร status เก็บคำว่า "เข้าใจแล้ว" แล้วแสดงผล',
      code: 'status = "เข้าใจแล้ว"\nprint(status)',
      tests: [{ input: '', expected: 'เข้าใจแล้ว' }],
    },
    {
      title: `Mini 3: ปิดท้าย ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านมินิเกมแล้ว" เพื่อจบบทนี้',
      code: 'print("ผ่านมินิเกมแล้ว")',
      tests: [{ input: '', expected: 'ผ่านมินิเกมแล้ว' }],
    },
  ];
};

const main = async () => {
  const [lessons] = await db.execute('SELECT lesson_id, title FROM lessons ORDER BY lesson_id');
  let updated = 0;

  for (const lesson of lessons) {
    const seeds = buildThaiMiniGameSeeds(lesson);

    for (let index = 0; index < seeds.length; index += 1) {
      const exerciseOrder = String(index + 1);
      const seed = seeds[index];
      const [rows] = await db.execute(
        `SELECT exercise_id
         FROM mini_game_exercises
         WHERE lesson_id = ?
           AND exercise_order = ?
           AND is_active = 1
         ORDER BY exercise_id
         LIMIT 1`,
        [lesson.lesson_id, exerciseOrder]
      );

      if (rows.length === 0) continue;

      const exerciseId = rows[0].exercise_id;
      await db.execute(
        `UPDATE mini_game_exercises
         SET title = ?,
             description = ?,
             starter_code = ?,
             solution_code = ?,
             test_cases_json = ?
         WHERE exercise_id = ?`,
        [
          seed.title,
          seed.description,
          seed.code,
          seed.code,
          JSON.stringify(seed.tests),
          exerciseId,
        ]
      );

      await db.execute(
        `UPDATE mini_game_dialogues
         SET dialogue_text = ?
         WHERE exercise_id = ?
           AND dialogue_order = 0`,
        [`โจทย์ที่ ${exerciseOrder}: ${seed.title} อ่านคำใบ้แล้วเติมโค้ดให้ผ่านนะคะ`, exerciseId]
      );

      await db.execute(
        `UPDATE mini_game_dialogues
         SET dialogue_text = ?
         WHERE exercise_id = ?
           AND dialogue_order = 1`,
        [seed.description, exerciseId]
      );

      updated += 1;
    }
  }

  console.log(`Updated Thai mini game copy for ${updated} exercises.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    process.exit();
  });
