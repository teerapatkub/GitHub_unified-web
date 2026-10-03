import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import { API_BASE, assetUrl } from '../../config/api';

const pages = [
  { path: 'info', label: 'ข้อมูลบทเรียน' },
  { path: 'slides', label: 'เพิ่มสไลด์สอน' },
  { path: 'pre-test', label: 'Pre-test' },
  { path: 'post-test', label: 'Post-test' },
];
const inputClass = 'w-full min-w-0 rounded-xl border-2 border-pysim-outline-variant/50 bg-white px-4 py-3 text-sm text-pysim-on-surface focus:outline-none focus:border-pysim-primary';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-pysim-outline-variant/50 bg-white px-4 py-3 text-sm font-semibold text-pysim-on-surface-variant hover:bg-pysim-primary-fixed/30 disabled:opacity-50';
const blankInfo = { moduleId: '', orderIndex: '', title: '', description: '' };
const newSlide = () => ({ id: crypto.randomUUID(), title: '', content: '', mediaUrl: '', mediaType: 'image' });
const newQuestion = (type = 'choice') => ({ id: crypto.randomUUID(), type, question: '', options: ['', '', '', ''], correct: 0, answer: '' });

function useDraft(key, create) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? create(); } catch { return create(); }
  });
  useEffect(() => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Retain the in-memory draft if storage is unavailable. */ }
  }, [key, value]);
  return [value, setValue];
}
function currentUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}
async function request(path = '', body, signal) {
  const res = await fetch(`${API_BASE}/api/admin/lessons${path}`, {
    method: body ? 'POST' : 'GET', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser().admin_token || ''}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(data?.error || 'เชื่อมต่อระบบบทเรียนไม่สำเร็จ กรุณาตรวจสอบเซิร์ฟเวอร์');
  return data;
}
function Field({ title, children }) {
  return <label className="block min-w-0"><span className="mb-2 block text-sm font-semibold text-pysim-on-surface-variant">{title}</span>{children}</label>;
}
export default function AddLesson() {
  const { '*': path } = useParams();
  const [params] = useSearchParams();
  const page = pages.find(item => item.path === path);
  if (!page) return <Navigate to={`/admin/add-lesson/info${params.size ? `?${params}` : ''}`} replace />;
  return <LessonEditor key={`${path}:${path === 'info' ? 'new' : params.get('lesson') || 'new'}`} page={page} />;
}
function LessonEditor({ page }) {
  const [params, setParams] = useSearchParams();
  const lessonId = params.get('lesson') || '';
  const isInfo = page.path === 'info';
  const isSlides = page.path === 'slides';
  const key = `admin-lesson:${currentUser().user_id}:${page.path}:${isInfo ? 'new' : lessonId}`;
  const createDraft = () => isInfo ? blankInfo : [isSlides ? newSlide() : newQuestion(page.path === 'post-test' ? 'fill' : 'choice')];
  const [draft, setDraft] = useDraft(key, createDraft);
  const [catalog, setCatalog] = useState({ modules: [], lessons: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [revision, setRevision] = useState(0);
  const inFlight = useRef(false);
  const selected = catalog.lessons.find(lesson => String(lesson.lesson_id) === lessonId);
  const busy = saving || uploading;
  useEffect(() => {
    const controller = new AbortController();
    request('', undefined, controller.signal).then(data => { setCatalog(data); setLoadError(''); }).catch(error => {
      if (error.name !== 'AbortError') setLoadError(error.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  const updateEntry = (id, patch) => setDraft(rows => rows.map(row => row.id === id ? { ...row, ...patch } : row));
  const updateInfo = patch => setDraft(value => ({ ...value, ...patch }));
  const move = (index, direction) => setDraft(rows => {
    const next = [...rows];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    return next;
  });
  const upload = async (id, file) => {
    if (!file) return;
    setUploading(true); setNotice(null);
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
      updateEntry(id, { mediaUrl: data.url });
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setUploading(false); }
  };
  const save = async event => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setSaving(true); setNotice(null);
    try {
      if (isInfo) {
        const result = await request('', { ...draft, moduleId: Number(draft.moduleId), orderIndex: Number(draft.orderIndex) });
        setDraft(blankInfo);
        setParams({ lesson: String(result.lesson_id), created: '1' });
      } else {
        if (!selected) throw new Error('กรุณาเลือกบทเรียนก่อนบันทึก');
        const section = isSlides ? 'slides' : page.path === 'pre-test' ? 'pre' : 'post';
        const result = await request(`/${lessonId}/${section}`, { entries: draft });
        setDraft(createDraft());
        setNotice({ text: `บันทึก${isSlides ? 'สไลด์' : page.label}แล้ว ${result.added} รายการใน “${selected.title}” ผู้เรียนจะเห็นเมื่อเปิดบทเรียนครั้งถัดไปหรือรีเฟรชหน้า` });
      }
      setRevision(value => value + 1);
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { inFlight.current = false; setSaving(false); }
  };
  return <div className="min-h-screen bg-pysim-surface">
    <AdminNavbar />
    <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-24">
      <header><h1 className="text-2xl font-bold text-pysim-on-surface">{page.label}</h1><p className="mt-2 text-sm text-pysim-on-surface-variant">เลือกหน้าเพื่อเพิ่มข้อมูลแต่ละส่วน ร่างที่ยังไม่บันทึกจะเก็บไว้ในแท็บนี้</p></header>
      <p className="rounded-xl bg-pysim-primary-fixed/30 p-4 text-sm leading-6 text-pysim-primary">ข้อมูลที่บันทึกจะแสดงในฝั่งผู้เรียน: Pre-test → สไลด์บทเรียน → Post-test โดยยังใช้เงื่อนไขเลเวลและการผ่านบทก่อนหน้าตามเดิม</p>
      <nav aria-label="จัดการบทเรียน" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pages.map(item => <NavLink key={item.path} to={`/admin/add-lesson/${item.path}${lessonId ? `?lesson=${lessonId}` : ''}`}
          onClick={event => { if (busy) event.preventDefault(); }} aria-disabled={busy}
          className={({ isActive }) => `rounded-xl border px-4 py-4 text-center text-sm font-bold transition ${isActive ? 'border-pysim-primary bg-pysim-primary text-white shadow-md' : 'border-pysim-outline-variant/50 bg-white text-pysim-on-surface-variant hover:border-pysim-primary'}`}>
          {item.label}</NavLink>)}
      </nav>
      {loadError && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{loadError}<button type="button" className="ml-3 underline" onClick={() => setRevision(value => value + 1)}>ลองโหลดใหม่</button></div>}
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`rounded-xl p-4 ${notice.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{notice.text}</p>}
      {params.get('created') && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-700">สร้างบทเรียน{selected ? ` “${selected.title}”` : ''}แล้วและแสดงในรายการบทเรียนของผู้เรียน เลือกหน้าเพิ่มสไลด์สอน, Pre-test หรือ Post-test เพื่อเพิ่มเนื้อหาให้บทเรียนนี้</p>}
      {!isInfo && <section className="space-y-3 rounded-2xl border border-pysim-outline-variant/50 bg-white p-5">
        <Field title="เลือกบทเรียน"><select required value={lessonId} disabled={busy || loading} className={inputClass} onChange={event => setParams(event.target.value ? { lesson: event.target.value } : {})}>
          <option value="">{loading ? 'กำลังโหลดบทเรียน...' : 'เลือกบทเรียนที่จะเพิ่มข้อมูล'}</option>
          {catalog.modules.map(module => <optgroup key={module.module_id} label={module.title}>{catalog.lessons.filter(lesson => lesson.module_id === module.module_id).map(lesson => <option key={lesson.lesson_id} value={lesson.lesson_id}>{lesson.order_index}. {lesson.title}</option>)}</optgroup>)}
        </select></Field>
        {selected ? <p className="text-sm text-pysim-on-surface-variant">มีสไลด์ {selected.slide_count} รายการ · Pre-test {selected.pre_count} ข้อ · Post-test {selected.post_count} ข้อ — รายการใหม่จะเพิ่มต่อท้าย</p> : <p className="text-sm text-pysim-on-surface-variant">หากยังไม่มีบทเรียน ให้สร้างที่หน้า “ข้อมูลบทเรียน” ก่อน</p>}
      </section>}
      <form onSubmit={save}>
        <fieldset disabled={busy || loading || !!loadError || (!isInfo && !selected)} className="min-w-0 overflow-hidden rounded-2xl border border-pysim-outline-variant/30 bg-white whisper-shadow disabled:opacity-60">
          <div className="python-gradient p-5"><h2 className="text-lg font-bold text-white">{isInfo ? 'สร้างบทเรียนใหม่' : page.label}</h2></div>
          <div className="space-y-5 p-4 sm:p-6">
            {isInfo ? <>
              <Field title="หมวดบทเรียน"><select required className={inputClass} value={draft.moduleId} onChange={event => updateInfo({ moduleId: event.target.value })}><option value="">เลือกหมวดบทเรียน</option>{catalog.modules.map(module => <option key={module.module_id} value={module.module_id}>{module.title}</option>)}</select></Field>
              {draft.moduleId && <p className="text-sm text-pysim-on-surface-variant">ลำดับที่มีแล้ว: {catalog.lessons.filter(lesson => String(lesson.module_id) === draft.moduleId).map(lesson => lesson.order_index).join(', ') || 'ยังไม่มี'}</p>}
              <div className="grid gap-4 sm:grid-cols-3"><Field title="ลำดับบทเรียน"><input required type="number" min="1" step="1" className={inputClass} value={draft.orderIndex} onChange={event => updateInfo({ orderIndex: event.target.value })} /></Field>
                <div className="sm:col-span-2"><Field title="ชื่อบทเรียน"><input required maxLength={100} className={inputClass} value={draft.title} onChange={event => updateInfo({ title: event.target.value })} placeholder="เช่น เริ่มต้นกับ Python" /></Field></div></div>
              <Field title="คำอธิบายบทเรียน"><textarea rows={3} maxLength={10000} className={inputClass} value={draft.description} onChange={event => updateInfo({ description: event.target.value })} /></Field>
            </> : <>
              {!isSlides && <p className="text-sm text-pysim-on-surface-variant">เพิ่มข้อสอบแบบเติมคำหรือปรนัย 4 ตัวเลือก สำหรับปรนัยให้เลือกวงกลมหน้าคำตอบที่ถูกต้อง</p>}
              {draft.map((entry, index) => <section key={entry.id} className="min-w-0 space-y-4 rounded-xl border border-pysim-outline-variant/50 bg-pysim-surface p-4">
                <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-pysim-on-surface-variant">{isSlides ? 'สไลด์' : 'คำถาม'}ที่ {index + 1}</h3><div className="flex gap-1">
                  <button type="button" className="rounded-lg p-2 hover:bg-pysim-surface-container disabled:opacity-30" aria-label="เลื่อนขึ้น" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
                  <button type="button" className="rounded-lg p-2 hover:bg-pysim-surface-container disabled:opacity-30" aria-label="เลื่อนลง" disabled={index === draft.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
                  <button type="button" className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="ลบรายการร่าง" disabled={draft.length === 1} onClick={() => setDraft(rows => rows.filter(row => row.id !== entry.id))}><Trash2 size={16} /></button></div></div>
                {isSlides ? <>
                  <Field title="หัวข้อสไลด์"><input required maxLength={255} className={inputClass} value={entry.title} onChange={event => updateEntry(entry.id, { title: event.target.value })} /></Field>
                  <Field title="เนื้อหา / คำอธิบาย"><textarea rows={4} maxLength={20000} className={inputClass} value={entry.content} onChange={event => updateEntry(entry.id, { content: event.target.value })} /></Field>
                  <Field title="ประเภทสื่อ"><select className={inputClass} value={entry.mediaType} onChange={event => updateEntry(entry.id, { mediaType: event.target.value })}><option value="image">รูปภาพ</option><option value="gif">GIF</option><option value="video">วิดีโอ</option></select></Field>
                  <Field title="อัปโหลดไฟล์สื่อ (ไม่บังคับ)"><input type="file" className="block w-full min-w-0 text-sm" accept={entry.mediaType === 'video' ? 'video/*' : 'image/*'} onChange={event => { upload(entry.id, event.target.files?.[0]); event.target.value = ''; }} /></Field>
                  <Field title="หรือใส่ URL สื่อ"><input maxLength={255} className={inputClass} value={entry.mediaUrl} onChange={event => updateEntry(entry.id, { mediaUrl: event.target.value })} placeholder="https://... หรือ /uploads/..." /></Field>
                  {entry.mediaUrl && (entry.mediaType === 'video' ? <video src={assetUrl(entry.mediaUrl)} controls className="max-h-64 max-w-full rounded-xl" /> : <img src={assetUrl(entry.mediaUrl)} alt="ตัวอย่างสไลด์" className="max-h-64 max-w-full rounded-xl object-contain" />)}
                </> : <>
                  <Field title="ประเภทคำถาม"><select className={inputClass} value={entry.type} onChange={event => updateEntry(entry.id, { type: event.target.value })}><option value="fill">เติมคำ</option><option value="choice">ปรนัย</option></select></Field>
                  <Field title="คำถาม"><textarea required rows={2} maxLength={10000} className={inputClass} value={entry.question} onChange={event => updateEntry(entry.id, { question: event.target.value })} /></Field>
                  {entry.type === 'fill' ? <Field title="คำตอบที่ถูกต้อง"><input required maxLength={10000} className={inputClass} value={entry.answer} onChange={event => updateEntry(entry.id, { answer: event.target.value })} /></Field> : <div className="grid gap-3 sm:grid-cols-2">{entry.options.map((option, optionIndex) => <div key={optionIndex} className="flex min-w-0 items-center gap-2">
                    <input type="radio" className="h-5 w-5 shrink-0 accent-pysim-primary" name={`correct-${entry.id}`} aria-label={`เลือกตัวเลือก ${optionIndex + 1} เป็นคำตอบที่ถูกต้อง`} checked={entry.correct === optionIndex} onChange={() => updateEntry(entry.id, { correct: optionIndex })} />
                    <input required maxLength={255} className={inputClass} aria-label={`ตัวเลือก ${optionIndex + 1}`} placeholder={`ตัวเลือก ${optionIndex + 1}`} value={option} onChange={event => updateEntry(entry.id, { options: entry.options.map((value, i) => i === optionIndex ? event.target.value : value) })} />
                  </div>)}</div>}
                </>}
              </section>)}
              <button type="button" className={buttonClass} disabled={draft.length >= 100} onClick={() => setDraft(rows => [...rows, isSlides ? newSlide() : newQuestion(page.path === 'post-test' ? 'fill' : 'choice')])}><Plus size={16} />{isSlides ? 'เพิ่มสไลด์' : 'เพิ่มคำถาม'}</button>
            </>}
            <div className="flex justify-end border-t border-pysim-outline-variant/30 pt-5"><button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pysim-primary px-6 py-3 font-bold text-white hover:bg-pysim-on-primary-fixed sm:w-auto"><Save size={18} />{saving ? 'กำลังบันทึก...' : uploading ? 'กำลังอัปโหลด...' : `บันทึก${isSlides ? 'สไลด์' : page.label}`}</button></div>
          </div>
        </fieldset>
      </form>
      {isInfo && <section className="rounded-2xl border border-pysim-outline-variant/50 bg-white p-5">
        <h2 className="text-lg font-bold text-pysim-on-surface">บทเรียนในระบบ ({catalog.lessons.length})</h2>
        <p className="mt-1 text-sm text-pysim-on-surface-variant">เลือกบทเรียนเพื่อเพิ่มเนื้อหา รายการใหม่จะเพิ่มต่อท้ายข้อมูลเดิม</p>
        <div className="mt-4 space-y-3">{catalog.modules.map(module => <details key={module.module_id} className="rounded-xl border border-pysim-outline-variant/50 p-4" open={selected?.module_id === module.module_id || undefined}>
          <summary className="cursor-pointer font-semibold text-pysim-primary">{module.title}</summary>
          <div className="mt-3 space-y-3">{catalog.lessons.filter(lesson => lesson.module_id === module.module_id).map(lesson => <article key={lesson.lesson_id} className="rounded-xl bg-pysim-surface p-4">
            <h3 className="font-semibold">{lesson.order_index}. {lesson.title}</h3>
            <p className="mt-1 text-sm text-pysim-on-surface-variant">สไลด์ {lesson.slide_count} รายการ · Pre-test {lesson.pre_count} ข้อ · Post-test {lesson.post_count} ข้อ</p>
            <div className="mt-3 flex flex-wrap gap-2">{pages.filter(item => item.path !== 'info').map(item => <NavLink key={item.path} to={`/admin/add-lesson/${item.path}?lesson=${lesson.lesson_id}`} className={buttonClass}>{item.label}</NavLink>)}</div>
          </article>)}</div>
        </details>)}</div>
      </section>}
    </main>
  </div>;
}
