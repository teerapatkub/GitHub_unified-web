const db = require('../db');

const normalizeTitle = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const json = (value) => JSON.stringify(value);

const makeStart = ({ title, description, starterCode, tests, storyLines, branchHigh, branchLow }) => ({
  order: 'START',
  title,
  description,
  code: starterCode,
  tests: {
    expected_format: 'แสดงตัวเลขเพื่อเลือกเส้นทาง',
    rules: [
      { condition: 'float > 500', branch_key: '1A' },
      { condition: 'float <= 500', branch_key: '1B' },
    ],
    correctness: tests,
  },
  dialogues: [
    { order: 0, emotion: 'smile', text: storyLines[0] },
    { order: 1, emotion: 'neutral', text: storyLines[1] },
    { order: 2, emotion: 'anxious', text: storyLines[2] },
    { order: 3, emotion: 'smile', text: description },
    { order: 4, emotion: 'happy', phase: 'post_submit', branch: '1A', text: branchHigh },
    { order: 5, emotion: 'smile', phase: 'post_submit', branch: '1B', text: branchLow },
  ],
});

const makeLeaf = ({ order, title, description, starterCode, tests, intro, clearText, emotion = 'smile' }) => ({
  order,
  title,
  description,
  code: starterCode,
  tests: {
    expected_format: 'ทำโจทย์ให้ตรงผลลัพธ์',
    rules: [{ condition: 'value.length >= 0', branch_key: 'end' }],
    correctness: tests,
  },
  dialogues: [
    { order: 0, emotion, text: intro },
    { order: 1, emotion: 'neutral', text: description },
    { order: 2, emotion: 'happy', phase: 'post_submit', branch: 'end', text: clearText },
  ],
});

