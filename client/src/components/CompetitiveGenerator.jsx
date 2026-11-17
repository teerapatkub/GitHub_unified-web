import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { API_BASE } from '../config/api';

const scopeLabel = (scope) => (scope === 'weekly' ? 'โจทย์พิเศษรายสัปดาห์' : scope === 'daily' ? 'โจทย์พิเศษรายวัน' : 'โจทย์ทั่วไป');

// The draft keeps the topic and scope it was generated for. Generating on the
// local model can take minutes, and a poster who switched topic meanwhile used
// to find the "use this problem" button locked with no way forward (fix list
// item 6). The topic only steers generation - it is not posted - so the draft
// stays usable and simply says which topic it was made from.
//
// topics: one or more lesson topics (fix list item 5); with several the
// problem uses all of them. Shown and compared as "List + Loop".
export default function CompetitiveGenerator({ topics = ['Python'], scope = 'community', onApply, disabled = false }) {
  const topic = topics.join(' + ');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const flight = useRef(false);
  const generate = async () => {
    if (flight.current) return;
    flight.current = true; setBusy(true); setError('');
    const requested = { topic, scope };
    const body = { topics, scope };
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error || data?.message || `สร้างโจทย์ไม่สำเร็จ (HTTP ${response.status}) กรุณาตรวจ backend`);
      setDraft({ ...data, ...requested });
    } catch (e) { setError(e.message); }
    finally { flight.current = false; setBusy(false); }
  };
  const cases = Array.isArray(draft?.testCases) ? draft.testCases : [];
  const otherTopic = draft && (draft.topic !== topic || draft.scope !== scope);
  return <section className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4" aria-busy={busy}>
    <button type="button" disabled={busy || disabled} onClick={generate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Sparkles size={18} />{busy ? 'กำลังสร้างและตรวจโจทย์…' : 'Generated โจทย์'}</button>
    <p className="text-sm text-slate-600">สร้างตามหมวด {topic} · {scopeLabel(scope)} · กรอกเองได้ตามเดิม{topics.length > 1 ? ' · หลายหมวดรวมกันต้องสร้างใหม่ทุกครั้ง อาจใช้เวลานานกว่าหมวดเดียว' : ''}</p>
    {busy && <p role="status" className="text-sm text-slate-600">กำลังตรวจโค้ดเฉลยกับ test cases กรุณารอสักครู่ (ถ้าเปลี่ยนหมวดระหว่างรอ โจทย์จะยังสร้างจากหมวดเดิม)</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {draft && <div className="space-y-3 rounded-xl bg-white p-4">
      <p className="text-xs font-bold text-blue-700">สร้างจากหมวด {draft.topic} · {scopeLabel(draft.scope)}</p>
      <h3 className="break-words font-bold">{draft.title}</h3>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{draft.description}</p>
      {cases.length > 0 && <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">Test cases ({cases.length} ชุด)</p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {cases.map((testCase, index) => <li key={index} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
            <p className="font-bold text-slate-500">ชุดที่ {index + 1}</p>
            <p className="text-slate-500">ข้อมูลที่รับเข้า</p>
            <pre className="whitespace-pre-wrap break-words font-mono text-slate-800">{testCase.input || '(ไม่มี)'}</pre>
            <p className="text-slate-500">ผลลัพธ์ที่ต้องแสดง</p>
            <pre className="whitespace-pre-wrap break-words font-mono text-slate-800">{testCase.expected}</pre>
          </li>)}
        </ol>
      </div>}
      <p className="text-sm text-emerald-700">โค้ดเฉลยรันผ่าน {draft.verifiedCases} test cases · ยังไม่โพสต์</p>
      {otherTopic && <p className="text-sm text-amber-800">โจทย์นี้สร้างจากหมวด {draft.topic} ไม่ใช่หมวดที่เลือกอยู่ตอนนี้ ใช้ได้ตามเดิม หรือกดสร้างใหม่</p>}
      <button type="button" disabled={disabled || busy} onClick={() => { onApply(draft); setDraft(null); }} className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50">ใช้โจทย์นี้แทนข้อมูลในฟอร์ม</button>
    </div>}
  </section>;
}
