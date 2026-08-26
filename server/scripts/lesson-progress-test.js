// Does the curriculum say the right thing about where a learner is?
//
// Two bugs that reached a real player are pinned down here:
//
//   1. a learner who had passed an exercise was still told "ยังไม่เริ่ม",
//      because the badge asked for a field the API never sent;
//   2. every sub-lesson after บทที่ 6 was unreachable, because sub-lessons
//      unlock in order and the rule for "finished" demanded a post-test that
//      five of the twenty four lessons do not have.
//
// The second one is the dangerous kind: nothing errors, nothing is logged, and
// the app simply stops letting anyone learn anything past that point.
//
// Pure functions only, so this runs with no server and no database.

const { evaluateLesson, postQuizPassingScore } = require('../lessonProgress');

let passed = 0;
let failed = 0;

const check = (name, ok, detail = '') => {
    if (ok) {
        passed += 1;
        console.log(`PASS  ${name}${detail ? `  — ${detail}` : ''}`);
    } else {
        failed += 1;
        console.log(`FAIL  ${name}${detail ? `  — ${detail}` : ''}`);
    }
};

// A lesson as the curriculum ships it: pre-test, post-test, five exercises.
const fullLesson = (over = {}) => ({
    hasPreQuiz: true,
    hasPostQuiz: true,
    exercisesTotal: 5,
    ...over,
});

const attempt = (score, total = 5) => ({ score, total_questions: total });

// --- the badge ------------------------------------------------------------

const untouched = evaluateLesson(fullLesson());
check('ยังไม่แตะเลย = ยังไม่เริ่ม', untouched.status === 'not_started' && untouched.percent === 0);

const triedAndFailed = evaluateLesson(fullLesson({ exercisesAttempted: 1, exercisesPassed: 0 }));
check(
    'ส่งคำตอบแล้วแต่ยังไม่ผ่าน = กำลังเรียน',
    triedAndFailed.status === 'in_progress',
    'การลองแล้วผิดก็คือการเรียน ไม่ใช่ยังไม่เริ่ม'
);

const onePassed = evaluateLesson(fullLesson({ exercisesPassed: 1 }));
check(
    'ทำโจทย์ผ่าน 1 ข้อ = กำลังเรียน',
    onePassed.status === 'in_progress' && onePassed.started,
    'นี่คืออาการที่ผู้เล่นรายงานเข้ามา'
);

const preOnly = evaluateLesson(fullLesson({ pre: attempt(1) }));
check('ทำแบบทดสอบก่อนเรียนแล้ว = กำลังเรียน', preOnly.status === 'in_progress');

const finished = evaluateLesson(fullLesson({ pre: attempt(5), post: attempt(5), exercisesPassed: 5 }));
check(
    'ครบทุกอย่าง = เรียนเสร็จสิ้น 100%',
    finished.status === 'done' && finished.completed && finished.percent === 100
);

const postPassedOnly = evaluateLesson(fullLesson({ post: attempt(3), exercisesPassed: 0 }));
check(
    'ผ่านแบบทดสอบท้ายบทแต่ยังไม่ได้ฝึก = ยังไม่เสร็จสิ้น',
    !postPassedOnly.completed && postPassedOnly.status === 'in_progress'
);

// --- the 60% bar ----------------------------------------------------------

check('เกณฑ์ผ่าน 60% ของ 5 ข้อ คือ 3 ข้อ', postQuizPassingScore(5) === 3, `ได้ ${postQuizPassingScore(5)}`);

const scrapedThrough = evaluateLesson(fullLesson({ post: attempt(3) }));
check('ได้ 3/5 ถือว่าผ่านแบบทดสอบท้ายบท', scrapedThrough.postPassed && scrapedThrough.opensNext);