const buildSeeds = (lesson) => {
  const title = normalizeTitle(lesson.title);
  const displayTitle = lesson.title || 'บทเรียนนี้';

  if (title.includes('comment')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: สมุดโค้ดที่อ่านยาก',
        description: 'รับจำนวนบรรทัดโค้ดแล้วคำนวณคะแนนความซับซ้อน ถ้ามากกว่า 500 จะไปเส้นทาง 1A ถ้าน้อยกว่าหรือเท่ากับ 500 จะไปเส้นทาง 1B',
        starterCode: 'lines = int(input("จำนวนบรรทัดโค้ด: "))\n# คำนวณคะแนนความซับซ้อนของไฟล์\ncomplexity = lines * 120\nprint("คะแนนความซับซ้อน:", complexity)',
        tests: [
          { input: '3', expected: 'คะแนนความซับซ้อน: 360' },
          { input: '6', expected: 'คะแนนความซับซ้อน: 720' },
        ],
        storyLines: [
          'วันนี้ Lumi เจอสมุดโค้ดเก่าในห้องเรียน แต่แทบไม่มีใครอ่านออกเลยค่ะ',
          'ถ้าไฟล์ซับซ้อนมาก เราต้องเขียนคอมเมนต์ช่วยทีมรีวิว ถ้าไฟล์เล็ก เราจะเขียนโน้ตสรุปสั้น ๆ',
          'ลองใช้ comment และการคำนวณง่าย ๆ เพื่อบอกระบบว่าไฟล์นี้ควรไปทางไหนนะคะ',
        ],
        branchHigh: 'คะแนนเกิน 500 แล้วค่ะ ไฟล์นี้ซับซ้อนมาก เราจะไปเส้นทาง 1A เพื่อเขียนคอมเมนต์ช่วยทีมรีวิวกัน',
        branchLow: 'คะแนนไม่เกิน 500 ค่ะ ไฟล์นี้ยังพออ่านได้ เราจะไปเส้นทาง 1B เพื่อเขียนคอมเมนต์สรุปสั้น ๆ',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: คอมเมนต์ช่วยทีมรีวิว',
        description: 'เพิ่มคอมเมนต์อธิบายงานรีวิว 1 บรรทัด แล้วแสดงข้อความ "ส่งให้ทีมรีวิวแล้ว"',
        starterCode: '# อธิบายว่าไฟล์นี้ต้องให้ทีมช่วยตรวจ\nprint("ส่งให้ทีมรีวิวแล้ว")',
        tests: [{ input: '', expected: 'ส่งให้ทีมรีวิวแล้ว' }],
        intro: 'เส้นทาง 1A คือไฟล์ใหญ่ค่ะ คอมเมนต์ต้องช่วยให้เพื่อนในทีมเข้าใจทันที',
        clearText: 'ดีมากค่ะ คอมเมนต์แบบนี้ช่วยให้ทีมรีวิวไม่หลงทางแล้ว',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: คอมเมนต์สรุปสั้น',
        description: 'เพิ่มคอมเมนต์สรุปงาน 1 บรรทัด แล้วแสดงข้อความ "อ่านเองได้"',
        starterCode: '# สรุปว่าไฟล์นี้ยังอ่านและแก้เองได้\nprint("อ่านเองได้")',
        tests: [{ input: '', expected: 'อ่านเองได้' }],
        intro: 'เส้นทาง 1B คือไฟล์เล็กค่ะ เราใช้คอมเมนต์สั้น ๆ ให้ตัวเองกลับมาอ่านได้ง่ายขึ้น',
        clearText: 'เยี่ยมค่ะ คอมเมนต์สั้นแต่ช่วยให้โค้ดเป็นมิตรมากขึ้นแล้ว',
      }),
    ];
  }

  if (title.includes('input') || title.includes('รับ')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: ประตูห้องเรียนอัจฉริยะ',
        description: 'รับจำนวนผู้เข้าห้องเรียน แล้วคำนวณแต้มการเตรียมห้อง ถ้าแต้มมากกว่า 500 จะไปเส้นทาง 1A ถ้าน้อยกว่าหรือเท่ากับ 500 จะไปเส้นทาง 1B',
        starterCode: 'students = int(input("จำนวนนักเรียน: "))\nroom_points = students * 125\nprint("แต้มเตรียมห้อง:", room_points)',
        tests: [
          { input: '3', expected: 'แต้มเตรียมห้อง: 375' },
          { input: '5', expected: 'แต้มเตรียมห้อง: 625' },
        ],
        storyLines: [
          'ประตูห้องเรียนของ Lumi ต้องรู้จำนวนนักเรียนก่อนถึงจะจัดห้องถูกค่ะ',
          'ถ้าคนเยอะ เราต้องเปิดโหมดห้องใหญ่ ถ้าคนน้อย เราจะจัดโต๊ะกลุ่มเล็ก',
          'ใช้ input() รับจำนวนคน แล้วแสดงแต้มให้ระบบตัดสินเส้นทางนะคะ',
        ],
        branchHigh: 'แต้มเกิน 500 แล้วค่ะ นักเรียนมาเยอะ ไปเส้นทาง 1A เพื่อรับชื่อหัวหน้าห้องกัน',
        branchLow: 'แต้มไม่เกิน 500 ค่ะ เป็นกลุ่มเล็ก ไปเส้นทาง 1B เพื่อรับชื่อกลุ่มเรียนกัน',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: รับชื่อหัวหน้าห้อง',
        description: 'รับชื่อหัวหน้าห้อง 1 ค่า แล้วแสดง "หัวหน้าห้องคือ <ชื่อ>"',
        starterCode: 'leader = input("ชื่อหัวหน้าห้อง: ")\nprint("หัวหน้าห้องคือ", leader)',
        tests: [{ input: 'มะลิ', expected: 'หัวหน้าห้องคือ มะลิ' }],
        intro: 'คนเยอะต้องมีหัวหน้าห้องช่วยประสานงานค่ะ',
        clearText: 'รับชื่อเรียบร้อยแล้ว ห้องใหญ่พร้อมเริ่มเรียนค่ะ',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: รับชื่อกลุ่มเรียน',
        description: 'รับชื่อกลุ่ม 1 ค่า แล้วแสดง "กลุ่มนี้ชื่อ <ชื่อกลุ่ม>"',
        starterCode: 'group_name = input("ชื่อกลุ่ม: ")\nprint("กลุ่มนี้ชื่อ", group_name)',
        tests: [{ input: 'Python Mini', expected: 'กลุ่มนี้ชื่อ Python Mini' }],
        intro: 'กลุ่มเล็กต้องตั้งชื่อกลุ่มให้จำง่ายค่ะ',
        clearText: 'ชื่อกลุ่มน่ารักมากค่ะ ไปเรียนต่อกันได้เลย',
      }),
    ];
  }

  if (title.includes('variable') || title.includes('ตัวแปร')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: กล่องพลังงานของตัวแปร',
        description: 'สร้างตัวแปร base และรับ bonus จากผู้ใช้ แล้วแสดงพลังงานรวม ถ้ามากกว่า 500 จะไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 จะไป 1B',
        starterCode: 'base = 400\nbonus = int(input("โบนัสพลังงาน: "))\ntotal_power = base + bonus\nprint("พลังงานรวม:", total_power)',
        tests: [
          { input: '50', expected: 'พลังงานรวม: 450' },
          { input: '150', expected: 'พลังงานรวม: 550' },
        ],
        storyLines: [
          'Lumi มีกล่องพลังงานที่ต้องเก็บค่าด้วยตัวแปรค่ะ',
          'ถ้าพลังงานรวมสูงมาก เราจะเปิดโหมดทดลองขั้นสูง ถ้ายังไม่สูง เราจะฝึกจัดเก็บข้อมูลพื้นฐาน',
          'ใช้ตัวแปรช่วยเก็บ base, bonus และ total_power ให้ถูกต้องนะคะ',
        ],
        branchHigh: 'พลังงานเกิน 500 แล้วค่ะ ไปเส้นทาง 1A เพื่อจัดตัวแปรสำหรับโหมดขั้นสูง',
        branchLow: 'พลังงานยังไม่เกิน 500 ค่ะ ไปเส้นทาง 1B เพื่อจัดตัวแปรพื้นฐานให้เรียบร้อย',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: ตัวแปรโหมดขั้นสูง',
        description: 'สร้างตัวแปร mode เก็บคำว่า "advanced" แล้วแสดงค่าออกทางหน้าจอ',
        starterCode: 'mode = "advanced"\nprint(mode)',
        tests: [{ input: '', expected: 'advanced' }],
        intro: 'โหมดขั้นสูงต้องมีตัวแปร mode บอกสถานะให้ชัดเจนค่ะ',
        clearText: 'ตัวแปร mode พร้อมแล้วค่ะ ระบบรู้จักโหมดขั้นสูงแล้ว',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: ตัวแปรโหมดพื้นฐาน',
        description: 'สร้างตัวแปร mode เก็บคำว่า "basic" แล้วแสดงค่าออกทางหน้าจอ',
        starterCode: 'mode = "basic"\nprint(mode)',
        tests: [{ input: '', expected: 'basic' }],
        intro: 'โหมดพื้นฐานก็สำคัญค่ะ เราต้องเก็บสถานะให้ชัดเจนเหมือนกัน',
        clearText: 'ดีมากค่ะ ตัวแปร mode บอกสถานะพื้นฐานได้ถูกต้อง',
      }),
    ];
  }

  if (title.includes('conversion') || title.includes('ชนิดข้อมูล') || title.includes('data type')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: เครื่องแปลงค่าหน้าห้อง',
        description: 'รับราคาจากผู้ใช้เป็นข้อความ แปลงเป็น float แล้วคูณ 1.07 เพื่อหาราคารวมภาษี ถ้ามากกว่า 500 ไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 ไป 1B',
        starterCode: 'price = float(input("ราคาสินค้า: "))\nvat_total = price * 1.07\nprint("ราคารวมภาษี:", vat_total)',
        tests: [
          { input: '100', expected: 'ราคารวมภาษี: 107.0' },
          { input: '600', expected: 'ราคารวมภาษี: 642.0' },
        ],
        storyLines: [
          'เครื่องคิดเงินของ Lumi รับข้อมูลเข้ามาเป็นข้อความเสมอค่ะ',
          'เราต้องแปลงชนิดข้อมูลก่อนคำนวณ ไม่อย่างนั้นระบบจะบวกเลขไม่ได้ถูกต้อง',
          'ใช้ float() แปลงราคาแล้วคำนวณภาษีเพื่อเลือกเส้นทางนะคะ',
        ],
        branchHigh: 'ราคารวมภาษีเกิน 500 แล้วค่ะ ไปเส้นทาง 1A เพื่อจัดการตัวเลขทศนิยม',
        branchLow: 'ราคารวมภาษีไม่เกิน 500 ค่ะ ไปเส้นทาง 1B เพื่อแปลงตัวเลขเป็นข้อความรายงานผล',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: ปัดเศษราคาสูง',
        description: 'รับราคาทศนิยม 1 ค่า แปลงเป็น float แล้วแสดงราคาที่ปัดเป็นทศนิยม 2 ตำแหน่ง',
        starterCode: 'price = float(input("ราคา: "))\nprint(round(price, 2))',
        tests: [{ input: '123.456', expected: '123.46' }],
        intro: 'ยอดสูงต้องแสดงผลให้อ่านง่ายและไม่ยาวเกินไปค่ะ',
        clearText: 'ปัดเศษได้สวยมากค่ะ รายงานราคาพร้อมแล้ว',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: แปลงตัวเลขเป็นข้อความ',
        description: 'กำหนด total = 250 แล้วใช้ str() แสดงข้อความ "ยอดรวม 250"',
        starterCode: 'total = 250\nprint("ยอดรวม " + str(total))',
        tests: [{ input: '', expected: 'ยอดรวม 250' }],
        intro: 'ยอดไม่สูงมาก เราจะฝึกแปลงตัวเลขเป็นข้อความสำหรับรายงานค่ะ',
        clearText: 'เยี่ยมค่ะ str() ช่วยรวมข้อความกับตัวเลขได้ถูกต้องแล้ว',
      }),
    ];
  }

  if (title.includes('if') || title.includes('else')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: ประตูตรวจคะแนน',
        description: 'รับคะแนนภารกิจแล้วแสดงคะแนนออกมา ถ้ามากกว่า 500 ไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 ไป 1B',
        starterCode: 'score = int(input("คะแนนภารกิจ: "))\nprint("คะแนน:", score)',
        tests: [
          { input: '450', expected: 'คะแนน: 450' },
          { input: '650', expected: 'คะแนน: 650' },
        ],
        storyLines: [
          'หน้าประตูห้องเรียนมีระบบตรวจคะแนนภารกิจค่ะ',
          'ถ้าคะแนนสูง เราจะเข้าโหมดรางวัล ถ้าคะแนนยังไม่สูง เราจะเข้าโหมดฝึกเพิ่ม',
          'รับคะแนนแล้วแสดงออกมาให้ระบบใช้ if-else ต่อในเส้นทางถัดไปนะคะ',
        ],
        branchHigh: 'คะแนนเกิน 500 แล้วค่ะ ไปเส้นทาง 1A เพื่อเขียนเงื่อนไขโหมดรางวัล',
        branchLow: 'คะแนนยังไม่เกิน 500 ค่ะ ไปเส้นทาง 1B เพื่อเขียนเงื่อนไขโหมดฝึกเพิ่ม',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: เงื่อนไขรับรางวัล',
        description: 'รับคะแนน ถ้าคะแนนตั้งแต่ 80 ขึ้นไปให้แสดง "รับตราดาว" ไม่เช่นนั้นให้แสดง "รับเหรียญฝึกฝน"',
        starterCode: 'score = int(input("คะแนน: "))\nif score >= 80:\n    print("รับตราดาว")\nelse:\n    print("รับเหรียญฝึกฝน")',
        tests: [
          { input: '90', expected: 'รับตราดาว' },
          { input: '70', expected: 'รับเหรียญฝึกฝน' },
        ],
        intro: 'คะแนนสูงต้องมีระบบแยกรางวัลให้เหมาะสมค่ะ',
        clearText: 'เงื่อนไขรางวัลถูกต้องแล้วค่ะ',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: เงื่อนไขฝึกเพิ่ม',
        description: 'รับจำนวนครั้งที่ฝึก ถ้ามากกว่าหรือเท่ากับ 3 ให้แสดง "พร้อมสอบใหม่" ไม่เช่นนั้นให้แสดง "ฝึกต่ออีกนิด"',
        starterCode: 'practice = int(input("จำนวนครั้งที่ฝึก: "))\nif practice >= 3:\n    print("พร้อมสอบใหม่")\nelse:\n    print("ฝึกต่ออีกนิด")',
        tests: [
          { input: '3', expected: 'พร้อมสอบใหม่' },
          { input: '1', expected: 'ฝึกต่ออีกนิด' },
        ],
        intro: 'คะแนนยังไม่สูงไม่เป็นไรค่ะ เราใช้เงื่อนไขช่วยวางแผนฝึกเพิ่ม',
        clearText: 'ดีมากค่ะ เงื่อนไขช่วยให้รู้ว่าควรฝึกต่อหรือพร้อมสอบใหม่',
      }),
    ];
  }

  if (title.includes('loop')) {
    return [
      makeStart({
        title: 'จุดเริ่มต้น: เครื่องนับงานในห้องเรียน',
        description: 'รับจำนวนงาน แล้วใช้ loop รวมแต้มงานทีละ 120 คะแนน ถ้ารวมเกิน 500 ไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 ไป 1B',
        starterCode: 'tasks = int(input("จำนวนงาน: "))\ntotal = 0\nfor i in range(tasks):\n    total += 120\nprint("แต้มงานรวม:", total)',
        tests: [
          { input: '3', expected: 'แต้มงานรวม: 360' },
          { input: '5', expected: 'แต้มงานรวม: 600' },
        ],
        storyLines: [
          'Lumi ต้องนับงานที่กองอยู่บนโต๊ะทีละชิ้นค่ะ',
          'ถ้างานเยอะ เราจะใช้ loop ช่วยสรุปชุดใหญ่ ถ้างานน้อย เราจะใช้ loop ตรวจทีละรอบ',
          'ใช้ loop รวมแต้มงานเพื่อให้ระบบเลือกเส้นทางนะคะ',
        ],
        branchHigh: 'แต้มงานเกิน 500 แล้วค่ะ ไปเส้นทาง 1A เพื่อใช้ loop สรุปงานชุดใหญ่',
        branchLow: 'แต้มงานไม่เกิน 500 ค่ะ ไปเส้นทาง 1B เพื่อใช้ loop ตรวจงานทีละรอบ',
      }),
      makeLeaf({
        order: '1A',
        title: 'ทางแยก 1A: loop สรุปงานชุดใหญ่',
        description: 'รับ n แล้วใช้ for loop แสดงเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
        starterCode: 'n = int(input("จำนวนรอบ: "))\nfor i in range(1, n + 1):\n    print(i)',
        tests: [{ input: '3', expected: '1 2 3' }],
        intro: 'งานชุดใหญ่ต้องมี loop ช่วยนับเป็นลำดับค่ะ',
        clearText: 'นับครบแล้วค่ะ loop ทำงานถูกต้อง',
      }),
      makeLeaf({
        order: '1B',
        title: 'ทางแยก 1B: loop ตรวจงานทีละรอบ',
        description: 'รับ n แล้วใช้ while loop แสดงคำว่า "ตรวจแล้ว" n ครั้ง',
        starterCode: 'n = int(input("จำนวนงาน: "))\ncount = 0\nwhile count < n:\n    print("ตรวจแล้ว")\n    count += 1',
        tests: [{ input: '2', expected: 'ตรวจแล้ว ตรวจแล้ว' }],
        intro: 'งานไม่เยอะ เราลองใช้ while loop ตรวจทีละชิ้นกันค่ะ',
        clearText: 'ตรวจครบทุกชิ้นแล้วค่ะ while loop ผ่านเรียบร้อย',
      }),
    ];
  }

  return [
    makeStart({
      title: `จุดเริ่มต้น: ภารกิจ ${displayTitle}`,
      description: `รับค่าพลังภารกิจแล้วแสดงผล ถ้ามากกว่า 500 ไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 ไป 1B`,
      starterCode: 'power = int(input("พลังภารกิจ: "))\nprint("พลังภารกิจ:", power)',
      tests: [
        { input: '300', expected: 'พลังภารกิจ: 300' },
        { input: '700', expected: 'พลังภารกิจ: 700' },
      ],
      storyLines: [
        `Lumi เปิดแฟ้มภารกิจของบท ${displayTitle} แล้วค่ะ`,
        'เราจะใช้ผลลัพธ์ของโค้ดเลือกเส้นทางการฝึกที่เหมาะกับสถานการณ์',
        'ลองทำโจทย์เปิดทางนี้ให้ผ่านก่อนนะคะ',
      ],
      branchHigh: 'พลังภารกิจเกิน 500 แล้วค่ะ ไปเส้นทาง 1A กัน',
      branchLow: 'พลังภารกิจไม่เกิน 500 ค่ะ ไปเส้นทาง 1B กัน',
    }),
    makeLeaf({
      order: '1A',
      title: `ทางแยก 1A: สรุปบท ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านเส้นทาง 1A"',
      starterCode: 'print("ผ่านเส้นทาง 1A")',
      tests: [{ input: '', expected: 'ผ่านเส้นทาง 1A' }],
      intro: 'นี่คือเส้นทางฝึกแบบเข้มข้นค่ะ',
      clearText: 'เส้นทาง 1A ผ่านแล้วค่ะ',
    }),
    makeLeaf({
      order: '1B',
      title: `ทางแยก 1B: ทบทวนบท ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านเส้นทาง 1B"',
      starterCode: 'print("ผ่านเส้นทาง 1B")',
      tests: [{ input: '', expected: 'ผ่านเส้นทาง 1B' }],
      intro: 'นี่คือเส้นทางทบทวนแบบค่อยเป็นค่อยไปค่ะ',
      clearText: 'เส้นทาง 1B ผ่านแล้วค่ะ',
    }),
  ];
};

