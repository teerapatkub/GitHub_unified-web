import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import ProgressCelebration from '../components/learning/ProgressCelebration';

const API_BASE = 'http://localhost:3001';

export default function PromotionExamPage({ user, onUserRefresh, onNavigate }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [celebration, setCelebration] = useState(null);

  const progression = user?.progression || {};
  const questionCount = Number(exam?.questions?.length || 0);
  const answeredCount = Object.keys(answers).length;
  const isReadyToSubmit = questionCount > 0 && answeredCount === questionCount && !submitting;

  useEffect(() => {
    if (!user?.user_id) return;

    const loadExam = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${API_BASE}/api/learning/promotion-exam`, {
          params: { userId: user.user_id },
        });
        setExam(response.data.exam);
      } catch (err) {
        setError(err?.response?.data?.error || 'ไม่สามารถโหลดแบบทดสอบเลื่อนขั้นได้');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [user?.user_id]);

  const stageLabel = useMemo(() => {
    const stage = exam?.stage || progression?.promotionStage;
    if (stage === 'intermediate_to_advanced') return 'Intermediate → Advanced';
    return 'Beginner → Intermediate';
  }, [exam?.stage, progression?.promotionStage]);

  const handleSubmit = async () => {
    if (!exam?.examId || !isReadyToSubmit) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE}/api/learning/promotion-exam/submit`, {
        userId: user.user_id,
        examId: exam.examId,
        answers,
      });

      setResult(response.data);

      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...response.data.user }));
        onUserRefresh?.({ ...user, ...response.data.user });
      }

      if (response.data?.passed) {
        setCelebration({
          id: `promotion-pass-${Date.now()}`,
          type: 'levelup',
          title: `Promotion Cleared · LV ${response.data?.user?.level || user?.level || 1}`,
          subtitle: `คุณผ่านแบบทดสอบเลื่อนขั้นแล้ว และตอนนี้อยู่ในระดับ ${response.data?.user?.skill_tier || 'ขั้นถัดไป'}`,
          previousLevel: Number(response.data?.celebration?.previousLevel || Math.max(1, (response.data?.user?.level || 1) - 1)),
          newLevel: Number(response.data?.celebration?.newLevel || response.data?.user?.level || 1),
          tierLabel: response.data?.celebration?.newTier
            ? `${response.data?.celebration?.previousTier} → ${response.data?.celebration?.newTier}`
            : null,
          rewards: {},
        });
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'ส่งคำตอบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">กำลังเตรียมแบบทดสอบเลื่อนขั้นจาก AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
      <div className="rounded-[32px] border border-slate-200 bg-white/90 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.26em] text-violet-600">
                <Sparkles size={14} />
                Promotion Exam
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{exam?.title || 'Level Promotion Exam'}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                ด่านเลื่อนขั้น {stageLabel} · ต้องผ่านอย่างน้อย {exam?.passScore || 0} / {exam?.totalQuestions || 0} ข้อ
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('learn')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              <ArrowLeft size={16} />
              กลับหน้าเรียน
            </button>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">Exam Progress</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{answeredCount} / {questionCount}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#4f46e5,#a855f7)] transition-all duration-500"
                  style={{ width: `${questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                ตอบให้ครบก่อน จากนั้นระบบจะตรวจและตัดสินว่าคุณพร้อมเลื่อนขั้นหรือยัง
              </p>
            </div>

            {result ? (
              <div className={`rounded-3xl border p-5 ${result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                <p className={`text-xs font-black uppercase tracking-[0.24em] ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}>Exam Result</p>
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{result.score} / {result.totalQuestions}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{result.message}</p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            ) : null}
          </aside>

          <section className="space-y-4">
            {(exam?.questions || []).map((question, index) => {
              const answerKey = String(index + 1);
              const selected = answers[answerKey];

              return (
                <div key={answerKey} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold leading-7 text-slate-900">{question.prompt}</h2>
                      <div className="mt-4 grid gap-3">
                        {(question.choices || []).map((choice) => {
                          const active = selected === choice;
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => setAnswers((prev) => ({ ...prev, [answerKey]: choice }))}
                              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                                active
                                  ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-medium text-slate-500">
                ตอบครบแล้วจึงจะส่งตรวจได้ · ด่านนี้เป็นตัวตัดสินการเลื่อนจาก {stageLabel}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isReadyToSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#9333ea)] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(99,102,241,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                ส่งตรวจแบบทดสอบ
              </button>
            </div>
          </section>
        </div>
      </div>

      <ProgressCelebration
        event={celebration}
        onClose={() => {
          setCelebration(null);
          onNavigate?.('learn');
        }}
      />
    </div>
  );
}
