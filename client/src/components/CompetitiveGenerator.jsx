import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function CompetitiveGenerator({ topic = 'Python', scope = 'community', onApply, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const flight = useRef(false);
  const generate = async () => {
    if (flight.current) return;
    flight.current = true; setBusy(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, scope }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error || data?.message || `สร้างโจทย์ไม่สำเร็จ (HTTP ${response.status}) กรุณาตรวจ backend`);
      setDraft({ ...data, topic, scope });
    } catch (e) { setError(e.message); }
    finally { flight.current = false; setBusy(false); }
  };
  const matches = draft?.topic === topic && draft?.scope === scope;
  return <section className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4" aria-busy={busy}>
    <button type="button" disabled={busy || disabled} onClick={generate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Sparkles size={18} />{busy ? 'กำลังสร้างและตรวจโจทย์…' : 'Generated โจทย์'}</button>
    <p className="text-sm text-slate-600">สร้างตามหมวด {topic} · {scope === 'weekly' ? 'โจทย์พิเศษรายสัปดาห์' : scope === 'daily' ? 'โจทย์พิเศษรายวัน' : 'โจทย์ทั่วไป'} · กรอกเองได้ตามเดิม</p>
    {busy && <p role="status" className="text-sm text-slate-600">กำลังตรวจโค้ดเฉลยกับ test cases กรุณารอสักครู่</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {draft && <div className="space-y-3 rounded-xl bg-white p-4">
      <h3 className="break-words font-bold">{draft.title}</h3>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{draft.description}</p>
      <p className="text-sm text-emerald-700">โค้ดเฉลยรันผ่าน {draft.verifiedCases} test cases · ยังไม่โพสต์</p>
      {!matches && <p className="text-sm text-amber-800">หมวดหรือประเภทเปลี่ยนแล้ว กรุณาสร้างใหม่ให้ตรงกับที่เลือก</p>}
      <button type="button" disabled={disabled || busy || !matches} onClick={() => { onApply(draft); setDraft(null); }} className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50">ใช้โจทย์นี้แทนข้อมูลในฟอร์ม</button>
    </div>}
  </section>;
}
