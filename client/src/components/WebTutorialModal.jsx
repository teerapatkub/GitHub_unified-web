import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const getInitialStep = (tutorial) => (tutorial?.steps?.length ? 0 : -1);

export default function WebTutorialModal({
  tutorial,
  isOpen,
  onClose,
  onComplete,
}) {
  const [stepIndex, setStepIndex] = useState(() => getInitialStep(tutorial));
  const steps = tutorial?.steps || [];
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setStepIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === "ArrowRight") {
        setStepIndex((current) =>
          Math.min(steps.length - 1, current + 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, steps.length]);

  if (!isOpen || !tutorial || !step) return null;

  const closeTutorial = () => {
    setStepIndex(getInitialStep(tutorial));
    onClose?.();
  };

  const finishTutorial = () => {
    onComplete?.();
    closeTutorial();
  };

  const goToNextStep = () => {
    if (isLastStep) {
      finishTutorial();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
        role="presentation"
        onClick={closeTutorial}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="web-tutorial-title"
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400" />

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  วิธีใช้งานเว็บ
                </p>
                <h2
                  id="web-tutorial-title"
                  className="mt-2 text-2xl font-black tracking-tight text-slate-950"
                >
                  {tutorial.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTutorial}
                aria-label="ปิดบทสอน"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold text-slate-400">
                ขั้นตอนที่ {stepIndex + 1} จาก {steps.length}
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {step.description}
              </p>
              <p className="mt-4 text-xs font-medium text-slate-400">
                ส่วนที่แนะนำ: {step.target}
              </p>
              <br />
              {step.image ? (
                <img
                  src={step.image}
                  alt={step.imageAlt || step.title}
                  className="mb-5 max-h-64 w-full rounded-xl object-contain"
                />
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {steps.map((currentStep, index) => (
                <button
                  key={currentStep.id}
                  type="button"
                  aria-label={`ไปขั้นตอนที่ ${index + 1}`}
                  onClick={() => setStepIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === stepIndex
                      ? "w-8 bg-blue-600"
                      : "w-2.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeTutorial}
                className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
              >
                ข้ามบทสอน
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  disabled={stepIndex === 0}
                  aria-label="ย้อนกลับ"
                  className="rounded-xl border border-slate-200 p-3 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  {isLastStep ? "เสร็จสิ้น" : "ถัดไป"}
                  {!isLastStep && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AnimatePresence>
  );
}
