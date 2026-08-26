// How far through a lesson a learner is. ONE definition, for the whole server.
//
// There used to be three, written at different times and disagreeing with each
// other: the achievements metric counted a lesson done one way, the profile
// page another, and the learning page's badge asked for fields
// (`pre_quiz_completed`, `post_quiz_completed`) that no endpoint has ever
// returned - so the badge read "ยังไม่เริ่ม" for every lesson in the
// curriculum no matter what the learner had done. This module is what they all
// call now.
//
// A lesson is measured against WHAT IT ACTUALLY CONTAINS. Five of the twenty
// four lessons have no post-quiz at all (บทที่ 6 and the whole of บทที่ 8-9),
// and any rule that says "finished = post-quiz passed" leaves those five
// permanently unfinished. That was harmless while nothing depended on it and
// became a wall the moment sub-lessons started unlocking in order: a learner
// who reached บทที่ 6 could never open บทที่ 7, and no error would appear
// anywhere to explain why.

// The same 60% bar the lesson page itself enforces before a post-test counts.
const POST_PASS_RATIO = 0.6;

const postQuizPassingScore = (totalQuestions) =>
    Math.ceil((Number(totalQuestions) || 0) * POST_PASS_RATIO);

// `attempt` is the row from lesson_quiz_attempts, or null when never taken.
const postQuizPassed = (attempt) => {
    const total = Number(attempt?.total_questions || 0);
    if (total <= 0) return false;
    return Number(attempt.score || 0) >= postQuizPassingScore(total);
};

/**
 * Everything the UI needs to say about one lesson for one learner.
 *
 * @param {object}  input
 * @param {object?} input.pre                 pre-quiz attempt row, or null
 * @param {object?} input.post                post-quiz attempt row, or null
 * @param {boolean} input.hasPreQuiz          this lesson has a pre-quiz to take
 * @param {boolean} input.hasPostQuiz         this lesson has a post-quiz to take
 * @param {number}  input.exercisesTotal      exercises attached to the lesson
 * @param {number}  input.exercisesPassed     of those, how many are passed
 * @param {number}  input.exercisesAttempted  of those, how many have been tried
 */
const evaluateLesson = ({
    pre = null,
    post = null,
    hasPreQuiz = false,
    hasPostQuiz = false,
    exercisesTotal = 0,
    exercisesPassed = 0,
    exercisesAttempted = 0,
} = {}) => {
    const total = Math.max(0, Number(exercisesTotal) || 0);
    const passed = Math.min(Math.max(0, Number(exercisesPassed) || 0), total);
    // A passed exercise was obviously attempted, whatever the caller counted.
    const attempted = Math.min(Math.max(passed, Number(exercisesAttempted) || 0), total);

    const postPassed = postQuizPassed(post);
    const preTaken = Boolean(pre);

    // Progress is out of the steps this lesson really has, so a lesson with no
    // quizzes can still reach 100%.
    const stepsTotal = (hasPreQuiz ? 1 : 0) + (hasPostQuiz ? 1 : 0) + total;
    const stepsDone = (hasPreQuiz && preTaken ? 1 : 0) + (hasPostQuiz && postPassed ? 1 : 0) + passed;
    const percent = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

    // Started, in the sense the learner would use: they have touched this
    // lesson at all - taken either quiz, or opened an exercise and submitted
    // something, whether or not it passed. Practice that failed is still
    // studying, and telling someone who has been working "ยังไม่เริ่ม" reads
    // as the app having lost their work.
    const started = preTaken || Boolean(post) || attempted > 0;

    // Finished, in the strict sense used by the badge, the profile page and the
    // "lessons completed" achievement: the post-test passed and every exercise
    // passed. A lesson with neither counts as finished because there is nothing
    // left in it to do.
    const completed = hasPostQuiz
        ? postPassed && passed >= total
        : total > 0
            ? passed >= total
            : true;

    // The gate for the NEXT lesson, which is deliberately gentler than
    // `completed`. The taught material ends at the post-test - the exercises
    // are practice on a separate page - so passing the post-test is what says
    // "you have been through this lesson". Holding the rest of the curriculum
    // hostage to five practice problems would strand a beginner who is stuck on
    // one of them, which is the person this app exists for.
    const opensNext = hasPostQuiz ? postPassed : completed;

    return {
        status: completed ? 'done' : started ? 'in_progress' : 'not_started',
        percent,
        started,
        completed,
        opensNext,
        preTaken,
        postPassed,
        exercisesTotal: total,
        exercisesPassed: passed,
        exercisesAttempted: attempted,
    };
};

module.exports = {
    POST_PASS_RATIO,
    postQuizPassingScore,
    postQuizPassed,
    evaluateLesson,
};
