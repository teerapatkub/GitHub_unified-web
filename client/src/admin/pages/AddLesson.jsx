import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus, Trash2, Upload, Loader2, ChevronUp, ChevronDown,
  BookOpen, ClipboardList, FileQuestion, Image,
  CheckCircle2, Circle, GripVertical, X, Save,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const UPLOAD_API = "http://localhost:3001/api/upload";

/* ══════════════════════════════════════════════
   Upload Button — สไตล์เดียวกับ ThemePage
══════════════════════════════════════════════ */
function UploadButton({ onUploaded, accept = "image/*,video/*", label }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(UPLOAD_API, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "อัปโหลดไม่สำเร็จ"); return; }
      onUploaded(data.url);
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-dashed border-cyan-300 bg-cyan-50 text-cyan-600 rounded-xl text-xs font-semibold hover:bg-cyan-100 transition disabled:opacity-50 whitespace-nowrap"
      >
        {loading
          ? <><Loader2 size={13} className="animate-spin" /> กำลังอัปโหลด...</>
          : <><Upload size={13} /> {label || "เลือกไฟล์"}</>
        }
      </button>
    </>
  );
}

/* ══════════════════════════════════════════════
   Section Card — header gradient + white body
══════════════════════════════════════════════ */
function SectionCard({ icon: Icon, title, gradient, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${gradient} p-5 flex items-center gap-3`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {/* White Body */}
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Form Field Label
══════════════════════════════════════════════ */
function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════════
   Input / Textarea — เดียวกับ ThemePage
══════════════════════════════════════════════ */
const inputCls =
  "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition bg-white";

const textareaCls =
  "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition resize-none bg-white";

/* ══════════════════════════════════════════════
   Add Row Button
══════════════════════════════════════════════ */
function AddBtn({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-sm font-semibold hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition"
    >
      <Plus size={15} /> {label}
    </button>
  );
}

/* ════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════ */
export default function AddLesson() {
  const { t } = useTranslation();

  const [lessonNo, setLessonNo] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");

  const [slides, setSlides] = useState([
    { id: 1, title: "", content: "", mediaUrl: "", mediaType: "image", caption: "" },
  ]);
  const [preQuestions, setPreQuestions] = useState([
    { id: 1, question: "", options: ["", "", "", ""], correct: 0 },
  ]);
  const [postQuestions, setPostQuestions] = useState([
    { id: 1, type: "fill", question: "", answer: "", options: ["", "", "", ""], correct: 0 },
  ]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Slide helpers ── */
  const addSlide    = () => setSlides((s) => [...s, { id: Date.now(), title: "", content: "", mediaUrl: "", mediaType: "image", caption: "" }]);
  const removeSlide = (id) => setSlides((s) => s.filter((x) => x.id !== id));
  const updateSlide = (id, key, val) => setSlides((s) => s.map((x) => x.id === id ? { ...x, [key]: val } : x));
  const moveSlide   = (idx, dir) => {
    const arr = [...slides], target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setSlides(arr);
  };

  /* ── Pre-Test helpers ── */
  const addPreQ          = () => setPreQuestions((q) => [...q, { id: Date.now(), question: "", options: ["", "", "", ""], correct: 0 }]);
  const removePreQ       = (id) => setPreQuestions((q) => q.filter((x) => x.id !== id));
  const updatePreQ       = (id, key, val) => setPreQuestions((q) => q.map((x) => x.id === id ? { ...x, [key]: val } : x));
  const updatePreOption  = (qid, idx, val) => setPreQuestions((q) => q.map((x) => {
    if (x.id !== qid) return x;
    const opts = [...x.options]; opts[idx] = val; return { ...x, options: opts };
  }));

  /* ── Post-Test helpers ── */
  const addPostQ         = () => setPostQuestions((q) => [...q, { id: Date.now(), type: "fill", question: "", answer: "", options: ["", "", "", ""], correct: 0 }]);
  const removePostQ      = (id) => setPostQuestions((q) => q.filter((x) => x.id !== id));
  const updatePostQ      = (id, key, val) => setPostQuestions((q) => q.map((x) => x.id === id ? { ...x, [key]: val } : x));
  const updatePostOption = (qid, idx, val) => setPostQuestions((q) => q.map((x) => {
    if (x.id !== qid) return x;
    const opts = [...x.options]; opts[idx] = val; return { ...x, options: opts };
  }));

  /* ── Save ── */
  const handleSave = async () => {
    if (!lessonTitle.trim()) { alert(t("addLesson.alertTitle")); return; }
    setSaving(true);
    try {
      const payload = { lessonNo, lessonTitle, lessonDesc, slides, preQuestions, postQuestions };
      console.log("Lesson payload:", payload);
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  /* ════ RENDER ════ */
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-6">

        {/* ── Page Title ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("addLesson.pageTitle", "เพิ่มบทเรียน")}</h1>
            <p className="text-slate-500 text-sm mt-1">{t("addLesson.pageSubtitle", "สร้างสไลด์บทเรียน โจทย์แบบทดสอบก่อนเรียนและหลังเรียน")}</p>
          </div>
          <SaveButton saving={saving} saved={saved} onClick={handleSave} t={t} />
        </div>

        {/* ══ SECTION 1 — ข้อมูลบทเรียน ══ */}
        <SectionCard icon={BookOpen} title={t("addLesson.sectionInfo", "ข้อมูลบทเรียน")} gradient="from-amber-400 to-orange-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>{t("addLesson.lessonNo", "บทที่")}</FieldLabel>
              <input value={lessonNo} onChange={(e) => setLessonNo(e.target.value)} placeholder="1" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>{t("addLesson.lessonTitle", "ชื่อบทเรียน")}</FieldLabel>
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder={t("addLesson.lessonTitlePlaceholder", "เช่น เริ่มต้นกับ Python")}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <FieldLabel>{t("addLesson.lessonDesc", "คำอธิบาย")}</FieldLabel>
            <textarea
              value={lessonDesc}
              onChange={(e) => setLessonDesc(e.target.value)}
              rows={2}
              placeholder={t("addLesson.lessonDescPlaceholder", "คำอธิบายสั้น ๆ ของบทเรียนนี้...")}
              className={textareaCls}
            />
          </div>
        </SectionCard>

        {/* ══ SECTION 2 — สไลด์บทเรียน ══ */}
        <SectionCard icon={Image} title={t("addLesson.sectionSlides", "สไลด์บทเรียน")} gradient="from-cyan-500 to-blue-500">
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div key={slide.id} className="border-2 border-slate-100 rounded-xl p-4 bg-slate-50 hover:border-cyan-200 transition">
                {/* Slide header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg">
                      {t("addLesson.slide", "สไลด์ที่")} {idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSlide(idx, -1)} disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 disabled:opacity-30 transition">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 disabled:opacity-30 transition">
                      <ChevronDown size={14} />
                    </button>
                    {slides.length > 1 && (
                      <button type="button" onClick={() => removeSlide(slide.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>{t("addLesson.slideTitle", "หัวข้อสไลด์")}</FieldLabel>
                    <input value={slide.title} onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                      placeholder={t("addLesson.slideTitlePlaceholder", "เช่น ตัวอย่างการใช้ print()")} className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>{t("addLesson.mediaType", "ประเภทสื่อ")}</FieldLabel>
                    <select value={slide.mediaType} onChange={(e) => updateSlide(slide.id, "mediaType", e.target.value)}
                      className={inputCls}>
                      <option value="image">{t("addLesson.mediaImage", "รูปภาพ")}</option>
                      <option value="gif">{t("addLesson.mediaGif", "GIF")}</option>
                      <option value="video">{t("addLesson.mediaVideo", "วิดีโอ")}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <FieldLabel>{t("addLesson.slideContent", "เนื้อหา / คำอธิบาย")}</FieldLabel>
                  <textarea value={slide.content} onChange={(e) => updateSlide(slide.id, "content", e.target.value)}
                    rows={3} placeholder={t("addLesson.slideContentPlaceholder", "อธิบายเนื้อหาของสไลด์นี้...")}
                    className={textareaCls} />
                </div>

                <div className="mt-3">
                  <FieldLabel>{t("addLesson.mediaUpload", "อัปโหลดไฟล์สื่อ")}</FieldLabel>
                  <div className="flex items-center gap-3 flex-wrap">
                    <UploadButton
                      accept={slide.mediaType === "video" ? "video/*,image/gif" : "image/*"}
                      onUploaded={(url) => updateSlide(slide.id, "mediaUrl", url)}
                      label={t("addLesson.chooseFile", "เลือกไฟล์")}
                    />
                    {slide.mediaUrl && (
                      <div className="relative group">
                        {slide.mediaType === "video"
                          ? <video src={`http://localhost:3001${slide.mediaUrl}`} className="h-20 w-32 object-cover rounded-xl border-2 border-slate-200" controls />
                          : <img src={`http://localhost:3001${slide.mediaUrl}`} alt="preview" className="h-20 w-32 object-cover rounded-xl border-2 border-slate-200" />
                        }
                        <button type="button" onClick={() => updateSlide(slide.id, "mediaUrl", "")}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                          <X size={11} />
                        </button>
                      </div>
                    )}
                    {slide.mediaUrl && (
                      <input value={slide.caption} onChange={(e) => updateSlide(slide.id, "caption", e.target.value)}
                        placeholder={t("addLesson.captionPlaceholder", "คำอธิบายภาพ...")}
                        className="flex-1 min-w-[160px] border-2 border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition bg-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddBtn onClick={addSlide} label={t("addLesson.addSlide", "+ เพิ่มสไลด์")} />
        </SectionCard>

        {/* ══ SECTION 3 — Pre-Test ══ */}
        <SectionCard icon={ClipboardList} title={t("addLesson.sectionPreTest", "แบบทดสอบก่อนเรียน (Pre-Test)")} gradient="from-violet-500 to-purple-600">
          <p className="text-xs text-slate-400 -mt-2">{t("addLesson.preTestDesc", "ข้อสอบปรนัย 4 ตัวเลือก — คลิกวงกลมหน้าตัวเลือกเพื่อตั้งเป็นคำตอบที่ถูก")}</p>
          <div className="space-y-4">
            {preQuestions.map((q, idx) => (
              <QuestionCard key={q.id} q={q} idx={idx} accentClass="purple"
                onRemove={() => removePreQ(q.id)} canRemove={preQuestions.length > 1}
                onUpdateQ={(key, val) => updatePreQ(q.id, key, val)}
                onUpdateOption={(i, val) => updatePreOption(q.id, i, val)} t={t} />
            ))}
          </div>
          <AddBtn onClick={addPreQ} label={t("addLesson.addQuestion", "+ เพิ่มคำถาม")} />
        </SectionCard>

        {/* ══ SECTION 4 — Post-Test ══ */}
        <SectionCard icon={FileQuestion} title={t("addLesson.sectionPostTest", "แบบทดสอบหลังเรียน (Post-Test)")} gradient="from-emerald-500 to-teal-600">
          <p className="text-xs text-slate-400 -mt-2">{t("addLesson.postTestDesc", "รองรับทั้งแบบ เติมคำ และ ปรนัย")}</p>
          <div className="space-y-4">
            {postQuestions.map((q, idx) => (
              <PostQuestionCard key={q.id} q={q} idx={idx}
                onRemove={() => removePostQ(q.id)} canRemove={postQuestions.length > 1}
                onUpdateQ={(key, val) => updatePostQ(q.id, key, val)}
                onUpdateOption={(i, val) => updatePostOption(q.id, i, val)} t={t} />
            ))}
          </div>
          <AddBtn onClick={addPostQ} label={t("addLesson.addQuestion", "+ เพิ่มคำถาม")} />
        </SectionCard>

        {/* ── Bottom Save ── */}
        <div className="flex justify-end pt-2">
          <SaveButton saving={saving} saved={saved} onClick={handleSave} t={t} large />
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Save Button Component
══════════════════════════════════════════════ */
function SaveButton({ saving, saved, onClick, t, large }) {
  const sizeClass = large ? "px-10 py-3.5 text-base" : "px-6 py-2.5 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-2 ${sizeClass} rounded-xl font-bold transition shadow-md
        ${saved
          ? "bg-emerald-500 text-white shadow-emerald-200"
          : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 shadow-blue-200"
        } disabled:opacity-60`}
    >
      {saving
        ? <><Loader2 size={16} className="animate-spin" /> {t("addLesson.saving", "กำลังบันทึก...")}</>
        : saved
        ? <><CheckCircle2 size={16} /> {t("addLesson.saved", "บันทึกแล้ว!")}</>
        : <><Save size={16} /> {t("addLesson.save", "บันทึกบทเรียน")}</>
      }
    </button>
  );
}

/* ══════════════════════════════════════════════
   Pre-Test Question Card
══════════════════════════════════════════════ */
function QuestionCard({ q, idx, onRemove, canRemove, onUpdateQ, onUpdateOption, t }) {
  return (
    <div className="border-2 border-violet-100 rounded-xl p-4 bg-violet-50/50 hover:border-violet-200 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-violet-600 bg-violet-100 px-2.5 py-0.5 rounded-lg">
          {t("addLesson.question", "คำถาม")} {idx + 1}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <input value={q.question} onChange={(e) => onUpdateQ("question", e.target.value)}
        placeholder={t("addLesson.questionPlaceholder", "พิมพ์คำถามที่นี่...")}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-white mb-3" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button type="button" onClick={() => onUpdateQ("correct", i)}
              className={`flex-shrink-0 transition ${q.correct === i ? "ring-2 ring-violet-400 rounded-full" : ""}`}>
              {q.correct === i
                ? <CheckCircle2 size={18} className="text-violet-500" />
                : <Circle size={18} className="text-slate-300" />}
            </button>
            <input value={opt} onChange={(e) => onUpdateOption(i, e.target.value)}
              placeholder={`${t("addLesson.option", "ตัวเลือก")} ${i + 1}`}
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 transition bg-white" />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">{t("addLesson.clickToCorrect", "คลิกที่วงกลมเพื่อตั้งเป็นคำตอบที่ถูกต้อง")}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Post-Test Question Card
══════════════════════════════════════════════ */
function PostQuestionCard({ q, idx, onRemove, canRemove, onUpdateQ, onUpdateOption, t }) {
  return (
    <div className="border-2 border-emerald-100 rounded-xl p-4 bg-emerald-50/50 hover:border-emerald-200 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
          {t("addLesson.question", "คำถาม")} {idx + 1}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-3">
        {["fill", "choice"].map((type) => (
          <button key={type} type="button" onClick={() => onUpdateQ("type", type)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              q.type === type
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-white border-2 border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
            }`}>
            {type === "fill" ? t("addLesson.typeFill", "เติมคำ") : t("addLesson.typeChoice", "ปรนัย")}
          </button>
        ))}
      </div>

      <input value={q.question} onChange={(e) => onUpdateQ("question", e.target.value)}
        placeholder={t("addLesson.questionPlaceholder", "พิมพ์คำถามที่นี่...")}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition bg-white mb-3" />

      {q.type === "fill" ? (
        <div>
          <FieldLabel>{t("addLesson.correctAnswer", "คำตอบที่ถูกต้อง")}</FieldLabel>
          <input value={q.answer} onChange={(e) => onUpdateQ("answer", e.target.value)}
            placeholder={t("addLesson.answerPlaceholder", "พิมพ์คำตอบ...")}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition bg-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button type="button" onClick={() => onUpdateQ("correct", i)}
                className={`flex-shrink-0 transition ${q.correct === i ? "ring-2 ring-emerald-400 rounded-full" : ""}`}>
                {q.correct === i
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : <Circle size={18} className="text-slate-300" />}
              </button>
              <input value={opt} onChange={(e) => onUpdateOption(i, e.target.value)}
                placeholder={`${t("addLesson.option", "ตัวเลือก")} ${i + 1}`}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition bg-white" />
            </div>
          ))}
          <p className="text-xs text-slate-400 sm:col-span-2">{t("addLesson.clickToCorrect", "คลิกที่วงกลมเพื่อตั้งเป็นคำตอบที่ถูกต้อง")}</p>
        </div>
      )}
    </div>
  );
}