const shortOfIt = evaluateLesson(fullLesson({ post: attempt(2) }));
check(
    'ได้ 2/5 ยังไม่ผ่าน และยังไม่เปิดบทถัดไป',
    !shortOfIt.postPassed && !shortOfIt.opensNext && shortOfIt.status === 'in_progress'
);

// --- unlocking the next sub-lesson ---------------------------------------

check(
    'ผ่านแบบทดสอบท้ายบทแล้วเปิดบทถัดไปทันที',
    evaluateLesson(fullLesson({ post: attempt(3), exercisesPassed: 0 })).opensNext,
    'ไม่ต้องรอทำแบบฝึกหัดครบ คนที่ติดข้อเดียวจะได้ไม่ตันทั้งหลักสูตร'
);

check(
    'ยังไม่ทำแบบทดสอบท้ายบท = บทถัดไปยังล็อก',
    !evaluateLesson(fullLesson({ exercisesPassed: 5 })).opensNext
);

// บทที่ 6 และทั้งบทที่ 8-9: ไม่มีแบบทดสอบท้ายบทให้ทำ
const noPostQuiz = (over = {}) => ({ hasPreQuiz: false, hasPostQuiz: false, exercisesTotal: 5, ...over });

check(
    'บทที่ไม่มีแบบทดสอบท้ายบท ทำแบบฝึกหัดครบแล้วต้องเปิดบทถัดไปได้',
    evaluateLesson(noPostQuiz({ exercisesPassed: 5 })).opensNext,
    'ถ้าข้อนี้ล้ม หลักสูตรจะตันที่บทที่ 6 โดยไม่มี error ที่ไหนเลย'
);

check(
    'บทที่ไม่มีแบบทดสอบท้ายบท ทำแบบฝึกหัดครบ = เรียนเสร็จสิ้น 100%',
    evaluateLesson(noPostQuiz({ exercisesPassed: 5 })).completed
        && evaluateLesson(noPostQuiz({ exercisesPassed: 5 })).percent === 100,
    'คิด % จากสิ่งที่บทนี้มีจริง ไม่ใช่จากแบบทดสอบที่ไม่มี'
);

check(
    'บทที่ไม่มีแบบทดสอบท้ายบท ทำไม่ครบ = ยังไม่เปิดบทถัดไป',
    !evaluateLesson(noPostQuiz({ exercisesPassed: 4 })).opensNext
);

check(
    'บทที่ไม่มีทั้งแบบทดสอบและแบบฝึกหัด ต้องไม่ขวางบทถัดไป',
    evaluateLesson({ hasPreQuiz: false, hasPostQuiz: false, exercisesTotal: 0 }).opensNext,
    'ไม่มีอะไรให้ทำ ก็ไม่ควรมีอะไรให้ติด'
);

// --- counting -------------------------------------------------------------

// เผื่อกรณีที่ตารางส่งคำตอบมีแถวซ้ำ: ต้องไม่ได้ "ภาคปฏิบัติ 9/5"
const overCounted = evaluateLesson(fullLesson({ exercisesTotal: 5, exercisesPassed: 9 }));
check(
    'จำนวนที่ผ่านเกินจำนวนโจทย์ถูกตัดลงมา',
    overCounted.exercisesPassed === 5 && overCounted.percent === 71,
    `ผ่าน ${overCounted.exercisesPassed}/5 · ${overCounted.percent}% (ยังไม่ได้ทำแบบทดสอบสองชุด)`
);

const attemptedBelowPassed = evaluateLesson(fullLesson({ exercisesPassed: 3, exercisesAttempted: 0 }));
check('ข้อที่ผ่านแล้วนับเป็นข้อที่เคยลองเสมอ', attemptedBelowPassed.exercisesAttempted === 3);

const halfway = evaluateLesson(fullLesson({ pre: attempt(2), exercisesPassed: 2 }));
check('คิด % จากขั้นตอนที่มีจริง (pre + post + 5 ข้อ)', halfway.percent === 43, `ได้ ${halfway.percent}%`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