const buildChoiceSeeds = (lesson) => {
  const title = normalizeTitle(lesson.title);
  const displayTitle = lesson.title || 'บทเรียนนี้';
  const thaiBranchRules = [
    { condition: '/[ก-๙]/.test(value)', branch_key: '1A' },
    { condition: '/[A-Za-z]/.test(value)', branch_key: '1B' },
  ];

  const start = ({ title, description, code, tests, rules, storyLines, branchA, branchB }) => ({
    order: 'START',
    title,
    description,
    code,
    tests: {
      expected_format: 'ทำโจทย์แรกให้ผ่าน แล้วระบบจะใช้คำตอบที่พิมพ์เพื่อเลือกเส้นทาง',
      rules,
      correctness: tests,
    },
    dialogues: [
      { order: 0, emotion: 'smile', text: storyLines[0] },
      { order: 1, emotion: 'neutral', text: storyLines[1] },
      { order: 2, emotion: 'smile', text: description },
      { order: 3, emotion: 'happy', phase: 'post_submit', branch: '1A', text: branchA },
      { order: 4, emotion: 'happy', phase: 'post_submit', branch: '1B', text: branchB },
    ],
  });

  const leaf = ({ order, title, description, code, tests, intro, clearText, emotion = 'smile' }) => ({
    order,
    title,
    description,
    code,
    tests: {
      expected_format: 'ทำโจทย์ให้ตรงผลลัพธ์',
      rules: [{ condition: 'value.length >= 0', branch_key: 'end' }],
      correctness: tests,
    },
    dialogues: [
      { order: 0, emotion, text: intro },
      { order: 1, emotion: 'neutral', text: description },
      { order: 2, emotion: 'happy', phase: 'post_submit', branch: 'end', text: clearText },
    ],
  });

  if (title.includes('comment') || title.includes('คอมเม')) {
    return [
      start({
        title: 'จุดเริ่มต้น: ป้ายชื่อบนสมุดโค้ด',
        description: 'สร้างคอมเมนต์อธิบายว่าโค้ดนี้รับชื่อผู้เล่น จากนั้นรับชื่อด้วย input() แล้ว print ชื่อนั้นออกมา ถ้าพิมพ์ชื่อภาษาไทยจะไป 1A ถ้าพิมพ์ชื่อภาษาอังกฤษจะไป 1B',
        code: '# รับชื่อผู้เล่นเพื่อเขียนลงสมุดโค้ด\nname = input("name: ")\nprint(name)',
        tests: [
          { input: 'สมชาย', expected: 'สมชาย' },
          { input: 'Lumi', expected: 'Lumi' },
        ],
        rules: thaiBranchRules,
        storyLines: [
          'Lumi เจอสมุดโค้ดที่ยังไม่มีป้ายชื่อและไม่มีคำอธิบายค่ะ',
          'เริ่มจากใส่ comment ให้คนอ่านรู้ว่าโค้ดรับชื่อ แล้วให้ผู้เล่นพิมพ์ชื่อเพื่อเลือกเส้นทางถัดไป',
        ],
        branchA: 'ชื่อที่พิมพ์เป็นภาษาไทยค่ะ ต่อไปเราจะฝึกรับข้อมูลเป็นจำนวนเต็ม',
        branchB: 'ชื่อที่พิมพ์เป็นภาษาอังกฤษค่ะ ต่อไปเราจะฝึกรับข้อมูลเป็นทศนิยม',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: รับจำนวนเต็ม',
        description: 'เขียนคอมเมนต์ 1 บรรทัด แล้วรับตัวเลขจำนวนเต็มด้วย int(input()) จากนั้นแสดงผลในรูปแบบ "จำนวนเต็ม: <ค่า>"',
        code: '# รับจำนวนเต็มจากผู้เล่น\nnumber = int(input("number: "))\nprint("จำนวนเต็ม:", number)',
        tests: [{ input: '12', expected: 'จำนวนเต็ม: 12' }],
        intro: 'เส้นทางชื่อไทยจะต่อด้วยการรับตัวเลขจำนวนเต็มค่ะ',
        clearText: 'เยี่ยมค่ะ comment กับ int(input()) ทำงานถูกต้องแล้ว',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: รับทศนิยม',
        description: 'เขียนคอมเมนต์ 1 บรรทัด แล้วรับตัวเลขทศนิยมด้วย float(input()) จากนั้นแสดงผลในรูปแบบ "ทศนิยม: <ค่า>"',
        code: '# รับตัวเลขทศนิยมจากผู้เล่น\nscore = float(input("decimal: "))\nprint("ทศนิยม:", score)',
        tests: [{ input: '3.5', expected: 'ทศนิยม: 3.5' }],
        intro: 'เส้นทางชื่ออังกฤษจะต่อด้วยการรับตัวเลขทศนิยมค่ะ',
        clearText: 'ดีมากค่ะ comment กับ float(input()) ผ่านแล้ว',
      }),
    ];
  }

  if (title.includes('input') || title.includes('รับ')) {
    return [
      start({
        title: 'จุดเริ่มต้น: เลือกช่วงเวลาเข้าห้องเรียน',
        description: 'รับคำว่า "เช้า" หรือ "บ่าย" ด้วย input() แล้ว print คำนั้นออกมา ถ้าพิมพ์เช้าจะไป 1A ถ้าพิมพ์บ่ายจะไป 1B',
        code: 'period = input("period: ")\nprint(period)',
        tests: [
          { input: 'เช้า', expected: 'เช้า' },
          { input: 'บ่าย', expected: 'บ่าย' },
        ],
        rules: [
          { condition: 'value.includes("เช้า")', branch_key: '1A' },
          { condition: 'value.includes("บ่าย")', branch_key: '1B' },
        ],
        storyLines: [
          'ประตูห้องเรียนของ Lumi ต้องรู้ก่อนว่าผู้เล่นจะเข้าเรียนช่วงไหนค่ะ',
          'ใช้ input() รับคำตอบจากผู้เล่น แล้วคำตอบนั้นจะพาไปฝึกคนละโจทย์',
        ],
        branchA: 'เลือกช่วงเช้าแล้วค่ะ ต่อไปฝึกรับจำนวนนักเรียนเป็นจำนวนเต็ม',
        branchB: 'เลือกช่วงบ่ายแล้วค่ะ ต่อไปฝึกรับคะแนนเฉลี่ยเป็นทศนิยม',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: รับจำนวนนักเรียน',
        description: 'รับจำนวนนักเรียนเป็น int แล้วแสดง "นักเรียนทั้งหมด <จำนวน> คน"',
        code: 'students = int(input("students: "))\nprint("นักเรียนทั้งหมด", students, "คน")',
        tests: [{ input: '25', expected: 'นักเรียนทั้งหมด 25 คน' }],
        intro: 'ช่วงเช้าต้องนับจำนวนนักเรียนให้ครบค่ะ',
        clearText: 'รับจำนวนเต็มจากผู้ใช้ได้ถูกต้องแล้วค่ะ',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: รับคะแนนเฉลี่ย',
        description: 'รับคะแนนเฉลี่ยเป็น float แล้วแสดง "คะแนนเฉลี่ย <ค่า>"',
        code: 'avg = float(input("average: "))\nprint("คะแนนเฉลี่ย", avg)',
        tests: [{ input: '8.5', expected: 'คะแนนเฉลี่ย 8.5' }],
        intro: 'ช่วงบ่ายเราจะเก็บคะแนนเฉลี่ยแบบทศนิยมค่ะ',
        clearText: 'รับทศนิยมจากผู้ใช้ได้ถูกต้องแล้วค่ะ',
      }),
    ];
  }

  if (title.includes('variable') || title.includes('ตัวแปร')) {
    return [
      start({
        title: 'จุดเริ่มต้น: กล่องสถานะของตัวแปร',
        description: 'รับคำว่า "พร้อม" หรือ "พัก" เก็บไว้ในตัวแปร status แล้ว print ค่าออกมา ถ้าพิมพ์พร้อมจะไป 1A ถ้าพิมพ์พักจะไป 1B',
        code: 'status = input("status: ")\nprint(status)',
        tests: [
          { input: 'พร้อม', expected: 'พร้อม' },
          { input: 'พัก', expected: 'พัก' },
        ],
        rules: [
          { condition: 'value.includes("พร้อม")', branch_key: '1A' },
          { condition: 'value.includes("พัก")', branch_key: '1B' },
        ],
        storyLines: [
          'Lumi มีกล่องเก็บสถานะ และกล่องนี้คือแนวคิดของตัวแปรค่ะ',
          'ค่าที่ผู้เล่นใส่ลงไปจะตัดสินว่าเราจะฝึกตัวแปรแบบไหนต่อ',
        ],
        branchA: 'สถานะพร้อมแล้วค่ะ ไปฝึกตัวแปรข้อความกัน',
        branchB: 'สถานะพักค่ะ ไปฝึกตัวแปรตัวเลขกัน',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: ตัวแปรข้อความ',
        description: 'กำหนดตัวแปร course ให้เก็บคำว่า "Python" แล้ว print ค่าออกมา',
        code: 'course = "Python"\nprint(course)',
        tests: [{ input: '', expected: 'Python' }],
        intro: 'ตัวแปรข้อความช่วยเก็บคำสำคัญของบทเรียนค่ะ',
        clearText: 'ตัวแปรข้อความถูกต้องแล้วค่ะ',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: ตัวแปรตัวเลข',
        description: 'กำหนดตัวแปร coins ให้มีค่า 50 แล้ว print ค่าออกมา',
        code: 'coins = 50\nprint(coins)',
        tests: [{ input: '', expected: '50' }],
        intro: 'ตัวแปรตัวเลขช่วยเก็บแต้มและจำนวนต่าง ๆ ได้ค่ะ',
        clearText: 'ตัวแปรตัวเลขถูกต้องแล้วค่ะ',
      }),
    ];
  }

  if (title.includes('type conversion') || title.includes('conversion') || title.includes('ชนิดข้อมูล')) {
    return [
      start({
        title: 'จุดเริ่มต้น: เครื่องคิดภาษีหน้าห้อง',
        description: 'รับราคาสินค้าเป็นข้อความ แปลงเป็น float แล้วคำนวณ VAT 7% ถ้าราคาที่พิมพ์มากกว่า 500 จะไป 1A ถ้าน้อยกว่าหรือเท่ากับ 500 จะไป 1B',
        code: 'price = float(input("price: "))\nvat_total = price * 1.07\nprint("ราคารวมภาษี:", vat_total)',
        tests: [
          { input: '100', expected: 'ราคารวมภาษี: 107.0' },
          { input: '600', expected: 'ราคารวมภาษี: 642.0' },
        ],
        rules: [
          { condition: 'float > 500', branch_key: '1A' },
          { condition: 'float <= 500', branch_key: '1B' },
        ],
        storyLines: [
          'เครื่องคิดเงินของ Lumi รับราคาจากผู้เล่นเป็นข้อความก่อนเสมอค่ะ',
          'เราต้องแปลงชนิดข้อมูลให้ถูก แล้วราคาที่ผู้เล่นพิมพ์จะเลือกเส้นทางถัดไป',
        ],
        branchA: 'ราคาที่พิมพ์มากกว่า 500 ค่ะ ต่อไปฝึกแปลงเป็น float และปัดทศนิยม',
        branchB: 'ราคาที่พิมพ์ไม่เกิน 500 ค่ะ ต่อไปฝึกแปลงตัวเลขกลับเป็นข้อความ',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: แปลงเป็นทศนิยม',
        description: 'รับตัวเลขด้วย float(input()) แล้วแสดงค่าที่ปัดเป็นทศนิยม 2 ตำแหน่ง',
        code: 'price = float(input("price: "))\nprint(round(price, 2))',
        tests: [{ input: '123.456', expected: '123.46' }],
        intro: 'ราคาสูงต้องแสดงทศนิยมให้อ่านง่ายค่ะ',
        clearText: 'แปลงและปัดทศนิยมได้ถูกต้องแล้วค่ะ',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: แปลงเป็นข้อความ',
        description: 'กำหนด total = 250 แล้วใช้ str() เพื่อแสดงข้อความ "ยอดรวม 250"',
        code: 'total = 250\nprint("ยอดรวม " + str(total))',
        tests: [{ input: '', expected: 'ยอดรวม 250' }],
        intro: 'ยอดไม่สูงมาก เราจะฝึกต่อข้อความกับตัวเลขค่ะ',
        clearText: 'ใช้ str() ได้ถูกต้องแล้วค่ะ',
      }),
    ];
  }

  if (title.includes('if') || title.includes('else') || title.includes('เงื่อนไข')) {
    return [
      start({
        title: 'จุดเริ่มต้น: บัตรเลือกโหมด',
        description: 'รับคำว่า "ผ่าน" หรือ "ฝึก" แล้ว print ออกมา ถ้าพิมพ์ผ่านจะไป 1A ถ้าพิมพ์ฝึกจะไป 1B',
        code: 'mode = input("mode: ")\nprint(mode)',
        tests: [
          { input: 'ผ่าน', expected: 'ผ่าน' },
          { input: 'ฝึก', expected: 'ฝึก' },
        ],
        rules: [
          { condition: 'value.includes("ผ่าน")', branch_key: '1A' },
          { condition: 'value.includes("ฝึก")', branch_key: '1B' },
        ],
        storyLines: [
          'หน้าประตูมีบัตรสองใบให้เลือกค่ะ ใบหนึ่งคือผ่าน ใบหนึ่งคือฝึก',
          'คำที่ผู้เล่นพิมพ์จะพาไปเจอโจทย์ if-else คนละแบบ',
        ],
        branchA: 'เลือกผ่านแล้วค่ะ ต่อไปเขียนเงื่อนไขรับรางวัล',
        branchB: 'เลือกฝึกแล้วค่ะ ต่อไปเขียนเงื่อนไขวางแผนฝึกเพิ่ม',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: เงื่อนไขรับรางวัล',
        description: 'รับคะแนน ถ้าคะแนนตั้งแต่ 80 ขึ้นไปให้แสดง "รับตราดาว" ไม่เช่นนั้นให้แสดง "รับเหรียญฝึกฝน"',
        code: 'score = int(input("score: "))\nif score >= 80:\n    print("รับตราดาว")\nelse:\n    print("รับเหรียญฝึกฝน")',
        tests: [
          { input: '90', expected: 'รับตราดาว' },
          { input: '70', expected: 'รับเหรียญฝึกฝน' },
        ],
        intro: 'เส้นทางผ่านต้องใช้ if-else แยกรางวัลค่ะ',
        clearText: 'เงื่อนไขรับรางวัลถูกต้องแล้วค่ะ',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: เงื่อนไขฝึกเพิ่ม',
        description: 'รับจำนวนครั้งที่ฝึก ถ้ามากกว่าหรือเท่ากับ 3 ให้แสดง "พร้อมสอบใหม่" ไม่เช่นนั้นให้แสดง "ฝึกต่ออีกนิด"',
        code: 'practice = int(input("practice: "))\nif practice >= 3:\n    print("พร้อมสอบใหม่")\nelse:\n    print("ฝึกต่ออีกนิด")',
        tests: [
          { input: '3', expected: 'พร้อมสอบใหม่' },
          { input: '1', expected: 'ฝึกต่ออีกนิด' },
        ],
        intro: 'เส้นทางฝึกจะใช้ if-else ช่วยวางแผนค่ะ',
        clearText: 'เงื่อนไขฝึกเพิ่มถูกต้องแล้วค่ะ',
      }),
    ];
  }

  if (title.includes('loop') || title.includes('ลูป')) {
    return [
      start({
        title: 'จุดเริ่มต้น: เลือกเครื่องนับรอบ',
        description: 'รับคำว่า "for" หรือ "while" แล้ว print ออกมา ถ้าพิมพ์ for จะไป 1A ถ้าพิมพ์ while จะไป 1B',
        code: 'loop_type = input("loop: ")\nprint(loop_type)',
        tests: [
          { input: 'for', expected: 'for' },
          { input: 'while', expected: 'while' },
        ],
        rules: [
          { condition: 'value.toLowerCase().includes("for")', branch_key: '1A' },
          { condition: 'value.toLowerCase().includes("while")', branch_key: '1B' },
        ],
        storyLines: [
          'บนโต๊ะมีเครื่องนับรอบสองแบบค่ะ แบบ for และแบบ while',
          'ผู้เล่นเลือกคำหนึ่งคำ แล้วเราจะไปฝึกลูปแบบนั้นต่อ',
        ],
        branchA: 'เลือก for แล้วค่ะ ต่อไปฝึก for loop',
        branchB: 'เลือก while แล้วค่ะ ต่อไปฝึก while loop',
      }),
      leaf({
        order: '1A',
        title: 'ทางแยก 1A: for loop นับเลข',
        description: 'รับ n แล้วใช้ for loop แสดงเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
        code: 'n = int(input("n: "))\nfor i in range(1, n + 1):\n    print(i)',
        tests: [{ input: '3', expected: '1 2 3' }],
        intro: 'for loop เหมาะกับจำนวนรอบที่รู้ล่วงหน้าค่ะ',
        clearText: 'for loop ทำงานถูกต้องแล้วค่ะ',
      }),
      leaf({
        order: '1B',
        title: 'ทางแยก 1B: while loop ตรวจงาน',
        description: 'รับ n แล้วใช้ while loop แสดงคำว่า "ตรวจแล้ว" n ครั้ง',
        code: 'n = int(input("n: "))\ncount = 0\nwhile count < n:\n    print("ตรวจแล้ว")\n    count += 1',
        tests: [{ input: '2', expected: 'ตรวจแล้ว ตรวจแล้ว' }],
        intro: 'while loop เหมาะกับการวนจนกว่าเงื่อนไขจะจบค่ะ',
        clearText: 'while loop ทำงานถูกต้องแล้วค่ะ',
      }),
    ];
  }

  return [
    start({
      title: `จุดเริ่มต้น: ภารกิจ ${displayTitle}`,
      description: 'รับคำตอบภาษาไทยหรือภาษาอังกฤษแล้ว print ออกมา ถ้าพิมพ์ไทยจะไป 1A ถ้าพิมพ์อังกฤษจะไป 1B',
      code: 'answer = input("answer: ")\nprint(answer)',
      tests: [
        { input: 'พร้อม', expected: 'พร้อม' },
        { input: 'ready', expected: 'ready' },
      ],
      rules: thaiBranchRules,
      storyLines: [
        `Lumi เปิดภารกิจของบท ${displayTitle} แล้วค่ะ`,
        'คำตอบที่ผู้เล่นพิมพ์จะเลือกเส้นทางฝึกถัดไป',
      ],
      branchA: 'เลือกคำตอบภาษาไทยค่ะ ไปเส้นทาง 1A',
      branchB: 'เลือกคำตอบภาษาอังกฤษค่ะ ไปเส้นทาง 1B',
    }),
    leaf({
      order: '1A',
      title: `ทางแยก 1A: ฝึกบท ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านเส้นทาง 1A"',
      code: 'print("ผ่านเส้นทาง 1A")',
      tests: [{ input: '', expected: 'ผ่านเส้นทาง 1A' }],
      intro: 'นี่คือเส้นทางฝึกจากคำตอบภาษาไทยค่ะ',
      clearText: 'เส้นทาง 1A ผ่านแล้วค่ะ',
    }),
    leaf({
      order: '1B',
      title: `ทางแยก 1B: ฝึกบท ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านเส้นทาง 1B"',
      code: 'print("ผ่านเส้นทาง 1B")',
      tests: [{ input: '', expected: 'ผ่านเส้นทาง 1B' }],
      intro: 'นี่คือเส้นทางฝึกจากคำตอบภาษาอังกฤษค่ะ',
      clearText: 'เส้นทาง 1B ผ่านแล้วค่ะ',
    }),
  ];
};

