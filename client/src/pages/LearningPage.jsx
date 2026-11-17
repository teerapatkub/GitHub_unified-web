import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Lock,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { contentTitle } from "../utils/contentText";
import { API_BASE } from '../config/api.js';
import WebTutorialModal from "../components/WebTutorialModal";
import { getWebTutorial } from "../data/webTutorials";
import SkeletonLoading from "../components/ui/Skeleton";

export default function LearningPage({ onNavigate, user }) {
  const [courseModules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const openGuide = () => setShowTutorial(true);
  const { t, i18n } = useTranslation();
  const learningTutorial = getWebTutorial("learning-overview");
  const userId = user?.user_id;
  const userLevel = user?.level;

  const resolveText = (key, fallback) => {
    const translated = t(key);
    return !translated || translated === key ? fallback : translated;
  };

  // The level bar comes from the server (server/levels.js, fix list item 11).
  // There used to be a 120 x level curve here as well, which disagreed with the
  // server's; with no progression yet (a guest, a cached account) the bar is
  // simply empty rather than computed a second way.
  const progression = user?.progression || {};
  const streakDays = Number(user?.streak_days || 0);
  const totalXp = Number(user?.xp || 0);
  const currentLevel = Number(progression.level || user?.level || 1);
  const atMaxLevel = Boolean(progression.maxLevel);
  const currentLevelXp = Number(progression.xpIntoLevel || 0);
  const xpNeededThisLevel = Number(progression.xpNeededThisLevel || 0);
  const xpProgressPercent = Number(progression.xpProgressPercent || 0);
  const promotionExamEligible = Boolean(progression.promotionExamEligible);
  const promotionStageLabel = progression.promotionStage === "intermediate_to_advanced"
    ? "Intermediate → Advanced"
    : "Beginner → Intermediate";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  useEffect(() => {
    if (!userId) return;
    let controller;
    let lastLoadedAt = 0;
    const fetchData = async (initial = false) => {
      lastLoadedAt = Date.now();
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      try {
        if (initial) setLoading(true);
        const res = await axios.get(`${API_BASE}/api/course-content`, {
          params: { user_id: userId, user_level: userLevel },
          signal,
        });
        // Module IDs, not titles, identify curriculum entries. Keep every lesson
        // added by an admin, including modules with the same display title.
        if (!signal.aborted) setModules(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!signal.aborted) console.error('โหลดข้อมูลบทเรียนไม่สำเร็จ:', err);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };
    // Coming back to the tab refreshes the list, but not more than once a
    // minute: focus and visibilitychange both fire on the same return, and each
    // fetch is several queries to a database in another country.
    const refresh = () => {
      if (!document.hidden && Date.now() - lastLoadedAt > 60000) fetchData();
    };
    fetchData(true);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [userId, userLevel]);

  // Chapter and lesson titles in the chosen language, Thai when a row has no
  // English yet (fix list item 16.10). Everything below reads `modules`.
  const language = i18n.language;
  const modules = useMemo(() => courseModules.map((module) => ({
    ...module,
    title: contentTitle(language, module),
    lessons: (module.lessons || []).map((lesson) => ({ ...lesson, title: contentTitle(language, lesson) })),
  })), [courseModules, language]);

  // The one lesson the page leads with: the first unfinished lesson this
  // level can open, in course order.
  const nextLesson = useMemo(() => modules
      .flatMap((module) =>
        (module.lessons || []).map((lesson) => ({
          ...lesson,
          source: lesson,
          moduleData: module,
          moduleId: Number(module.module_id || 0),
          moduleOrder: Number(module.order_index || 0),
        }))
      )
      .filter(
        (lesson) =>
          !lesson.is_completed &&
          currentLevel >= Number(lesson.required_level || 0)
      )
      .sort(
        (a, b) =>
          a.moduleId - b.moduleId ||
          a.moduleOrder - b.moduleOrder ||
          Number(a.order_index || 0) - Number(b.order_index || 0)
      )[0], [modules, currentLevel]);
  const nextLessonNumber = nextLesson
    ? (nextLesson.moduleData.lessons || []).findIndex((lesson) => lesson === nextLesson.source) + 1
    : 0;
  const startedAlready = modules.some((module) => (module.lessons || []).some((lesson) => lesson.is_completed));

  const continueLearning = () => {
    if (!nextLesson) {
      setShowCompleteModal(true);
      return;
    }

    onNavigate("lesson", nextLesson.lesson_id || nextLesson.id, nextLesson.moduleData);
  };

  if (loading) {
    return (
      <div className="mode-entry mode-entry--learn min-h-screen bg-pysim-surface px-4 py-8 sm:px-6">
        <SkeletonLoading variant="dashboard" label={`กำลังเตรียมบทเรียนให้คุณ ${user?.username || ''}...`} className="mx-auto max-w-7xl" />
      </div>
    );
  }

  return (
    <div className="mode-entry mode-entry--learn min-h-screen bg-pysim-surface pb-20">
      <NextStep
        lesson={nextLesson}
        lessonNumber={nextLessonNumber}
        startedAlready={startedAlready}
        onContinue={continueLearning}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row">
        <aside className="w-full space-y-8 md:w-72 md:shrink-0">
          <div className="mode-entry-card space-y-6 rounded-xl border border-slate-200 bg-pysim-surface-low p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white python-gradient">
                <span className="text-3xl" role="img" aria-label="avatar">
                  👨‍💻
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-pysim-primary">
                {user?.username || "Python Scholar"}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-pysim-outline">
                เลเวล {currentLevel}
              </p>
            </div>

            <div className="space-y-4">
              <div
                data-tour="learning-progress"
                className="rounded-xl bg-white/80 p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-pysim-on-surface-variant">
                    ความคืบหน้า XP
                  </span>
                  <span className="text-sm font-bold text-pysim-primary">
                    {totalXp.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-pysim-outline-variant/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pysim-primary to-pysim-secondary transition-all duration-700"
                    style={{ width: `${xpProgressPercent}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-label font-semibold text-pysim-outline">
                  <span>LV. {currentLevel}</span>
                  <span>
                    {atMaxLevel ? 'MAX' : `${currentLevelXp.toLocaleString()} / ${xpNeededThisLevel.toLocaleString()} XP`}
                  </span>
                  <span>{atMaxLevel ? '' : `LV. ${currentLevel + 1}`}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium text-pysim-on-surface-variant">
                  สตรีค
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-pysim-secondary-container"
                    role="img"
                    aria-label="fire"
                  >
                    🔥
                  </span>
                  <span className="text-sm font-bold text-pysim-secondary">
                    {streakDays} วัน
                  </span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-8">
          <header className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-pysim-primary">
              {resolveText("learning.allLessons", "บทเรียนทั้งหมด")}
            </h2>
            <p className="max-w-2xl text-sm text-pysim-on-surface-variant">
              {resolveText("learning.allLessonsHint", "เรียนตามลำดับจากบนลงล่าง หมวดที่มีแม่กุญแจจะเปิดเมื่อเลเวลถึง")}
            </p>
          </header>

          {promotionExamEligible ? (
            <div className="rounded-[28px] border border-violet-200 bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(168,85,247,0.08))] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">
                    พร้อมสอบเลื่อนขั้น
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    ถึงเวลาสอบเลื่อนขั้นแล้ว
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                    คุณมี XP ถึงเกณฑ์สำหรับด่าน {promotionStageLabel} แล้ว หากสอบผ่านจะปลดล็อกระดับถัดไปและเนื้อหาใหม่ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("promotion-exam")}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#9333ea)] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(99,102,241,0.24)]"
                >
                  เข้าสอบเลื่อนขั้น
                </button>
              </div>
            </div>
          ) : null}

          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            data-tour="lesson-modules"
            className="space-y-6"
          >
            {modules.map((mod, index) => {
              const reqLevel = Number(mod.required_level || 0);
              const myLevel = currentLevel;
              const isLocked = myLevel < reqLevel;

              return (
                <ModuleAccordion
                  key={mod.module_id}
                  moduleData={mod}
                  isFirst={index === 0}
                  isLocked={isLocked}
                  userLevel={myLevel}
                  onNavigate={onNavigate}
                />
              );
            })}
          </Motion.div>
        </section>
      </div>

      {showCompleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onClick={() => setShowCompleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-complete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h2
              id="learning-complete-title"
              className="text-2xl font-extrabold text-pysim-primary"
            >
              เรียนครบทุกบทเรียนแล้ว
            </h2>
            <p className="mt-3 text-pysim-on-surface-variant">
              ยินดีด้วย คุณทำแบบทดสอบหลังเรียนครบทุกบทเรียนแล้ว
            </p>
            <button
              type="button"
              onClick={() => setShowCompleteModal(false)}
              className="mt-6 rounded-lg bg-pysim-primary px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {learningTutorial ? (
        <>
          <WebTutorialModal
            onOpen={openGuide}
            tutorial={learningTutorial}
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={() => setShowTutorial(false)}
          />
        </>
      ) : null}
    </div>
  );
}

const ModuleAccordion = ({
  moduleData,
  isFirst,
  isLocked,
  onNavigate,
  userLevel,
}) => {
  const [isOpen, setIsOpen] = useState(isFirst);
  const { title, lessons, required_level } = moduleData;

  const calculateProgress = () => {
    if (!lessons || lessons.length === 0) return 0;
    const completed = lessons.reduce(
      (sum, lesson) => sum + (lesson.completed_count || 0),
      0
    );
    const total = lessons.reduce(
      (sum, lesson) => sum + (lesson.total_count || 0),
      0
    );
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // The server decides what "started" and "finished" mean - see
  // server/lessonProgress.js - so that this badge, the profile page and the
  // achievements agree. It used to read fields the API never sent, so every
  // lesson said "ยังไม่เริ่ม" even to someone who had already passed exercises
  // in it, which reads as the app having thrown their work away.
  const getLessonStatus = (lesson) => {
    if (lesson.is_completed) {
      return {
        label: "เรียนเสร็จสิ้น",
        className: "bg-emerald-100 text-emerald-700",
      };
    }

    if (lesson.is_started) {
      return {
        label: "กำลังเรียน",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "ยังไม่เริ่ม",
      className: "bg-pysim-surface-container text-pysim-on-surface-variant",
    };
  };

  return (
    <Motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className={`mode-entry-card group relative overflow-hidden rounded-xl transition-all ${
        isLocked
          ? "border-2 border-dashed border-pysim-outline-variant/20 bg-pysim-surface-low/50 opacity-80 grayscale"
          : "whisper-shadow bg-white hover:translate-y-[-2px]"
      }`}
    >
      <div
        className={`flex items-center gap-8 p-8 ${
          isLocked ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={() => !isLocked && setIsOpen(!isOpen)}
      >
        <div className="flex-shrink-0">
          {isLocked ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-pysim-surface-dim text-pysim-outline">
              <Lock className="h-6 w-6" />
            </div>
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm"
              style={{
                backgroundColor: "#e5e7eb",
                borderColor: "#9ca3af",
                color: "#111827",
              }}
            >
              <span className="text-2xl font-black leading-none">
                {String(moduleData.module_id || "").padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`text-xl font-bold ${
                isLocked ? "text-pysim-outline" : "text-pysim-on-surface"
              }`}
            >
              {title}
            </h3>

            {isLocked ? (
              <span className="flex items-center gap-1 rounded bg-pysim-surface-high px-2 py-1 text-label font-bold text-pysim-outline">
                ต้องการเลเวล {required_level}
              </span>
            ) : progress >= 100 ? (
              <CheckCircle2 className="h-5 w-5 text-pysim-primary" />
            ) : progress > 0 ? (
              <span className="rounded bg-pysim-primary-fixed px-2 py-1 text-xs font-bold text-pysim-on-primary-fixed">
                กำลังเรียน
              </span>
            ) : (
              /* Every open chapter used to say กำลังเรียน even at 0%, so the
                 badge said nothing (UI review 2026-11-18). */
              <span className="rounded px-2 py-1 text-xs font-bold text-pysim-on-surface-variant ring-1 ring-pysim-outline-variant">
                ยังไม่เริ่ม
              </span>
            )}
          </div>

          {!isLocked && (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-pysim-surface-container">
                <div
                  className="h-full bg-pysim-primary transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs font-medium text-pysim-on-surface-variant">
                {lessons?.length || 0} บทเรียนในหมวดนี้ • สำเร็จแล้ว {progress}%
              </p>
            </div>
          )}

          {isLocked && (
            <p className="text-xs font-medium text-pysim-outline">
              ยังไม่ปลดล็อก
            </p>
          )}
        </div>

        {!isLocked && (
          <Motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 text-pysim-on-surface-variant" />
          </Motion.div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !isLocked && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-pysim-surface-low/50 px-8 pb-6 pt-2">
              <ul className="space-y-2">
                {lessons.map((lesson, index) => {
                  const lessonId = lesson.lesson_id || lesson.id;
                  const levelLocked =
                    userLevel < Number(lesson.required_level || 0);

                  // Sub-lessons open in order. Each one is written assuming the
                  // one before it has been read - บทที่ 2 uses the variables
                  // บทที่ 1 introduced - so a beginner who opens the middle of a
                  // chapter first meets syntax nobody has explained to them and
                  // concludes they cannot do this.
                  //
                  // `opens_next` comes from the server and is deliberately not
                  // the same as "เรียนเสร็จสิ้น": passing the post-test opens
                  // the next lesson, while the badge also waits for every
                  // practice exercise. One exercise a learner is stuck on must
                  // not lock the rest of the course. Lessons with no post-test
                  // at all - บทที่ 6 and all of บทที่ 8-9 - open the next one on
                  // their exercises instead, so they cannot become a dead end.
                  const previousLesson = index > 0 ? lessons[index - 1] : null;
                  const sequenceLocked =
                    Boolean(previousLesson) && !previousLesson.opens_next;
                  const isLessonLocked = levelLocked || sequenceLocked;

                  const lessonStatus = levelLocked
                    ? { label: "ล็อกอยู่", className: "bg-pysim-surface-dim text-pysim-outline" }
                    : sequenceLocked
                      ? { label: "ต้องเรียนบทก่อนให้จบ", className: "bg-pysim-surface-dim text-pysim-outline" }
                      : getLessonStatus(lesson);

                  const lockReason = levelLocked
                    ? `ต้องถึงเลเวล ${lesson.required_level} ก่อนถึงจะเรียนบทนี้ได้`
                    : sequenceLocked
                      ? (previousLesson.has_post_quiz
                          ? `ทำแบบทดสอบท้ายบทของ "${previousLesson.title}" ให้ผ่านก่อน แล้วบทนี้จะเปิดให้เอง`
                          : `ทำแบบฝึกหัดของ "${previousLesson.title}" ให้ครบก่อน แล้วบทนี้จะเปิดให้เอง`)
                      : undefined;

                  return (
                    <li
                      key={lessonId}
                      title={lockReason}
                      className={`group/item flex items-center justify-between rounded-lg p-4 transition-all duration-300 ${
                        isLessonLocked
                          ? "cursor-not-allowed bg-pysim-surface-dim/30 opacity-50"
                          : "cursor-pointer hover:bg-white hover:whisper-shadow active:scale-[0.98]"
                      }`}
                      onClick={() =>
                        !isLessonLocked &&
                        onNavigate("lesson", lessonId, moduleData)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`rounded-lg p-2.5 transition-colors duration-300 ${
                            isLessonLocked
                              ? "bg-pysim-surface-dim"
                              : "bg-pysim-primary-fixed text-pysim-primary group-hover/item:bg-pysim-primary group-hover/item:text-white"
                          }`}
                        >
                          {isLessonLocked ? (
                            <Lock className="h-5 w-5 text-pysim-outline" />
                          ) : (
                            <PlayCircle className="h-5 w-5" strokeWidth={1.5} />
                          )}
                        </div>
                        <span className="text-base font-bold text-pysim-on-surface">
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${lessonStatus.className}`}
                        >
                          {lessonStatus.label}
                        </span>
                        <span
                          className="min-w-[3.25rem] select-none rounded-lg border px-3 py-1 text-center text-xs font-bold tabular-nums shadow-sm"
                          style={{
                            backgroundColor: "#e5e7eb",
                            borderColor: "#9ca3af",
                            color: "#111827",
                          }}
                        >
                          ภาคปฏิบัติ {lesson.completed_count || 0}/{lesson.total_count || 0}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
};

// The top of the learning home: what to do next, and one button that does
// it. It replaced a slogan banner ("start your learning journey") that filled
// a phone's whole first screen and pushed "continue" below the fold.
const NextStep = ({ lesson, lessonNumber, startedAlready, onContinue }) => {
  const { t } = useTranslation();
  const resolveText = (key, fallback) => {
    const translated = t(key);
    return !translated || translated === key ? fallback : translated;
  };
  const moduleTitle = lesson?.moduleData?.title;

  return (
    <div className="python-gradient">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mode-entry-card flex flex-col gap-5 rounded-2xl bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-sm font-bold text-pysim-secondary">
              {lesson
                ? startedAlready
                  ? resolveText("learning.nextUp", "ทำต่อจากครั้งก่อน")
                  : resolveText("learning.firstUp", "เริ่มบทแรกได้เลย")
                : resolveText("learning.allDone", "เรียนครบทุกบทที่เปิดอยู่แล้ว")}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-snug tracking-tight text-pysim-on-surface sm:text-3xl">
              {lesson ? lesson.title : resolveText("learning.allDoneTitle", "เก่งมาก! รอบทใหม่หรือลองโหมดอื่นได้")}
            </h1>
            {lesson && moduleTitle ? (
              <p className="mt-1.5 text-sm text-pysim-on-surface-variant">
                {moduleTitle}
                {lessonNumber > 0 ? ` · ${resolveText("learning.lessonNo", "บทที่")} ${lessonNumber} / ${(lesson.moduleData.lessons || []).length}` : ""}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onContinue}
            data-tour="continue-learning"
            className="mode-entry-action inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-pysim-primary px-6 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-pysim-primary/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-pysim-primary/30 sm:w-auto"
          >
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
            {lesson
              ? startedAlready ? resolveText("learning.continue", "เรียนต่อ") : resolveText("learning.start", "เริ่มเรียน")
              : resolveText("learning.viewSummary", "ดูสรุป")}
          </button>
        </div>
      </div>
    </div>
  );
};
