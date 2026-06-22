import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:3001";

const buildSlideCodeKey = (slide, index) =>
  `${slide?.title || "slide"}-${slide?.src || "no-src"}-${index}`;

const simulatePythonOutput = (sourceCode) => {
  const lines = String(sourceCode || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const variables = {};
  const outputs = [];

  const unquote = (value) => {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  };

  for (const line of lines) {
    const assignmentMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assignmentMatch && !line.startsWith("print(")) {
      variables[assignmentMatch[1]] = unquote(assignmentMatch[2]);
      continue;
    }

    const printMatch = line.match(/^print\((.*)\)$/);
    if (!printMatch) {
      continue;
    }

    const expression = printMatch[1].trim();
    if (!expression) {
      outputs.push("");
      continue;
    }

    if (
      (expression.startsWith('"') && expression.endsWith('"')) ||
      (expression.startsWith("'") && expression.endsWith("'"))
    ) {
      outputs.push(unquote(expression));
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(variables, expression)) {
      outputs.push(String(variables[expression]));
      continue;
    }

    outputs.push(expression);
  }

  if (outputs.length > 0) {
    return outputs.join("\n");
  }

  return "ยังไม่พบผลลัพธ์ที่แสดงด้วย print()";
};

export default function LessonPage({
  onNavigate,
  lessonId,
  moduleData,
  module,
  user,
}) {
  const params = useParams();
  const resolvedLessonId = lessonId ?? params.lessonId;
  lessonId = resolvedLessonId;
  const lessonSource = moduleData ?? module;
  const lessonInfo = lessonSource?.lessons?.find(
    (item) => String(item.lesson_id ?? item.id) === String(resolvedLessonId)
  );

  const lessonFullTitle = lessonInfo
    ? `บทเรียน ${lessonId} ${lessonInfo.title}`
    : `บทเรียน ${lessonId}`;

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [answersByQuiz, setAnswersByQuiz] = useState({ pre: {}, post: {} });
  const [scores, setScores] = useState({ pre: null, post: null });
  const [quizMeta, setQuizMeta] = useState({ preTotal: 0, postTotal: 0 });
  const [quizLocked, setQuizLocked] = useState({ pre: false, post: false });
  const [quizErrors, setQuizErrors] = useState({});
  const [quizStatusMessage, setQuizStatusMessage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showPostTestFailModal, setShowPostTestFailModal] = useState(false);
  const [editableCodes, setEditableCodes] = useState({});
  const [savingQuiz, setSavingQuiz] = useState(false);

  const slide = slides[currentSlide];
  const codeSlideKey = slide?.code
    ? buildSlideCodeKey(slide, currentSlide)
    : null;
  const currentCode = codeSlideKey
    ? editableCodes[codeSlideKey] ?? slide?.content ?? ""
    : "";

  useEffect(() => {
    setCurrentSlide(0);
    setAnswersByQuiz({ pre: {}, post: {} });
    setScores({ pre: null, post: null });
    setQuizMeta({ preTotal: 0, postTotal: 0 });
    setQuizLocked({ pre: false, post: false });
    setQuizErrors({});
    setQuizStatusMessage("");
    setShowSummary(false);
    setShowPostTestFailModal(false);
    setOutput(null);
    setEditableCodes({});
    setFetchError("");
    setSavingQuiz(false);
  }, [resolvedLessonId]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!resolvedLessonId) {
        setSlides([]);
        setFetchError("Missing lesson id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFetchError("");

        const shouldLoadQuizAttempts = Boolean(user?.user_id && !user?.isGuest);

        const [slidesRes, quizRes, quizAttemptsRes] = await Promise.all([
          fetch(`${API_BASE}/api/lessons/${resolvedLessonId}/slides`),
          fetch(`${API_BASE}/api/lessons/${resolvedLessonId}/quizzes`),
          shouldLoadQuizAttempts
            ? fetch(`${API_BASE}/api/lessons/${resolvedLessonId}/quiz-results/${user.user_id}`)
            : Promise.resolve(null),
        ]);

        if (!slidesRes.ok || !quizRes.ok) {
          const [slidesText, quizText] = await Promise.all([
            slidesRes.text(),
            quizRes.text(),
          ]);
          throw new Error(
            slidesText ||
              quizText ||
              `Unable to load lesson data (slides: ${slidesRes.status}, quizzes: ${quizRes.status})`
          );
        }

        const slidesData = await slidesRes.json();
        const rawQuizData = await quizRes.json();
        const attemptRows =
          quizAttemptsRes && quizAttemptsRes.ok ? await quizAttemptsRes.json() : [];
        const attemptsByQuizType = Array.isArray(attemptRows)
          ? Object.fromEntries(
              attemptRows.map((attempt) => [attempt.quiz_type, attempt])
            )
          : {};

        const lessonSlides = Array.isArray(slidesData)
          ? slidesData.map((item) => ({
              title: item.title,
              src: item.slide_src,
              content: item.slide_content,
              code: item.slide_type === "code",
              video: item.slide_type === "video",
              quiz: false,
            }))
          : [];

        const quizSlides = (Array.isArray(rawQuizData) ? rawQuizData : []).map(
          (quiz) => ({
            title:
              quiz.quiz_type === "pre"
                ? "แบบทดสอบก่อนเรียน"
                : "แบบทดสอบหลังเรียน",
            quiz: true,
            quizId: quiz.quiz_type,
            questions: (quiz.questions || []).map((question) => ({
              question: question.question_text,
              choices: question.choices?.map((choice) => choice.choice_text) || [],
              answer: question.correct_answer,
              type: question.question_type === "fill" ? "fill" : "choice",
            })),
          })
        );

        const preQuizData = (Array.isArray(rawQuizData) ? rawQuizData : []).find(
          (quiz) => quiz.quiz_type === "pre"
        );
        const postQuizData = (Array.isArray(rawQuizData) ? rawQuizData : []).find(
          (quiz) => quiz.quiz_type === "post"
        );
        const persistedPostAttempt =
          attemptsByQuizType.post &&
          attemptsByQuizType.post.score >=
            getPostPassingScore(
              attemptsByQuizType.post.total_questions ||
                postQuizData?.questions?.length ||
                0
            )
            ? attemptsByQuizType.post
            : null;

        setQuizMeta({
          preTotal: preQuizData?.questions?.length || 0,
          postTotal: postQuizData?.questions?.length || 0,
        });

        setScores({
          pre: attemptsByQuizType.pre?.score ?? null,
          post: persistedPostAttempt?.score ?? null,
        });
        setQuizLocked({
          pre: Boolean(attemptsByQuizType.pre),
          post: Boolean(persistedPostAttempt),
        });
        setAnswersByQuiz({
          pre: attemptsByQuizType.pre?.answers || {},
          post: persistedPostAttempt?.answers || {},
        });

        setSlides([
          ...quizSlides.filter((quiz) => quiz.quizId === "pre"),
          ...lessonSlides,
          ...quizSlides.filter((quiz) => quiz.quizId === "post"),
        ]);
      } catch (error) {
        console.error("โหลดบทเรียนไม่สำเร็จ:", error);
        setSlides([]);
        setFetchError(
          error instanceof Error
            ? error.message
            : "Unable to load lesson data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [resolvedLessonId, user?.user_id, user?.isGuest]);

  const runCode = () => {
    setIsRunning(true);
    setOutput(null);

    setTimeout(() => {
      setOutput(simulatePythonOutput(currentCode));
      setIsRunning(false);
    }, 800);
  };

  const hasPrev = currentSlide > 0;
  const hasNext = currentSlide < slides.length - 1;
  const isQuiz = Boolean(slide?.quiz);
  const quizId = slide?.quizId;
  const isLocked = isQuiz ? quizLocked[quizId] : false;
  const answers = isQuiz ? answersByQuiz[quizId] || {} : {};

  const preQuiz = slides.find((item) => item.quizId === "pre");
  const postQuiz = slides.find((item) => item.quizId === "post");
  const preTotal = quizMeta.preTotal;
  const postTotal = quizMeta.postTotal;
  const hasPostQuiz = postTotal > 0 || Boolean(postQuiz);
  const getPostPassingScore = (totalQuestions) =>
    totalQuestions > 0 ? Math.ceil(totalQuestions * 0.6) : 0;

  const canGoNext = () => {
    if (!isQuiz) return true;

    const questionCount = Array.isArray(slide?.questions) ? slide.questions.length : 0;
    const answeredCount = Object.values(answers).filter(
      (value) => value !== null && value !== undefined && String(value).trim() !== ""
    ).length;

    return Boolean(quizLocked[quizId]) || (questionCount > 0 && answeredCount === questionCount);
  };

  const isCorrectAnswer = (question, userAnswer) => {
    if (!userAnswer) return false;

    if (question.type === "fill") {
      return (
        userAnswer.trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      );
    }

    return userAnswer === question.answer;
  };

  const submitQuiz = async () => {
    if (!slide?.questions?.length) return;

    let score = 0;
    const errors = {};

    slide.questions.forEach((question, index) => {
      const userAnswer = answers[index];

      if (!userAnswer || String(userAnswer).trim() === "") {
        errors[index] = true;
        return;
      }

      if (isCorrectAnswer(question, userAnswer)) {
        score += 1;
      }
    });

    if (Object.keys(errors).length > 0) {
      setQuizErrors(errors);
      return;
    }

    setQuizErrors({});
    setQuizStatusMessage("");
    const shouldPersistQuizResult =
      quizId !== "post" || score >= getPostPassingScore(slide.questions.length);

    if (quizId === "post" && !shouldPersistQuizResult) {
      setScores((prev) => ({ ...prev, post: null }));
      setQuizLocked((prev) => ({ ...prev, post: false }));
      setShowSummary(false);
      setShowPostTestFailModal(true);
      return;
    }

    if (shouldPersistQuizResult && user?.user_id && !user?.isGuest) {
      try {
        setSavingQuiz(true);
        const response = await fetch(
          `${API_BASE}/api/lessons/${resolvedLessonId}/quiz-results`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.user_id,
              quiz_type: quizId,
              score,
              total_questions: slide.questions.length,
              answers,
            }),
          }
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Unable to save quiz result.");
        }
      } catch (error) {
        setFetchError(
          error instanceof Error
            ? error.message
            : "Unable to save quiz result."
        );
        return;
      } finally {
        setSavingQuiz(false);
      }
    }

    setScores((prev) => ({ ...prev, [quizId]: score }));
    setQuizLocked((prev) => ({ ...prev, [quizId]: true }));

    if (quizId === "post") {
      setShowSummary(true);
    }
  };

  const handleNextSlide = async () => {
    if (!hasNext) return;

    if (!isQuiz) {
      setCurrentSlide((prev) => prev + 1);
      return;
    }

    if (!quizLocked[quizId]) {
      await submitQuiz();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const gainDisplay =
    scores.pre !== null && scores.post !== null && postTotal > 0
      ? Math.max(0, Math.round(((scores.post - scores.pre) / postTotal) * 100))
      : 0;

  const postPassingScore = postTotal > 0 ? Math.ceil(postTotal * 0.6) : 0;
  const postTestFinished = hasPostQuiz
    ? scores.post !== null
    : currentSlide === slides.length - 1 && !isQuiz;
  const postTestPassed = hasPostQuiz
    ? scores.post !== null && scores.post >= postPassingScore
    : true;

  const restartLesson = () => {
    setShowSummary(false);
    setShowPostTestFailModal(false);
    setCurrentSlide(0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pysim-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pysim-primary border-t-transparent"></div>
          <span className="font-medium text-pysim-on-surface-variant">
            กำลังโหลดบทเรียน...
          </span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pysim-surface px-6">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-center whisper-shadow">
          <h2 className="text-2xl font-bold text-slate-900">
            Unable to load lesson
          </h2>
          <p className="mt-3 text-slate-600">{fetchError}</p>
          <button
            onClick={() => onNavigate("learn")}
            className="mt-6 rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300"
          >
            Back to lessons
          </button>
        </div>
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pysim-surface text-pysim-on-surface-variant">
        ไม่พบบทเรียน
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pysim-surface text-pysim-on-surface">
      <main className="mx-auto mt-10 max-w-4xl p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-pysim-surface-container">
            <div
              className="h-full rounded-full bg-pysim-primary transition-all duration-500"
              style={{
                width: `${((currentSlide + 1) / Math.max(slides.length, 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span className="text-xs font-bold text-pysim-on-surface-variant">
            {currentSlide + 1}/{slides.length}
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-pysim-on-surface">
          {lessonFullTitle}
        </h1>

        <div className="flex min-h-[420px] flex-col justify-between rounded-xl bg-white p-6 whisper-shadow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-pysim-on-surface">
                {slide.title}
              </h2>

              {!isQuiz && !slide.code && !slide.video && (
                <div className="space-y-5">
                  {slide.content && (
                    <div className="rounded-2xl border border-pysim-outline-variant/10 bg-pysim-surface-low p-6">
                      <p className="whitespace-pre-line text-lg leading-8 text-pysim-on-surface">
                        {slide.content}
                      </p>
                    </div>
                  )}
                  {slide.src && (
                    <img
                      src={slide.src}
                      alt=""
                      className="mx-auto max-h-[420px] rounded-lg"
                    />
                  )}
                </div>
              )}

              {slide.code && (
                <div className="rounded-xl bg-pysim-surface-low p-4">
                  <textarea
                    value={currentCode}
                    onChange={(event) =>
                      setEditableCodes((prev) => ({
                        ...prev,
                        [codeSlideKey]: event.target.value,
                      }))
                    }
                    spellCheck={false}
                    className="min-h-[140px] w-full resize-y rounded-lg border border-slate-800 bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pysim-primary/20"
                  />

                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100 px-5 py-2 text-sm font-bold text-amber-900 transition-all hover:bg-amber-200"
                  >
                    <Play size={16} />
                    Run Code
                  </button>

                  {output && (
                    <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 font-mono text-sm text-emerald-600">
                      &gt; {output}
                    </div>
                  )}
                </div>
              )}

              {isQuiz &&
                slide.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 transition-colors ${
                      quizLocked[quizId]
                        ? isCorrectAnswer(question, answers[index])
                          ? "border border-emerald-200 bg-emerald-50"
                          : "border border-red-200 bg-red-50"
                        : quizErrors[index]
                          ? "border border-red-200 bg-red-50"
                          : "bg-pysim-surface-low"
                    }`}
                  >
                    <p className="mb-3 font-bold text-pysim-on-surface">
                      {index + 1}. {question.question}
                    </p>

                    {question.type === "choice" &&
                      question.choices.map((choice, choiceIndex) => (
                        <button
                          key={choiceIndex}
                          disabled={isLocked}
                          onClick={() =>
                            {
                              setQuizStatusMessage("");
                              setAnswersByQuiz((prev) => ({
                                ...prev,
                                [quizId]: { ...prev[quizId], [index]: choice },
                              }));
                            }
                          }
                          className={`mb-2 block w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-all ${
                            answers[index] === choice
                              ? "bg-blue-700 text-white"
                              : "bg-white text-pysim-on-surface hover:bg-slate-50"
                          }`}
                        >
                          {choice}
                        </button>
                      ))}

                    {question.type === "fill" && (
                      <input
                        disabled={isLocked}
                        value={answers[index] || ""}
                        onChange={(event) =>
                          {
                            setQuizStatusMessage("");
                            setAnswersByQuiz((prev) => ({
                              ...prev,
                              [quizId]: {
                                ...prev[quizId],
                                [index]: event.target.value,
                              },
                            }));
                          }
                        }
                        className="w-full rounded-lg border border-pysim-outline-variant/20 bg-white px-4 py-2 text-pysim-on-surface focus:outline-none focus:ring-2 focus:ring-pysim-primary/20"
                        placeholder="พิมพ์คำตอบ..."
                      />
                    )}

                    {quizErrors[index] && (
                      <p className="mt-2 text-sm font-medium text-pysim-error">
                        กรุณาตอบข้อนี้
                      </p>
                    )}

                    {quizLocked[quizId] && (
                      <p
                        className={`mt-2 text-sm font-bold ${
                          isCorrectAnswer(question, answers[index])
                            ? "text-emerald-600"
                            : "text-pysim-error"
                        }`}
                      >
                        {isCorrectAnswer(question, answers[index])
                          ? "ตอบถูก"
                          : `ตอบผิด คำตอบที่ถูก: ${question.answer}`}
                      </p>
                    )}
                  </div>
                ))}

              {isQuiz && quizStatusMessage ? (
                <p className="mx-auto max-w-xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
                  {quizStatusMessage}
                </p>
              ) : null}

              {isQuiz && (
                <button
                  onClick={submitQuiz}
                  disabled={isLocked || savingQuiz}
                  className={`mx-auto block min-w-[180px] rounded-lg py-3 text-sm font-bold transition-all ${
                    isLocked
                      ? "bg-emerald-100 text-emerald-700"
                      : savingQuiz
                        ? "cursor-wait bg-blue-300 text-white"
                        : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                >
                  {isLocked
                    ? `คะแนน ${scores[quizId] ?? 0} / ${slide.questions.length}`
                    : "ส่งคำตอบ"}
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            {hasPrev ? (
              <button
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 transition-colors hover:bg-slate-300"
                aria-label="ย้อนกลับ"
              >
                <ChevronLeft size={24} strokeWidth={2.75} />
              </button>
            ) : (
              <div className="h-12 w-12" />
            )}

            {hasNext ? (
              <button
                onClick={handleNextSlide}
                disabled={!canGoNext()}
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                  canGoNext()
                    ? "bg-blue-700 text-white shadow-sm hover:bg-blue-800"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
                aria-label="ถัดไป"
              >
                <ChevronRight size={24} strokeWidth={2.75} />
              </button>
            ) : (
              <div className="h-12 w-12" />
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-pysim-outline-variant/10 pt-6">
          <button
            onClick={() => onNavigate("learn")}
            className="rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300"
          >
            กลับ
          </button>

          <button
            onClick={() =>
              postTestPassed
                ? onNavigate("exercise", resolvedLessonId)
                : restartLesson()
            }
            disabled={!postTestFinished}
            data-label={
              postTestFinished
                ? postTestPassed
                  ? "ไปทำแบบฝึกหัด"
                  : "กลับไปเรียนใหม่"
                : "ไปทำแบบฝึกหัด"
            }
            className={`relative rounded-lg px-8 py-3 text-sm font-bold text-transparent before:absolute before:inset-0 before:flex before:items-center before:justify-center before:content-[attr(data-label)] ${
              postTestFinished
                ? "bg-blue-700 before:text-white hover:bg-blue-800"
                : "cursor-not-allowed bg-slate-200 before:text-slate-400"
            }`}
          >
            เริ่มแบบฝึกหัด
          </button>
        </div>
      </main>

      {showPostTestFailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pysim-on-surface/30 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center whisper-shadow">
            <h2 className="text-2xl font-bold text-amber-600">ยังไม่ผ่านแบบทดสอบหลังเรียน</h2>
            <p className="text-pysim-on-surface">
              ผลครั้งนี้จะไม่ถูกบันทึก เพราะคะแนนยังไม่ถึงเกณฑ์ผ่าน
            </p>
            <p className="text-sm text-pysim-on-surface-variant">
              กรุณากลับไปทบทวนบทเรียนแล้วลองใหม่อีกครั้ง
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={restartLesson}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-blue-800"
              >
                กลับไปเรียนใหม่
              </button>
              <button
                onClick={() => setShowPostTestFailModal(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-300"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pysim-on-surface/30 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center whisper-shadow">
            <h2 className="text-2xl font-bold text-pysim-primary">สรุปผลการเรียน</h2>

            <p className="text-pysim-on-surface">
              คะแนนก่อนเรียน:
              <span className="font-bold text-pysim-primary">
                {" "}
                {scores.pre ?? 0} / {preTotal}
              </span>
            </p>

            <p className="text-pysim-on-surface">
              คะแนนหลังเรียน:
              <span className="font-bold text-pysim-primary">
                {" "}
                {scores.post ?? 0} / {postTotal}
              </span>
            </p>

            <p className="font-bold text-pysim-secondary">
              ระดับพัฒนาการ: {gainDisplay}%
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  if (postTestPassed) {
                    setShowSummary(false);
                    onNavigate("exercise", resolvedLessonId);
                    return;
                  }
                  restartLesson();
                }}
                data-label={postTestPassed ? "ไปทำแบบฝึกหัด" : "กลับไปเรียนใหม่"}
                className="relative rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-transparent transition-all hover:bg-blue-800 before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-white before:content-[attr(data-label)]"
              >
                ไปทำแบบฝึกหัด
              </button>
              <button
                onClick={() => setShowSummary(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-300"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