const buildSequentialSeeds = (lesson) => {
  const title = normalizeTitle(lesson.title);
  const displayTitle = lesson.title || 'บทเรียนนี้';

  const buildSolvedCode = (exerciseTitle = '') => {
    if (exerciseTitle.includes('คอมเมนต์อธิบายโค้ด')) return '# อธิบายว่าโค้ดนี้แสดงข้อความ\nprint("อ่านโค้ดง่ายขึ้น")';
    if (exerciseTitle.includes('คอมเมนต์ปิดโค้ดทดลอง')) return '# ปิดโค้ดทดลองไว้ก่อน\n# print("debug")\nprint("พร้อมส่งงาน")';
    if (exerciseTitle.includes('คอมเมนต์บอกขั้นตอน')) return '# ขั้นตอนที่ 1 แสดงข้อความอธิบายโค้ด\nprint("โค้ดนี้มีคำอธิบาย")';
    if (exerciseTitle.includes('เลือกช่วงเวลาเข้าห้องเรียน')) return 'period = input("ช่วงเวลา: ")\nprint(period)';
    if (exerciseTitle.includes('ทักทายผู้เล่น')) return 'name = input("ชื่อ: ")\nprint("สวัสดี", name)';
    if (exerciseTitle.includes('รับจำนวนที่นั่ง')) return 'seats = int(input("จำนวนที่นั่ง: "))\nprint("ที่นั่งทั้งหมด", seats)';
    if (exerciseTitle.includes('ตัวแปรชื่อผู้เล่น')) return 'name = "Lumi"\nprint(name)';
    if (exerciseTitle.includes('ตัวแปรเหรียญ')) return 'coins = 50\nprint(coins)';
    if (exerciseTitle.includes('รวมค่าตัวแปร')) return 'xp = 15\nbonus = 5\nprint(xp + bonus)';
    if (exerciseTitle.includes('คำนวณ VAT')) return 'price = float(input("ราคาสินค้า: "))\nvat_total = price * 1.07\nprint("ราคารวมภาษี:", vat_total)';
    if (exerciseTitle.includes('แปลงเป็นจำนวนเต็ม')) return 'number = int(input("จำนวน: "))\nprint("จำนวน:", number)';
    if (exerciseTitle.includes('แปลงตัวเลขเป็นข้อความ')) return 'total = 250\nprint("ยอดรวม " + str(total))';
    if (exerciseTitle.includes('ตรวจผ่านหรือไม่ผ่าน')) return 'score = int(input("คะแนน: "))\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")';
    if (exerciseTitle.includes('เลขคู่เลขคี่')) return 'number = int(input("ตัวเลข: "))\nif number % 2 == 0:\n    print("เลขคู่")\nelse:\n    print("เลขคี่")';
    if (exerciseTitle.includes('เลือกช่วงเวลา')) return 'period = input("ช่วงเวลา: ")\nif period == "เช้า":\n    print("เริ่มเรียน")\nelse:\n    print("ทบทวนบทเรียน")';
    if (exerciseTitle.includes('for loop นับเลข')) return 'n = int(input("n: "))\nfor i in range(1, n + 1):\n    print(i)';
    if (exerciseTitle.includes('รวมเลขด้วย loop')) return 'n = int(input("n: "))\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)';
    if (exerciseTitle.includes('while loop ตรวจงาน')) return 'n = int(input("n: "))\ncount = 0\nwhile count < n:\n    print("ตรวจแล้ว")\n    count += 1';
    if (exerciseTitle.includes('เริ่มภารกิจ')) return 'print("เริ่มภารกิจ")';
    if (exerciseTitle.includes('ฝึกต่อ')) return 'answer = input("คำตอบ: ")\nprint(answer)';
    if (exerciseTitle.includes('จบบท')) return 'print("ผ่านมินิเกมแล้ว")';
    return 'print("ผ่านมินิเกมแล้ว")';
  };

  const exercise = ({ order, title, description, code = null, tests, intro, clearText, emotion = 'smile' }) => {
    const solvedCode = code || buildSolvedCode(title);

    return {
      order: String(order),
      title,
      description,
      code: solvedCode,
      tests: {
        expected_format: 'ทำโจทย์ให้ผ่าน แล้วไปด่านถัดไป',
        rules: [],
        correctness: tests,
      },
      dialogues: [
        { order: 0, emotion, text: intro },
        { order: 1, emotion: 'neutral', text: description },
        { order: 2, emotion: 'happy', phase: 'post_submit', branch: 'default', text: clearText },
      ],
    };
  };

  if (title.includes('comment') || title.includes('คอมเม')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: คอมเมนต์อธิบายโค้ด',
        description: 'เขียนคอมเมนต์ 1 บรรทัดเพื่ออธิบายว่าโค้ดกำลังแสดงข้อความ จากนั้นแสดงข้อความ "อ่านโค้ดง่ายขึ้น"',
        tests: [{ input: '', expected: 'อ่านโค้ดง่ายขึ้น' }],
        intro: 'Lumi เจอสมุดโค้ดที่ยังไม่มีคำอธิบายค่ะ บทนี้เราจะฝึกทำให้โค้ดอ่านง่ายด้วยคอมเมนต์เท่านั้น',
        clearText: 'ดีมากค่ะ คอมเมนต์ช่วยให้คนอ่านเข้าใจเจตนาของโค้ดแล้ว',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: คอมเมนต์ปิดโค้ดทดลอง',
        description: 'ใช้คอมเมนต์ปิดบรรทัด print("debug") ไม่ให้ทำงาน แล้วแสดงข้อความ "พร้อมส่งงาน"',
        tests: [{ input: '', expected: 'พร้อมส่งงาน', forbidden_any: ['debug'] }],
        intro: 'คอมเมนต์ไม่ได้มีไว้แค่อธิบาย แต่ยังใช้ปิดโค้ดทดลองชั่วคราวได้ด้วยค่ะ',
        clearText: 'เยี่ยมค่ะ ปิดโค้ดทดลองและแสดงผลจริงได้ถูกต้องแล้ว',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: คอมเมนต์บอกขั้นตอน',
        description: 'เขียนคอมเมนต์บอกขั้นตอนอย่างน้อย 1 บรรทัด แล้วแสดงข้อความ "โค้ดนี้มีคำอธิบาย"',
        tests: [{ input: '', expected: 'โค้ดนี้มีคำอธิบาย' }],
        intro: 'ด่านสุดท้ายของบทคอมเมนต์ ลองใช้คอมเมนต์บอกขั้นตอนก่อนเขียนคำสั่งจริงค่ะ',
        clearText: 'ผ่านแล้วค่ะ บทคอมเมนต์และการเขียนโค้ดไม่หลุดไปเรื่องอื่นแล้ว',
      }),
    ];
  }

  if (title.includes('input') || title.includes('รับ')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: เลือกช่วงเวลาเข้าห้องเรียน',
        description: 'รับคำว่า "เช้า" หรือ "บ่าย" ด้วย input() แล้ว print คำนั้นออกมา',
        tests: [
          { input: 'เช้า', expected: 'เช้า' },
          { input: 'บ่าย', expected: 'บ่าย' },
        ],
        intro: 'ประตูห้องเรียนของ Lumi ต้องรู้ว่าผู้เล่นเข้าเรียนช่วงเช้าหรือบ่ายค่ะ',
        clearText: 'รับคำตอบจากผู้ใช้และแสดงผลได้ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: ทักทายผู้เล่น',
        description: 'รับชื่อด้วย input() แล้วแสดงผลเป็น "สวัสดี <ชื่อ>"',
        tests: [
          { input: 'มะลิ', expected: 'สวัสดี มะลิ' },
          { input: 'Lumi', expected: 'สวัสดี Lumi' },
        ],
        intro: 'ต่อไปให้ห้องเรียนเรียกชื่อผู้เล่นได้ค่ะ',
        clearText: 'ดีมากค่ะ input() รับชื่อแล้วนำไปแสดงผลได้ถูกต้อง',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: รับจำนวนที่นั่ง',
        description: 'รับจำนวนที่นั่งเป็น int แล้วแสดงผลเป็น "ที่นั่งทั้งหมด <จำนวน>"',
        tests: [{ input: '30', expected: 'ที่นั่งทั้งหมด 30' }],
        intro: 'ด่านสุดท้าย ลองรับข้อมูลตัวเลขจากผู้ใช้เพื่อจัดห้องเรียนค่ะ',
        clearText: 'ผ่านแล้วค่ะ รับตัวเลขจากผู้ใช้ได้ถูกต้อง',
      }),
    ];
  }

  if (title.includes('variable') || title.includes('ตัวแปร')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: ตัวแปรชื่อผู้เล่น',
        description: 'สร้างตัวแปร name เก็บชื่อของคุณเป็น string แล้ว print ค่าออกมา',
        tests: [{ input: '', expected: 'Lumi' }],
        intro: 'บทนี้เริ่มจากกล่องเก็บข้อความ นั่นคือตัวแปรแบบ string ค่ะ',
        clearText: 'ตัวแปรข้อความถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: ตัวแปรเหรียญ',
        description: 'สร้างตัวแปร coins ให้มีค่า 50 แล้ว print ค่าออกมา',
        tests: [{ input: '', expected: '50' }],
        intro: 'ตัวแปรยังเก็บตัวเลขได้ด้วย ลองเก็บจำนวนเหรียญกันค่ะ',
        clearText: 'ตัวแปรตัวเลขถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: รวมค่าตัวแปร',
        description: 'สร้างตัวแปร xp = 15 และ bonus = 5 แล้วแสดงผลรวมเป็น 20',
        tests: [{ input: '', expected: '20' }],
        intro: 'ด่านสุดท้าย ลองนำค่าจากตัวแปรมาคำนวณร่วมกันค่ะ',
        clearText: 'ผ่านแล้วค่ะ ใช้ตัวแปรคำนวณได้ถูกต้อง',
      }),
    ];
  }

  if (title.includes('type conversion') || title.includes('conversion') || title.includes('ชนิดข้อมูล')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: คำนวณ VAT',
        description: 'รับราคาสินค้าเป็น float แล้วคำนวณ VAT 7% แสดงผลเป็น "ราคารวมภาษี: <ค่า>"',
        tests: [
          { input: '100', expected: 'ราคารวมภาษี: 107.0' },
          { input: '500', expected: 'ราคารวมภาษี: 535.0' },
        ],
        intro: 'เครื่องคิดเงินรับข้อมูลเป็นข้อความก่อน เราจึงต้องแปลงเป็น float เพื่อคำนวณค่ะ',
        clearText: 'คำนวณ VAT ด้วย float(input()) ได้ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: แปลงเป็นจำนวนเต็ม',
        description: 'รับตัวเลขด้วย int(input()) แล้วแสดงผลเป็น "จำนวน: <ค่า>"',
        tests: [{ input: '25', expected: 'จำนวน: 25' }],
        intro: 'ต่อไปฝึกแปลงข้อมูลที่รับมาเป็นจำนวนเต็มค่ะ',
        clearText: 'int(input()) ทำงานถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: แปลงตัวเลขเป็นข้อความ',
        description: 'กำหนด total = 250 แล้วใช้ str() แสดงข้อความ "ยอดรวม 250"',
        tests: [{ input: '', expected: 'ยอดรวม 250' }],
        intro: 'ด่านสุดท้าย ลองแปลงตัวเลขกลับเป็นข้อความเพื่อรวมกับประโยคค่ะ',
        clearText: 'ผ่านแล้วค่ะ str() ช่วยรวมข้อความกับตัวเลขได้ถูกต้อง',
      }),
    ];
  }

  if (title.includes('if') || title.includes('else') || title.includes('เงื่อนไข')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: ตรวจผ่านหรือไม่ผ่าน',
        description: 'รับคะแนน ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง "ผ่าน" ไม่เช่นนั้นให้แสดง "ไม่ผ่าน"',
        tests: [
          { input: '80', expected: 'ผ่าน' },
          { input: '40', expected: 'ไม่ผ่าน' },
        ],
        intro: 'บทนี้ให้ประตูห้องเรียนตัดสินจากเงื่อนไขค่ะ',
        clearText: 'if-else ตรวจผ่านหรือไม่ผ่านได้ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: เลขคู่เลขคี่',
        description: 'รับจำนวนเต็ม ถ้าเป็นเลขคู่ให้แสดง "เลขคู่" ไม่เช่นนั้นให้แสดง "เลขคี่"',
        tests: [
          { input: '8', expected: 'เลขคู่' },
          { input: '7', expected: 'เลขคี่' },
        ],
        intro: 'ต่อไปใช้เงื่อนไขแยกเลขคู่กับเลขคี่ค่ะ',
        clearText: 'เงื่อนไขเลขคู่เลขคี่ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: เลือกช่วงเวลา',
        description: 'รับคำว่า "เช้า" หรือ "บ่าย" ถ้าเป็นเช้าให้แสดง "เริ่มเรียน" ไม่เช่นนั้นให้แสดง "ทบทวนบทเรียน"',
        tests: [
          { input: 'เช้า', expected: 'เริ่มเรียน' },
          { input: 'บ่าย', expected: 'ทบทวนบทเรียน' },
        ],
        intro: 'ด่านสุดท้าย ใช้ if-else กับข้อความที่ผู้ใช้พิมพ์ค่ะ',
        clearText: 'ผ่านแล้วค่ะ ใช้เงื่อนไขกับข้อความได้ถูกต้อง',
      }),
    ];
  }

  if (title.includes('loop') || title.includes('ลูป')) {
    return [
      exercise({
        order: 1,
        title: 'โจทย์ 1: for loop นับเลข',
        description: 'รับ n แล้วใช้ for loop แสดงเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
        tests: [{ input: '3', expected: '1 2 3' }],
        intro: 'Lumi ต้องการเครื่องนับรอบแบบ for loop ค่ะ',
        clearText: 'for loop นับเลขได้ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 2,
        title: 'โจทย์ 2: รวมเลขด้วย loop',
        description: 'รับ n แล้วใช้ loop รวมเลขตั้งแต่ 1 ถึง n จากนั้นแสดงผลรวม',
        tests: [{ input: '5', expected: '15' }],
        intro: 'ต่อไปใช้ loop เพื่อสะสมผลรวมค่ะ',
        clearText: 'รวมเลขด้วย loop ได้ถูกต้องแล้วค่ะ',
      }),
      exercise({
        order: 3,
        title: 'โจทย์ 3: while loop ตรวจงาน',
        description: 'รับ n แล้วใช้ while loop แสดงคำว่า "ตรวจแล้ว" n ครั้ง',
        tests: [{ input: '2', expected: 'ตรวจแล้ว ตรวจแล้ว' }],
        intro: 'ด่านสุดท้าย ลองใช้ while loop วนตามเงื่อนไขค่ะ',
        clearText: 'ผ่านแล้วค่ะ while loop ทำงานถูกต้อง',
      }),
    ];
  }

  return [
    exercise({
      order: 1,
      title: `โจทย์ 1: ภารกิจ ${displayTitle}`,
      description: 'แสดงข้อความ "เริ่มภารกิจ"',
      tests: [{ input: '', expected: 'เริ่มภารกิจ' }],
      intro: `Lumi เปิดภารกิจของบท ${displayTitle} แล้วค่ะ`,
      clearText: 'โจทย์แรกผ่านแล้วค่ะ',
    }),
    exercise({
      order: 2,
      title: `โจทย์ 2: ฝึกต่อ ${displayTitle}`,
      description: 'รับข้อความจากผู้ใช้แล้ว print ข้อความนั้นออกมา',
      tests: [{ input: 'พร้อม', expected: 'พร้อม' }],
      intro: 'ต่อไปฝึกรับข้อมูลจากผู้ใช้ค่ะ',
      clearText: 'โจทย์ที่สองผ่านแล้วค่ะ',
    }),
    exercise({
      order: 3,
      title: `โจทย์ 3: จบบท ${displayTitle}`,
      description: 'แสดงข้อความ "ผ่านมินิเกมแล้ว"',
      tests: [{ input: '', expected: 'ผ่านมินิเกมแล้ว' }],
      intro: 'ด่านสุดท้ายของบทนี้แล้วค่ะ',
      clearText: 'ผ่านมินิเกมของบทนี้แล้วค่ะ',
    }),
  ];
};

