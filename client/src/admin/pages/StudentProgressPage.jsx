import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, GraduationCap, BookOpen, Target, TrendingUp, ChevronRight } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import { API_BASE } from '../../config/api';

const fieldClass = 'min-w-0 rounded-xl border border-pysim-outline-variant/50 bg-white px-3 py-2.5 text-sm text-pysim-on-surface-variant focus:outline-none focus:ring-2 focus:ring-pysim-primary';
const statusLabels = { done: 'ผ่านแล้ว', in_progress: 'กำลังเรียน', not_started: 'ยังไม่เริ่ม', no_criteria: 'ไม่มีเกณฑ์จบ' };
const statusColors = { done: 'bg-emerald-50 text-emerald-700', in_progress: 'bg-pysim-primary-fixed/30 text-pysim-primary', not_started: 'bg-pysim-surface-low text-pysim-on-surface-variant', no_criteria: 'bg-amber-50 text-amber-700' };
const dateLabel = value => value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : 'ยังไม่มีกิจกรรมที่บันทึก';
const percent = value => value == null ? '—' : `${value}%`;

function useReport(path) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    let user;
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { user = {}; }
    fetch(`${API_BASE}/api/admin/student-progress${path}`, { signal: controller.signal, headers: { Authorization: `Bearer ${user.admin_token || ''}` } })
      .then(async response => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data) throw new Error(data?.error || 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบเซิร์ฟเวอร์');
        return data;
      }).then(data => setState({ loading: false, data, error: '' }))
      .catch(error => { if (error.name !== 'AbortError') setState({ loading: false, data: null, error: error.message }); });
    return () => controller.abort();
  }, [path]);
  return state;
}
function Status({ value }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[value]}`}>{statusLabels[value]}</span>;
}
function Metric({ title, value, note, icon, color = 'text-pysim-primary' }) {
  const Icon = icon;
  return <div className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-5"><div className="flex items-center justify-between gap-2 text-sm text-pysim-on-surface-variant"><span>{title}</span><Icon size={19} className={color} /></div><div className={`my-2 text-3xl font-bold ${color}`}>{value}</div><p className="text-xs leading-5 text-pysim-on-surface-variant">{note}</p></div>;
}
function Roster({ query, page, selected, onSelect, onPage }) {
  const { loading, data, error } = useReport(`?q=${encodeURIComponent(query)}&page=${page}`);
  return <aside className="h-fit min-w-0 rounded-2xl border border-pysim-outline-variant/50 bg-white p-4">
    <h2 className="mb-3 font-bold text-pysim-on-surface">รายชื่อผู้เรียน {data ? `(${data.total})` : ''}</h2>
    {loading ? <p role="status" className="py-5 text-sm text-pysim-on-surface-variant">กำลังโหลดรายชื่อ...</p> : error ? <p role="alert" className="text-sm text-red-600">{error}</p> : <>
      {!data.students.length && <p className="py-6 text-sm text-pysim-on-surface-variant">ไม่พบผู้เรียนที่ตรงกับการค้นหา</p>}
      <div className="space-y-2">{data.students.map(student => <button key={student.user_id} onClick={() => onSelect(student.user_id)} aria-pressed={String(student.user_id) === selected}
        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${String(student.user_id) === selected ? 'border-pysim-primary-fixed bg-pysim-primary-fixed/30' : 'border-transparent hover:bg-pysim-surface'}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pysim-primary-fixed/60 font-bold text-pysim-primary">{student.username.slice(0, 1).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold text-pysim-on-surface">{student.username}</span><span className="block truncate text-xs text-pysim-on-surface-variant">{student.email || `ID ${student.user_id}`}</span><span className="text-xs text-pysim-on-surface-variant">Lv. {student.level || 1}{student.is_banned ? ' · บัญชีถูกระงับ' : ''}</span></span><ChevronRight size={16} className="shrink-0 text-pysim-outline" />
      </button>)}</div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4 text-xs"><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-30">ก่อนหน้า</button><span>{page} / {Math.max(1, Math.ceil(data.total / data.page_size))}</span><button disabled={page * data.page_size >= data.total} onClick={() => onPage(page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-30">ถัดไป</button></div>
    </>}
  </aside>;
}
function QuizScore({ quiz, exists }) {
  if (!quiz) return <span className="text-pysim-outline">{exists ? 'ยังไม่ทำ' : 'ไม่มีแบบทดสอบ'}</span>;
  return <span>{quiz.score}/{quiz.total} <span className="text-pysim-on-surface-variant">({percent(quiz.percent)})</span></span>;
}
function StudentReport({ id }) {
  const { loading, data, error } = useReport(`/${encodeURIComponent(id)}`);
  const [module, setModule] = useState('all');
  const [status, setStatus] = useState('all');
  if (loading) return <div role="status" className="rounded-2xl border bg-white p-10 text-center text-pysim-on-surface-variant">กำลังโหลดความคืบหน้าผู้เรียน...</div>;
  if (error) return <div role="alert" className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>;
  const { student, summary, lessons, modules, last_lesson: lastLesson, next_lesson: nextLesson } = data;
  const visible = lessons.filter(lesson => (module === 'all' || String(lesson.module_id) === module) && (status === 'all' || (status === 'review' ? lesson.needs_review : lesson.status === status)));
  return <div className="min-w-0 space-y-5">
    <section className="rounded-2xl border border-pysim-primary-fixed bg-gradient-to-r from-pysim-primary-fixed/30 to-white p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-pysim-primary">สรุปรายบุคคล · ID {student.user_id}</p><h2 className="mt-2 break-words text-2xl font-bold text-pysim-on-surface">{student.username}</h2>
      <p className="mt-1 break-all text-sm text-pysim-on-surface-variant">{student.email || 'ไม่ได้ระบุอีเมล'}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white px-3 py-1.5">ระดับ {student.level || 1}</span><span className="rounded-full bg-white px-3 py-1.5">XP ปัจจุบัน {student.xp || 0}</span>{Boolean(student.is_banned) && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">บัญชีถูกระงับ</span>}</div>
      <p className="mt-4 text-xs text-pysim-on-surface-variant">กิจกรรมการเรียนล่าสุด: {dateLabel(summary.last_activity_at)}</p>
    </section>
    <section aria-label="ตัวชี้วัดการเรียน" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="บทเรียนที่ผ่าน" value={`${summary.completed}/${summary.total}`} note={`สำเร็จ ${percent(summary.completion_percent)} ของบทเรียนที่มีเกณฑ์จบ`} icon={GraduationCap} />
      <Metric title="กำลังเรียน" value={summary.in_progress} note={`ยังไม่เริ่ม ${summary.not_started} บทเรียน`} icon={BookOpen} color="text-pysim-primary" />
      <Metric title="Post-test เฉลี่ย" value={percent(summary.average_post)} note={`ผลล่าสุดจาก ${summary.post_count} บทเรียน · เกณฑ์ผ่าน ${data.post_pass_percent}%`} icon={Target} />
      <Metric title="พัฒนาการก่อน–หลัง" value={summary.paired_gain == null ? '—' : `${summary.paired_gain > 0 ? '+' : ''}${summary.paired_gain}`} note={`จุดเปอร์เซ็นต์ · เทียบบทเรียนเดียวกัน ${summary.paired_count} คู่`} icon={TrendingUp} color="text-pysim-primary" />
    </section>
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-5"><h3 className="font-bold text-pysim-on-surface">เรียนถึงไหนแล้ว</h3><p className="mt-3 text-xs text-pysim-on-surface-variant">บทเรียนที่มีกิจกรรมล่าสุด</p><p className="mt-1 text-sm font-medium text-pysim-on-surface-variant">{lastLesson ? `${lastLesson.module_title} / ${lastLesson.title}` : 'ยังไม่มีผลสอบหรือการส่งแบบฝึกหัด'}</p><p className="mt-4 text-xs text-pysim-on-surface-variant">บทเรียนถัดไปที่ยังไม่ผ่านตามลำดับหลักสูตร</p><p className="mt-1 text-sm font-medium text-pysim-on-surface-variant">{nextLesson ? `${nextLesson.module_title} / ${nextLesson.title}` : summary.total ? 'ผ่านครบทุกบทเรียนที่มีเกณฑ์จบแล้ว' : 'ยังไม่มีบทเรียนที่มีเกณฑ์จบ'}</p></div>
      <div className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-5"><h3 className="font-bold text-pysim-on-surface">ผลการฝึกและจุดที่ควรทบทวน</h3><dl className="mt-3 space-y-3 text-sm text-pysim-on-surface-variant"><div className="flex justify-between gap-2"><dt>แบบฝึกหัดที่ผ่าน</dt><dd className="font-semibold">{summary.exercises_passed}/{summary.exercises_total} ข้อ</dd></div><div className="flex justify-between gap-2"><dt>แบบฝึกหัดที่ลองทำ</dt><dd>{summary.exercises_attempted} ข้อ · ส่ง {summary.exercise_submissions} ครั้ง</dd></div><div className="flex justify-between gap-2"><dt>Pre-test เฉลี่ย</dt><dd>{percent(summary.average_pre)} ({summary.pre_count} บท)</dd></div><div className="flex justify-between gap-2"><dt>มินิเกมที่ผ่าน / ลองทำ</dt><dd>{summary.mini_games_completed}/{summary.mini_games_attempted} ข้อ</dd></div></dl><button onClick={() => { setStatus('review'); setModule('all'); }} className="mt-4 w-full rounded-xl bg-amber-50 px-3 py-3 text-left text-sm font-semibold text-amber-800">ดู Post-test ที่ยังไม่ผ่าน {summary.needs_review} บทเรียน →</button></div>
    </section>
    <section className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-5"><h3 className="mb-4 font-bold text-pysim-on-surface">ความคืบหน้าแยกตามหมวด</h3><div className="grid gap-4 sm:grid-cols-2">{modules.map(item => <div key={item.module_id ?? 'none'}><div className="mb-2 flex justify-between gap-3 text-xs text-pysim-on-surface-variant"><span>{item.title}</span><span className="shrink-0">{item.completed}/{item.total} บท</span></div><progress aria-label={`ความคืบหน้า ${item.title}`} max={item.total || 1} value={item.completed} className="h-2 w-full overflow-hidden rounded-full accent-pysim-primary" /></div>)}</div></section>
    <section className="overflow-hidden rounded-2xl border border-pysim-outline-variant/50 bg-white">
      <div className="space-y-3 border-b border-pysim-outline-variant/30 p-5"><h3 className="font-bold text-pysim-on-surface">รายละเอียดบทเรียน ({visible.length})</h3><div className="flex flex-col gap-2 sm:flex-row"><select aria-label="กรองหมวดบทเรียน" className={`${fieldClass} flex-1`} value={module} onChange={event => setModule(event.target.value)}><option value="all">ทุกหมวดบทเรียน</option>{modules.map(item => <option key={item.module_id ?? 'none'} value={String(item.module_id)}>{item.title}</option>)}</select><select aria-label="กรองสถานะบทเรียน" className={fieldClass} value={status} onChange={event => setStatus(event.target.value)}><option value="all">ทุกสถานะ</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="review">Post-test ที่ยังไม่ผ่าน</option></select></div></div>
      {!visible.length ? <p className="p-6 text-sm text-pysim-on-surface-variant">ไม่มีบทเรียนที่ตรงกับตัวกรองนี้</p> : <div className="overflow-x-auto" role="region" aria-label="ตารางผลการเรียน" tabIndex={0}><table className="w-full min-w-[740px] text-left text-sm"><thead className="bg-pysim-surface text-xs text-pysim-on-surface-variant"><tr>{['บทเรียน', 'สถานะ', 'Pre-test', 'Post-test', 'เปลี่ยนแปลง', 'ฝึกผ่าน/ทั้งหมด'].map(title => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody className="divide-y divide-pysim-outline-variant/30">{visible.map(lesson => <tr key={lesson.lesson_id} className="align-top hover:bg-pysim-surface"><td className="max-w-xs px-4 py-4"><div className="font-semibold text-pysim-on-surface-variant">{lesson.title}</div><div className="mt-1 text-xs text-pysim-outline">{lesson.module_title}</div><div className="mt-2 text-xs text-pysim-outline">{dateLabel(lesson.last_activity_at)}</div></td><td className="px-4 py-4"><Status value={lesson.status} /></td><td className="whitespace-nowrap px-4 py-4"><QuizScore quiz={lesson.pre} exists={lesson.has_pre} /></td><td className="whitespace-nowrap px-4 py-4"><QuizScore quiz={lesson.post} exists={lesson.has_post} />{lesson.needs_review && <div className="mt-1 text-xs text-amber-700">ควรทบทวน</div>}</td><td className="px-4 py-4">{lesson.gain == null ? '—' : `${lesson.gain > 0 ? '+' : ''}${lesson.gain} จุด`}</td><td className="px-4 py-4">{lesson.exercises.passed}/{lesson.exercises.total}</td></tr>)}</tbody></table></div>}
    </section>
    <p className="rounded-xl bg-pysim-surface-low p-4 text-xs leading-6 text-pysim-on-surface-variant">วิธีอ่านรายงาน: ใช้ผลสอบล่าสุดที่บันทึกของแต่ละบทเรียน ไม่ใช่ประวัติทุกครั้งที่สอบ • สถานะผ่านใช้เกณฑ์เดียวกับหน้าเรียน (Post-test ผ่าน {data.post_pass_percent}% และทำ Pre-test หากมี; บทที่ไม่มี Post-test ใช้แบบฝึกหัด) • ไม่นับการส่งแบบฝึกหัดข้อเดิมซ้ำเป็นหลายข้อ • พัฒนาการเทียบเปอร์เซ็นต์ก่อน–หลังเฉพาะบทเรียนที่มีผลครบคู่ • บทเรียนที่ไม่มีเกณฑ์จบ {summary.content_only} บท ไม่รวมในอัตราสำเร็จ • ระบบยังไม่ได้เก็บเวลาอ่านสไลด์ จึงไม่ใช้เวลาที่อยู่บนหน้าเป็นตัววัดผล</p>
  </div>;
}
export default function StudentProgressPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const selected = params.get('student') || '';
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [search, setSearch] = useState(query);
  const [revision, setRevision] = useState(0);
  const updateParams = patch => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key)); setParams(next); };
  return <div className="min-h-screen bg-pysim-surface"><AdminNavbar /><main className="mx-auto max-w-[1500px] space-y-6 px-4 pb-12 pt-24 sm:px-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-pysim-on-surface">ความคืบหน้าผู้เรียน</h1><p className="mt-2 text-sm text-pysim-on-surface-variant">ดูผลการเรียนรายบุคคลและติดตามบทเรียนที่ควรทบทวน</p></div><button onClick={() => setRevision(value => value + 1)} className="inline-flex w-fit items-center gap-2 rounded-xl border border-pysim-outline-variant/50 bg-white px-4 py-2.5 text-sm text-pysim-on-surface-variant"><RefreshCw size={16} />รีเฟรชข้อมูล</button></header>
    <form className="flex gap-2" onSubmit={event => { event.preventDefault(); updateParams({ q: search.trim(), page: 1 }); }}><label className="relative min-w-0 flex-1 sm:max-w-md"><Search size={17} className="absolute left-3 top-3 text-pysim-outline" /><input aria-label="ค้นหาผู้เรียน" className={`${fieldClass} w-full pl-10`} value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล" /></label><button type="submit" className="rounded-xl bg-pysim-primary px-5 py-2 text-sm font-semibold text-white">ค้นหา</button></form>
    <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><Roster key={`${query}:${page}:${revision}`} query={query} page={page} selected={selected} onSelect={id => updateParams({ student: id })} onPage={number => updateParams({ page: number })} />
      {selected ? <StudentReport key={`${selected}:${revision}`} id={selected} /> : <div className="rounded-2xl border border-dashed border-pysim-outline-variant bg-white px-6 py-20 text-center"><GraduationCap size={40} className="mx-auto mb-4 text-pysim-primary" /><h2 className="text-lg font-bold text-pysim-on-surface-variant">เลือกผู้เรียนเพื่อดูสรุป</h2><p className="mt-2 text-sm text-pysim-on-surface-variant">เลือกชื่อจากรายชื่อผู้เรียน หรือค้นหาด้วยชื่อและอีเมล</p></div>}
    </div>
  </main></div>;
}
