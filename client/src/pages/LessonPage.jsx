import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

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
}) {
  const lessonSource = moduleData ?? module;
  const lessonInfo = lessonSource?.lessons?.find(
    (item) => String(item.lesson_id ?? item.id) === String(lessonId)
  );

  const lessonFullTitle = lessonInfo
    ? `บทเรียน ${lessonId} ${lessonInfo.title}`
    : `บทเรียน ${lessonId}`;

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [answersByQuiz, setAnswersByQuiz] = useState({ pre: {}, post: {} });
  const [scores, setScores] = useState({ pre: null, post: null });
  const [quizMeta, setQuizMeta] = useState({ preTotal: 0, postTotal: 0 });
  const [quizLocked, setQuizLocked] = useState({ pre: false, post: false });
  const [quizErrors, setQuizErrors] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [editableCodes, setEditableCodes] = useState({});

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
    setQuizResult(null);
    setOutput(null);
    setEditableCodes({});
  }, [lessonId]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) {
        setSlides([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [slidesRes, quizRes] = await Promise.all([
          fetch(`${API_BASE}/api/lessons/${lessonId}/slides`),
          fetch(`${API_BASE}/api/lessons/${lessonId}/quizzes`),
        ]);

        const slidesData = slidesRes.ok ? await slidesRes.json() : [];
        const rawQuizData = quizRes.ok ? await quizRes.json() : [];

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

        setQuizMeta({
          preTotal: preQuizData?.questions?.length || 0,
          postTotal: postQuizData?.questions?.length || 0,
        });

        setSlides([
          ...quizSlides.filter((quiz) => quiz.quizId === "pre"),
          ...lessonSlides,
          ...quizSlides.filter((quiz) => quiz.quizId === "post"),
        ]);
      } catch (error) {
        console.error("โหลดบทเรียนไม่สำเร็จ:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

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
    setScores((prev) => ({ ...prev, [quizId]: score }));
    setQuizLocked((prev) => ({ ...prev, [quizId]: true }));

    if (quizId === "pre") {
      setSlides((prev) => prev.filter((item) => item.quizId !== "pre"));
      setCurrentSlide(0);
      setQuizResult({
        type: "pre",
        score,
        total: slide.questions.length,
      });
      return;
    }

    if (quizId === "post") {
      setQuizResult({
        type: "post",
        score,
        total: slide.questions.length,
      });
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
  const combinedScore = (scores.pre ?? 0) + (scores.post ?? 0);
  const combinedTotal = preTotal + postTotal;

  const postTestFinished = hasPostQuiz
    ? scores.post !== null
    : currentSlide === slides.length - 1 && !isQuiz;

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
                            setAnswersByQuiz((prev) => ({
                              ...prev,
                              [quizId]: { ...prev[quizId], [index]: choice },
                            }))
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
                          setAnswersByQuiz((prev) => ({
                            ...prev,
                            [quizId]: {
                              ...prev[quizId],
                              [index]: event.target.value,
                            },
                          }))
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

              {isQuiz && (
                <button
                  onClick={submitQuiz}
                  disabled={isLocked}
                  className={`mx-auto block min-w-[180px] rounded-lg py-3 text-sm font-bold transition-all ${
                    isLocked
                      ? "bg-emerald-100 text-emerald-700"
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
            onClick={() => onNavigate("exercise", lessonId)}
            disabled={!postTestFinished}
            className={`rounded-lg px-8 py-3 text-sm font-bold ${
              postTestFinished
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            เริ่มแบบฝึกหัด
          </button>
        </div>
      </main>

      {quizResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-pysim-on-surface/35 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center whisper-shadow">
            <h2 className="text-2xl font-bold text-pysim-primary">
              {quizResult.type === "post" ? "สรุปผลแบบทดสอบ" : "ผลคะแนนทันที"}
            </h2>

            <div className="rounded-2xl bg-pysim-surface-low px-5 py-4">
              <p className="text-sm font-medium text-pysim-on-surface-variant">
                {quizResult.type === "post" ? "คะแนนของแบบทดสอบล่าสุด" : "คะแนนก่อนเรียน"}
              </p>
              <p className="mt-2 text-3xl font-black text-pysim-primary">
                {quizResult.score} / {quizResult.total}
              </p>
            </div>

            {quizResult.type === "post" ? (
              <>
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

                <p className="text-pysim-on-surface">
                  คะแนนรวมทั้งหมด:
                  <span className="font-bold text-pysim-primary">
                    {" "}
                    {combinedScore} / {combinedTotal}
                  </span>
                </p>

                <p className="font-bold text-pysim-secondary">
                  ระดับพัฒนาการ: {gainDisplay}%
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-pysim-on-surface-variant">
                ระบบบันทึกคะแนนก่อนเรียนไว้เรียบร้อยแล้ว สามารถเริ่มศึกษาบทเรียนต่อได้ทันที
              </p>
            )}

            <div className="flex justify-center gap-4 pt-4">
              {quizResult.type === "post" && (
                <button
                  onClick={() => {
                    setQuizResult(null);
                    onNavigate("exercise", lessonId);
                  }}
                  className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-blue-800"
                >
                  ไปทำแบบฝึกหัด
                </button>
              )}

              <button
                onClick={() => setQuizResult(null)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-300"
              >
                {quizResult.type === "post" ? "ปิด" : "เริ่มเรียน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {false && quizResult && (
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
                  setQuizResult(null);
                  onNavigate("exercise", lessonId);
                }}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-blue-800"
              >
                ไปทำแบบฝึกหัด
              </button>
              <button
                onClick={() => setQuizResult(null)}
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
