import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Lock,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_BASE } from '../config/api.js';

const normalizeModulesForDisplay = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const beginnerModules = rows.filter(
    (module) =>
      Number(module?.required_level || 0) <= 1 &&
      Array.isArray(module?.lessons) &&
      module.lessons.length > 0
  );

  const beginnerLessonTotal = beginnerModules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

  if (beginnerModules.length < 2 || beginnerLessonTotal !== 5) {
    return rows;
  }

  const firstModule = beginnerModules[0];
  const mergedModule = {
    ...firstModule,
    title: firstModule.title || "Python พื้นฐาน",
    lessons: beginnerModules
      .flatMap((module) => module.lessons || [])
      .sort(
        (a, b) =>
          Number(a.lesson_id || a.id || 0) - Number(b.lesson_id || b.id || 0)
      ),
  };

  const remainingModules = rows.filter(
    (module) =>
      !beginnerModules.some(
        (candidate) => candidate.module_id === module.module_id
      )
  );

  return [mergedModule, ...remainingModules];
};

const buildTitleSignature = (title) => {
  return String(title || "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
};

const removeDuplicateModules = (rows) => {
  if (!Array.isArray(rows) || rows.length <= 1) return rows;

  const seen = new Set();

  return [...rows]
    .reverse()
    .filter((module) => {
      const signature = buildTitleSignature(module?.title);
      if (!signature) return true;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    })
    .reverse();
};

const getLevelProgress = (xp = 0) => {
  const numericXp = Number(xp || 0);
  let level = 1;
  let remainingXp = numericXp;
  let requiredXpForNextLevel = 120;

  while (remainingXp >= requiredXpForNextLevel) {
    remainingXp -= requiredXpForNextLevel;
    level += 1;
    requiredXpForNextLevel = 120 * level;
  }

  return {
    level,
    xpInCurrentLevel: remainingXp,
    xpNeededThisLevel: Math.max(1, requiredXpForNextLevel),
  };
};

export default function LearningPage({ onNavigate, user }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const { t } = useTranslation();

  const resolveText = (key, fallback) => {
    const translated = t(key);
    return !translated || translated === key ? fallback : translated;
  };

  const progression = user?.progression || {};
  const totalXp = Number(user?.xp || 0);
  const streakDays = Number(user?.streak_days || 0);
  const storedLevel = Number(user?.level ?? 1);
  const levelProgress = getLevelProgress(totalXp);
  // The server sends a `progression` block; fall back to the local curve when it
  // is absent so guests and stale /profile responses still render a sane bar.
  const currentLevel = Number(progression.level || Math.max(storedLevel, levelProgress.level));
  const currentLevelXp = Number(progression.xpIntoLevel ?? levelProgress.xpInCurrentLevel);
  const xpNeededThisLevel = Number(progression.xpNeededThisLevel || levelProgress.xpNeededThisLevel || 100);
  const xpProgressPercent = Number(
    progression.xpProgressPercent
    ?? Math.min(100, Math.round((currentLevelXp / (xpNeededThisLevel || 1)) * 100))
  );
  const promotionExamEligible = Boolean(progression.promotionExamEligible);
  const promotionStageLabel = progression.promotionStage === "intermediate_to_advanced"
    ? "Intermediate → Advanced"
    : "Beginner → Intermediate";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/course-content`, {
          params: { user_id: user.user_id, user_level: user.level },
        });
        const normalizedModules = normalizeModulesForDisplay(res.data);
        setModules(removeDuplicateModules(normalizedModules));
      } catch (err) {
        console.error("โหลดข้อมูลบทเรียนไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const continueLearning = () => {
    const nextLesson = modules
      .flatMap((module) =>
        (module.lessons || []).map((lesson) => ({
          ...lesson,
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
      )[0];

    if (!nextLesson) {
      setShowCompleteModal(true);
      return;
    }

    onNavigate("lesson", nextLesson.lesson_id || nextLesson.id, nextLesson.moduleData);
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pysim-primary border-t-transparent"></div>
        <p className="animate-pulse text-pysim-on-surface-variant">
          กำลังเตรียมบทเรียนให้คุณ {user?.username}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pysim-surface pb-20">
      <HeroSection />

      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 md:flex-row">
        <aside className="w-full space-y-8 md:w-72">
          <div className="space-y-6 rounded-xl bg-pysim-surface-low p-6">
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
              <div className="rounded-xl bg-white/80 p-3 shadow-sm">
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
                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-pysim-outline">
                  <span>LV. {currentLevel}</span>
                  <span>
                    {currentLevelXp} / {xpNeededThisLevel} XP
                  </span>
                  <span>LV. {currentLevel + 1}</span>
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

            <div className="pt-4">
              <button
                type="button"
                onClick={continueLearning}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pysim-secondary-container py-3 text-sm font-bold tracking-wide text-pysim-on-secondary-container transition-all hover:opacity-90 active:scale-95"
              >
                เรียนต่อ
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-12">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-pysim-primary">
              {resolveText("hero.title", "เส้นทางการเรียนรู้ของคุณ")}
            </h1>
            <p className="max-w-2xl text-lg text-pysim-on-surface-variant">
              {resolveText(
                "hero.subtitle",
                "เรียนรู้ Python อย่างเป็นขั้นตอน ผ่านบทเรียน แบบทดสอบ และแบบฝึกหัดที่ต่อเนื่องกัน"
              )}
            </p>
          </header>

          {promotionExamEligible ? (
            <div className="rounded-[28px] border border-violet-200 bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(168,85,247,0.08))] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">
                    Promotion Exam Ready
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

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
          </motion.div>
        </section>
      </main>

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
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className={`group relative overflow-hidden rounded-xl transition-all ${
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
              <span className="flex items-center gap-1 rounded bg-pysim-surface-high px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-pysim-outline">
                ต้องการเลเวล {required_level}
              </span>
            ) : progress >= 100 ? (
              <CheckCircle2 className="h-5 w-5 text-pysim-primary" />
            ) : (
              <span className="rounded bg-pysim-primary-fixed px-2 py-1 text-xs font-bold text-pysim-on-primary-fixed">
                ACTIVE
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
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 text-pysim-on-surface-variant" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !isLocked && (
          <motion.div
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
                          className="min-w-[3.25rem] select-none rounded-lg border px-3 py-1 text-center text-xs font-mono font-black shadow-sm"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HeroSection = () => {
  const { t } = useTranslation();

  const resolveText = (key, fallback) => {
    const translated = t(key);
    return !translated || translated === key ? fallback : translated;
  };

  return (
    <div className="relative h-[280px] w-full overflow-hidden select-none">
      <div className="absolute inset-0 python-gradient"></div>
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-pysim-secondary-container/20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-pysim-surface to-transparent"></div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl rounded-[28px] bg-white/72 px-8 py-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="text-xl font-black text-pysim-primary">
              PySim Academy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-extrabold tracking-tight text-pysim-on-surface md:text-5xl"
          >
            {resolveText("hero.title", "เริ่มต้นเส้นทางการเรียนรู้")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 max-w-2xl text-lg leading-8 text-pysim-on-surface-variant"
          >
            {resolveText(
              "hero.subtitle",
              "เรียนรู้ไปพร้อมกับความสนุก พัฒนาทักษะของคุณผ่านบทเรียนที่ออกแบบให้ค่อย ๆ เข้าใจง่าย"
            )}
          </motion.p>
        </div>
      </div>
    </div>
  );
};