const ensureSchema = async () => {
  const addColumnIfMissing = async (table, column, definition) => {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND column_name = ?`,
      [table, column]
    );

    if (Number(rows[0]?.count || 0) === 0) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    }
  };

  await addColumnIfMissing('mini_game_exercises', 'is_active', 'is_active tinyint(1) NOT NULL DEFAULT 1 AFTER currency_reward');
  await addColumnIfMissing('mini_game_dialogues', 'dialogue_phase', "dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit' AFTER location_id");
  await addColumnIfMissing('mini_game_dialogues', 'branch_key', "branch_key varchar(80) NOT NULL DEFAULT 'default' AFTER dialogue_phase");
};

const ensureSceneRows = async () => {
  await db.execute(
    `INSERT INTO mini_game_npcs (npc_key, name, avatar_asset_url, description)
     VALUES ('lumi', 'Lumi', '/data_MiNiGame/NPC_lumi', 'AI tutor for story mini games')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       avatar_asset_url = VALUES(avatar_asset_url),
       description = VALUES(description)`
  );

  await db.execute(
    `INSERT INTO mini_game_locations (location_key, name, description, bg_image_url)
     VALUES ('classroom', 'Python Classroom', 'Warm classroom for story mini games', '/data_MiNiGame/locations/classroom.jpg')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       description = VALUES(description),
       bg_image_url = VALUES(bg_image_url)`
  );

  const [[lumi]] = await db.execute("SELECT npc_id FROM mini_game_npcs WHERE npc_key = 'lumi' LIMIT 1");
  const [[classroom]] = await db.execute("SELECT location_id FROM mini_game_locations WHERE location_key = 'classroom' LIMIT 1");
  return { lumiId: lumi?.npc_id || null, classroomId: classroom?.location_id || null };
};

const main = async () => {
  await ensureSchema();
  const { lumiId, classroomId } = await ensureSceneRows();
  const [lessons] = await db.execute('SELECT lesson_id, title FROM lessons WHERE lesson_id >= 2 ORDER BY lesson_id');
  let updatedLessons = 0;

  for (const lesson of lessons) {
    const seeds = buildSequentialSeeds(lesson);
    const [existing] = await db.execute(
      `SELECT exercise_id
       FROM mini_game_exercises
       WHERE lesson_id = ?
       ORDER BY is_active DESC, CAST(exercise_order AS UNSIGNED) ASC, exercise_order ASC, exercise_id ASC`,
      [lesson.lesson_id]
    );

    const reusableIds = existing.slice(0, 3).map((row) => row.exercise_id);

    while (reusableIds.length < 3) {
      const [result] = await db.execute(
        `INSERT INTO mini_game_exercises (
           lesson_id, exercise_order, title, description, starter_code, solution_code,
           test_cases_json, xp_reward, currency_reward, is_active
         ) VALUES (?, 'TEMP', 'TEMP', 'TEMP', '', '', '[]', 10, 5, 1)`,
        [lesson.lesson_id]
      );
      reusableIds.push(result.insertId);
    }

    if (reusableIds.length > 0) {
      const placeholders = reusableIds.map(() => '?').join(',');
      try {
        await db.execute(
          `DELETE FROM mini_game_user_exercise_progress WHERE exercise_id IN (${placeholders})`,
          reusableIds
        );
        await db.execute(
          `DELETE FROM mini_game_exercise_submissions WHERE exercise_id IN (${placeholders})`,
          reusableIds
        );
      } catch (cleanupError) {
        console.warn(`Skipped progress cleanup for lesson ${lesson.lesson_id}: ${cleanupError.message}`);
      }
    }

    if (existing.length > 3) {
      const extraIds = existing.slice(3).map((row) => row.exercise_id);
      await db.execute(
        `UPDATE mini_game_exercises SET is_active = 0 WHERE exercise_id IN (${extraIds.map(() => '?').join(',')})`,
        extraIds
      );
    }

    for (let index = 0; index < seeds.length; index += 1) {
      const seed = seeds[index];
      const exerciseId = reusableIds[index];
      await db.execute(
        `UPDATE mini_game_exercises
         SET exercise_order = ?,
             title = ?,
             description = ?,
             starter_code = ?,
             solution_code = ?,
             test_cases_json = ?,
             xp_reward = ?,
             currency_reward = ?,
             is_active = 1
         WHERE exercise_id = ?`,
        [
          seed.order,
          seed.title,
          seed.description,
          seed.code,
          seed.code,
          json(seed.tests),
          15 + (index * 5),
          5,
          exerciseId,
        ]
      );

      await db.execute('DELETE FROM mini_game_dialogues WHERE exercise_id = ?', [exerciseId]);
      for (const dialogue of seed.dialogues) {
        await db.execute(
          `INSERT INTO mini_game_dialogues (
             lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text,
             npc_id, npc_emotion, location_id, dialogue_phase, branch_key
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lesson.lesson_id,
            exerciseId,
            dialogue.order,
            seed.order,
            dialogue.text,
            lumiId,
            dialogue.emotion || 'smile',
            classroomId,
            dialogue.phase || 'pre_submit',
            dialogue.branch || 'default',
          ]
        );
      }
    }

    await db.execute(
      `DELETE FROM mini_game_dialogues
       WHERE lesson_id = ?
         AND exercise_id IS NULL
         AND exercise_order = 'end'`,
      [lesson.lesson_id]
    );
    await db.execute(
      `INSERT INTO mini_game_dialogues (
         lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text,
         npc_id, npc_emotion, location_id, dialogue_phase, branch_key
       ) VALUES
         (?, NULL, 0, 'end', ?, ?, 'happy', ?, 'pre_submit', 'end'),
         (?, NULL, 1, 'end', ?, ?, 'smile', ?, 'pre_submit', 'end')`,
      [
        lesson.lesson_id,
        `ยอดเยี่ยมค่ะ คุณผ่านมินิเกมของบท "${lesson.title}" แล้ว`,
        lumiId,
        classroomId,
        lesson.lesson_id,
        'Lumi จะบันทึกความคืบหน้าไว้ แล้วเราไปเรียนบทต่อไปกันนะคะ',
        lumiId,
        classroomId,
      ]
    );

    updatedLessons += 1;
  }

  console.log(`Seeded story mini games for ${updatedLessons} lessons.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
