export const webTutorials = [
  {
    id: "learning-overview",
    route: "/learn",
    title: "เริ่มต้นเรียนรู้กับ PySim",
    description: "ทำความรู้จักหน้าเส้นทางการเรียนรู้และความคืบหน้าของคุณ",
    steps: [
      {
        id: "learning-progress",
        target: '[data-tour="learning-progress"]',
        title: "ความคืบหน้า XP",
        description: "ดู XP เลเวลปัจจุบัน และความคืบหน้าไปยังเลเวลถัดไปได้ที่นี่",
        image: "/WebTutorialModal/data_png/learning-progress.png",
        imageAlt: "ตัวอย่างความคืบหน้า XP",
      },
      {
        id: "continue-learning",
        target: '[data-tour="continue-learning"]',
        title: "เรียนต่อ",
        description: "กดปุ่มนี้เพื่อเปิดบทเรียนถัดไปที่ยังเรียนไม่จบ",
        image: "/WebTutorialModal/data_png/continue-learning.png",
        imageAlt: "ตัวอย่างปุ่มเรียนต่อ",
      },
      {
        id: "lesson-modules",
        target: '[data-tour="lesson-modules"]',
        title: "หมวดบทเรียน",
        description: "เปิดหมวดที่ปลดล็อกแล้วเพื่อดูบทเรียน แบบฝึกหัด และสถานะการเรียน",
        image: "/WebTutorialModal/data_png/lesson-modules.png",
        imageAlt: "ตัวอย่างหมวดบทเรียน",
      },
    ],
  },
  {
    id: "lesson-page",
    route: "/lesson/:lessonId",
    title: "วิธีเรียนแต่ละบท",
    description: "อ่านเนื้อหา ทำความเข้าใจตัวอย่าง และไปทำแบบฝึกหัดตามลำดับ",
    steps: [
      {
        id: "lesson-content",
        target: '[data-tour="lesson-content"]',
        title: "เนื้อหาบทเรียน",
        description: "อ่านคำอธิบายและตัวอย่างโค้ดตามลำดับก่อนเริ่มลงมือทำ",
      },
      {
        id: "lesson-exercise",
        target: '[data-tour="lesson-exercise"]',
        title: "ไปทำแบบฝึกหัด",
        description: "เมื่อพร้อมแล้วให้เปิดแบบฝึกหัดเพื่อฝึกเขียนโค้ดด้วยตัวเอง",
      },
    ],
  },
  {
    id: "exercise-page",
    route: "/exercise/:lessonId",
    title: "วิธีทำแบบฝึกหัด",
    description: "เขียนโค้ด รันทดสอบ และส่งคำตอบเพื่อรับ XP",
    steps: [
      {
        id: "exercise-editor",
        target: '[data-tour="exercise-editor"]',
        title: "พื้นที่เขียนโค้ด",
        description: "เขียนหรือแก้ไข Python ในพื้นที่นี้ได้เลย",
      },
      {
        id: "run-code",
        target: '[data-tour="run-code"]',
        title: "ทดลองรันโค้ด",
        description: "กดรันเพื่อดูผลลัพธ์และแก้ไขโค้ดก่อนส่งคำตอบ",
      },
      {
        id: "submit-exercise",
        target: '[data-tour="submit-exercise"]',
        title: "ส่งคำตอบ",
        description: "เมื่อมั่นใจแล้วจึงส่งคำตอบ ระบบจะตรวจและบันทึกความคืบหน้าให้",
      },
    ],
  },
  {
    id: "debug-page",
    route: "/debug",
    title: "วิธีใช้ Debug Lab",
    description: "วิเคราะห์โจทย์ แก้บั๊ก และตรวจโค้ดก่อนส่งคำตอบ",
    steps: [
      {
        id: "debug-editor",
        target: '[data-tour="ai-task-editor"]',
        title: "พื้นที่แก้ไขโค้ด",
        description: "อ่านโจทย์แล้วแก้ไขโค้ด Python ในพื้นที่นี้",
      },
      {
        id: "debug-tests",
        target: '[data-tour="ai-task-tests"]',
        title: "ตรวจโค้ดกับ Test Cases",
        description: "กด Run Tests เพื่อตรวจว่าโค้ดผ่านกรณีทดสอบหรือยัง",
      },
      {
        id: "debug-submit",
        target: '[data-tour="ai-task-submit"]',
        title: "ส่งคำตอบ",
        description: "เมื่อผ่านการทดสอบแล้วจึงส่งคำตอบเพื่อรับรางวัล",
      },
    ],
  },
  {
    id: "challenge-page",
    route: "/challenge",
    title: "วิธีเล่น Challenge",
    description: "ทำโจทย์ท้าทายให้ผ่านทุก Test Case และสะสมรางวัล",
    steps: [
      {
        id: "challenge-editor",
        target: '[data-tour="ai-task-editor"]',
        title: "เขียนโค้ดแก้โจทย์",
        description: "ใช้คำอธิบายและตัวอย่างผลลัพธ์เพื่อวางแนวทางแก้โจทย์",
      },
      {
        id: "challenge-tests",
        target: '[data-tour="ai-task-tests"]',
        title: "Run Tests",
        description: "ตรวจโค้ดกับ Test Case ทั้งหมดก่อนส่งคำตอบ",
      },
      {
        id: "challenge-submit",
        target: '[data-tour="ai-task-submit"]',
        title: "Submit Challenge",
        description: "ส่งโจทย์เมื่อผ่านการทดสอบแล้วเพื่อรับ XP และ Coins",
      },
    ],
  },
  {
    id: "mini-game-page",
    route: "/mini-game/:lessonId",
    title: "วิธีเล่น MiNi Game",
    description: "เขียนโค้ดเพื่อดำเนินเรื่อง ทดลองรัน และผ่านด่านให้สำเร็จ",
    steps: [
      {
        id: "mini-game-editor",
        target: '[data-tour="mini-game-editor"]',
        title: "พื้นที่เขียนโค้ด",
        description: "แก้ไขโค้ดในไฟล์ที่เลือกเพื่อทำภารกิจของฉากนี้",
      },
      {
        id: "mini-game-run",
        target: '[data-tour="mini-game-run"]',
        title: "ทดลองรันโค้ด",
        description: "กด RUN เพื่อดูผลลัพธ์ใน Terminal หรือ Story Mode",
      },
      {
        id: "mini-game-submit",
        target: '[data-tour="mini-game-submit"]',
        title: "ส่งคำตอบ",
        description: "กด DONE เมื่อโค้ดผ่านเงื่อนไขของภารกิจแล้ว",
      },
    ],
  },
];

export const getWebTutorial = (tutorialId) =>
  webTutorials.find((tutorial) => tutorial.id === tutorialId) || null;

export const getTutorialsForRoute = (pathname) =>
  webTutorials.filter((tutorial) => {
    if (tutorial.route.includes(":lessonId")) {
      return pathname.startsWith(tutorial.route.replace("/:lessonId", "/"));
    }

    return pathname === tutorial.route;
  });
