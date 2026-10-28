import { useEffect, useRef, useState } from 'react';
import { Sparkles, Save } from 'lucide-react';

export default function LessonQuizGenerator({ lesson, request, disabled, onBusy, onSaved }) {
  const key = `lesson-ai-mixed-draft:${lesson?.lesson_id || 'none'}`;
  const [draft, setDraft] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch { return null; }
  });
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(null);
  const inFlight = useRef(false);
  const hasQuestions = Number(lesson?.pre_count || 0) + Number(lesson?.post_count || 0) > 0;
  useEffect(() => {
    try {
      if (draft) sessionStorage.setItem(key, JSON.stringify(draft));
      else sessionStorage.removeItem(key);
    } catch { /* The preview remains available in memory. */ }
  }, [draft, key]);

  const run = async action => {
    if (!lesson || inFlight.current) return;
    inFlight.current = true;
    setBusy(action); onBusy(true); setMessage(null);
    try {
      const result = await request(`/${lesson.lesson_id}/quizzes/${action}`, action === 'generate' ? {} : { token: draft.token });
      if (action === 'generate') setDraft(result);
      else {
        setDraft(null); onSaved();
        setMessage({ text: 'บันทึกแล้ว: ก่อนเรียน 5 ข้อ และหลังเรียน 5 ข้อ ผู้เรียนเปิดบทเรียนเพื่อทำข้อสอบได้ทันที' });
      }
    } catch (error) { setMessage({ error: true, text: error.message }); }
    finally { inFlight.current = false; setBusy(''); onBusy(false); }
  };

  return <section className="space-y-5 rounded-2xl border border-pysim-outline-variant/50 bg-white p-4 sm:p-6" aria-busy={!!busy}>
    {hasQuestions && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">บทนี้มีข้อสอบอยู่แล้ว จึงไม่สร้างทับเพื่อรักษาข้อสอบและผลการเรียนเดิม ใช้บทเรียนใหม่ที่ยังไม่มีข้อสอบสำหรับชุด AI</p>}
    {message && <p role={message.error ? 'alert' : 'status'} className={`rounded-xl p-4 ${message.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}
    <button type="button" disabled={disabled || !lesson || !!busy || hasQuestions} onClick={() => run('generate')}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pysim-primary px-5 py-3 font-bold text-white disabled:opacity-50 sm:w-auto">
      <Sparkles size={18} />{busy === 'generate' ? 'กำลังสร้างโจทย์…' : 'Generated โจทย์'}
    </button>
    {busy === 'generate' && <p role="status" className="text-sm text-pysim-on-surface-variant">อาจใช้เวลาประมาณ 1 นาที กรุณารอโดยไม่เปลี่ยนบทเรียน</p>}
    {draft?.pair && !hasQuestions && <>
      <p className="text-sm text-pysim-on-surface-variant">ตัวอย่างจาก {draft.model} · ยังไม่บันทึก กรุณาตรวจความตรงกับบทเรียนและเฉลยก่อน ร่างมีอายุ 1 ชั่วโมง</p>
      <div className="grid gap-5 lg:grid-cols-2">{[['pre', 'ก่อนเรียน (Pre-test)'], ['post', 'หลังเรียน (Post-test)']].map(([kind, label]) => <section key={kind} className="min-w-0 space-y-3">
        <h3 className="font-bold text-pysim-primary">{label} · 5 ข้อ</h3>
        {draft.pair[kind].map((q, index) => <article key={index} className="space-y-3 rounded-xl border border-pysim-outline-variant/50 bg-pysim-surface p-4">
          <p className="whitespace-pre-wrap break-words font-semibold">{index + 1}. {q.question}</p>
          <p className="text-sm text-pysim-primary">{q.type === 'fill' ? 'ข้อเขียนตอบสั้น · ตรวจตามคำตอบที่กำหนด' : 'ปรนัย · 4 ตัวเลือก'}</p>
          {q.type === 'fill' ? <p className="whitespace-pre-wrap break-words rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">เฉลย: {q.answer}</p> : <ol className="space-y-2">{q.options.map((option, i) => <li key={i} className={`whitespace-pre-wrap break-words rounded-lg p-2 text-sm ${q.correct === i ? 'bg-emerald-50 text-emerald-800' : 'bg-white'}`}>{i + 1}. {option}{q.correct === i ? ' ✓ คำตอบที่ถูกต้อง' : ''}</li>)}</ol>}
        </article>)}
      </section>)}</div>
      <button type="button" disabled={disabled || !!busy || !lesson} onClick={() => run('publish')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pysim-primary px-5 py-3 font-bold text-white disabled:opacity-50 sm:w-auto"><Save size={18} />{busy === 'publish' ? 'กำลังบันทึก…' : 'บันทึกข้อสอบทั้ง 10 ข้อ'}</button>
    </>}
  </section>;
}
