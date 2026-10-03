import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X, Pencil, Trash2, ChevronDown, Upload, Loader2 } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { API_BASE, assetUrl } from '../../config/api.js';
const UPLOAD_API = `${API_BASE}/api/upload`;
const API = `${API_BASE}/api/themes`;

const adminHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.admin_token ? { Authorization: `Bearer ${user.admin_token}` } : {};
  } catch { return {}; }
};

async function readResponse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(data?.error || `ติดต่อระบบจัดการร้านค้าไม่สำเร็จ (${res.status}) กรุณาตรวจสอบว่าเซิร์ฟเวอร์เป็นเวอร์ชันล่าสุด`);
  if (!isJson) throw new Error('เซิร์ฟเวอร์ส่งข้อมูลไม่ถูกต้อง กรุณาลองใหม่');
  return data;
}

const isImage = (value) => /^(https?:\/\/|\/)/i.test(value || '');


/* ── ปุ่มอัปโหลดไฟล์จากคอมพ์ ── */
function UploadButton({ onUploaded, accept = "image/*" }) {
  const inputRef   = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch(UPLOAD_API, { method: "POST", body: form });
      const data = await readResponse(res);
      onUploaded(data.url);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-dashed border-pysim-primary-fixed bg-pysim-primary-fixed/30 text-pysim-primary rounded-xl text-xs font-semibold hover:bg-pysim-primary-fixed/60 transition disabled:opacity-50 whitespace-nowrap"
      >
        {loading
          ? <><Loader2 size={13} className="animate-spin" /> กำลังอัปโหลด...</>
          : <><Upload size={13} /> เลือกไฟล์</>
        }
      </button>
    </>
  );
}

const TABS = [
  { key: "effect",             label: "เพิ่มเอฟเฟก" },
  { key: "ui_theme",           label: "เพิ่มธีม" },
  { key: "profile_frame",      label: "เพิ่มกรอบโปรไฟล์" },
  { key: "profile_background", label: "เพิ่มพื้นหลังโปรไฟล์" },
];


const EP = {
  effect:             { get: API,                   post: API,                   put: (id) => `${API}/${id}` },
  ui_theme:           { get: `${API}/themes`,        post: `${API}/themes`,        put: (id) => `${API}/themes/${id}` },
  profile_frame:      { get: `${API}/frames`,        post: `${API}/frames`,        put: (id) => `${API}/frames/${id}` },
  profile_background: { get: `${API}/backgrounds`,   post: `${API}/backgrounds`,   put: (id) => `${API}/backgrounds/${id}` },
};

const TRIGGERS = [
  { value: "click",    label: "Click " },
  { value: "hover",    label: "Hover " },
  { value: "load",     label: "On Load " },
  { value: "dblclick", label: "Double Click" },
];

const TRIGGER_COLOR = {
  click: "bg-indigo-400", hover: "bg-sky-400",
  load: "bg-emerald-400", dblclick: "bg-amber-400",
};

function parseEffects(raw) {
  try {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch { /* Legacy rows may contain no effect data. */ }
  return [];
}

function normalizeEffect(e) {
  return {
    trigger: e?.trigger || "click",
    visual: e?.visual || "💖",
    color: e?.color || "#FF69B4",
    size: e?.size ?? 24,
    duration: e?.duration ?? 800,
  };
}

const DEFAULT_EFFECT = normalizeEffect({});
const EMPTY_FORM = { name: "", description: "", price: "", asset_url: "", preview_image: "", is_active: true, effects: [] };

export default function ThemePage() {
  const [activeTab, setActiveTab]     = useState("effect");
  const [items, setItems]             = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState(null);
  const requestId = useRef(0);

  const [showEffectModal, setShowEffectModal]       = useState(false);
  const [currentEffectIndex, setCurrentEffectIndex] = useState(null);
  const [effectData, setEffectData]                 = useState(DEFAULT_EFFECT);

  const fetchItems = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch(EP[activeTab].get, { headers: adminHeaders() });
      const data = await readResponse(res);
      if (id === requestId.current) setItems((Array.isArray(data) ? data : []).map((t) => ({ ...t, is_active: t.is_active === true || Number(t.is_active) === 1, effects: parseEffects(t.effects) })));
    } catch (err) {
      if (id === requestId.current) { setMessage({ error: true, text: err.message }); setItems([]); }
    } finally { if (id === requestId.current) setLoading(false); }
  }, [activeTab]);

  const resetForm = useCallback(() => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setEffectData(DEFAULT_EFFECT);
    setCurrentEffectIndex(null);
    setShowEffectModal(false);
  }, []);

  useEffect(() => { fetchItems(); resetForm(); setMessage(null); }, [activeTab, fetchItems, resetForm]);

  const handleSave = async () => {
    if (!formData.name.trim() || formData.price === "") { setMessage({ error: true, text: 'กรุณากรอกชื่อและราคา' }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const url    = editingItem ? EP[activeTab].put(editingItem.item_id) : EP[activeTab].post;
      const method = editingItem ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({ ...formData, price: Number(formData.price) }),
      });
      await readResponse(res);
      setMessage({ error: false, text: 'บันทึกรายการเรียบร้อยแล้ว' });
      await fetchItems();
      resetForm();
    } catch (err) { setMessage({ error: true, text: err.message }); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name:          item.name || "",
      description:   item.description || "",
      price:         item.price,
      asset_url:     item.asset_url || "",
      preview_image: item.preview_image || "",
      is_active:     item.is_active ?? true,
      effects:       parseEffects(item.effects).map(normalizeEffect),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAddEffect  = () => { setEffectData(DEFAULT_EFFECT); setCurrentEffectIndex(null); setShowEffectModal(true); };
  const openEditEffect = (effect, idx) => { setEffectData(normalizeEffect(effect)); setCurrentEffectIndex(idx); setShowEffectModal(true); };

  const handleSaveEffect = () => {
    const newEffect = { ...effectData, size: Number(effectData.size), duration: Number(effectData.duration) };
    const updated   = [...formData.effects];
    if (currentEffectIndex !== null) updated[currentEffectIndex] = newEffect;
    else updated.push(newEffect);
    setFormData({ ...formData, effects: updated });
    setShowEffectModal(false);
    setCurrentEffectIndex(null);
  };

  const handleDeleteEffect = (idx) =>
    setFormData({ ...formData, effects: formData.effects.filter((_, i) => i !== idx) });

  const isEffect = activeTab === "effect";
  const hasAsset = !isEffect;
  const tabLabel = TABS.find((t) => t.key === activeTab)?.label;

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen pt-24">
        <div className="max-w-5xl mx-auto space-y-6 px-4 pb-12">

          {message && <div role={message.error ? 'alert' : 'status'} className={`rounded-xl p-4 ${message.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>}

          {/* TABS */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                disabled={saving}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-pysim-primary to-pysim-primary-container text-white shadow-md"
                    : "bg-white text-pysim-on-surface-variant shadow hover:bg-pysim-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FORM CARD */}
          <div className="bg-white rounded-2xl whisper-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-pysim-primary to-pysim-primary-container p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? `แก้ไข: ${editingItem.name}` : tabLabel}
              </h2>
              {editingItem && (
                <button
                  onClick={resetForm}
                  className="text-sm text-white bg-white/20 border border-white/30 rounded-full px-4 py-1.5 hover:bg-white/30 transition"
                >
                  เพิ่มใหม่
                </button>
              )}
            </div>

            <div className="p-8 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">ชื่อ</label>
                  <input
                    className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary focus:ring-2 focus:ring-pysim-primary-fixed transition"
                    placeholder="เช่น Neon Glow"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">ราคา (เหรียญ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary focus:ring-2 focus:ring-pysim-primary-fixed transition"
                    placeholder="เช่น 250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">คำอธิบาย</label>
                <input
                  className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary focus:ring-2 focus:ring-pysim-primary-fixed transition"
                  placeholder="อธิบาย"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {hasAsset && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ── Asset URL ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">URL (PNG / GIF)</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        className="min-w-0 flex-1 border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary focus:ring-2 focus:ring-pysim-primary-fixed transition"
                        placeholder="https://... หรืออัปโหลดไฟล์"
                        value={formData.asset_url}
                        onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
                      />
                      <UploadButton onUploaded={(url) => setFormData({ ...formData, asset_url: url })} />
                    </div>
                    {formData.asset_url && (
                      <img src={assetUrl(formData.asset_url)} alt="asset" className="h-20 rounded-xl border-2 border-pysim-outline-variant/50 object-contain bg-pysim-surface mt-1" />
                    )}
                  </div>

                  {/* ── Preview Image URL ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">Preview Image URL</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        className="min-w-0 flex-1 border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary focus:ring-2 focus:ring-pysim-primary-fixed transition"
                        placeholder="https://... หรืออัปโหลดไฟล์"
                        value={formData.preview_image}
                        onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                      />
                      <UploadButton onUploaded={(url) => setFormData({ ...formData, preview_image: url })} />
                    </div>
                    {formData.preview_image && (
                      <img src={assetUrl(formData.preview_image)} alt="preview" className="h-20 rounded-xl border-2 border-pysim-outline-variant/50 object-contain bg-pysim-surface mt-1" />
                    )}
                  </div>
                </div>
              )}


              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-pysim-primary"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-pysim-on-surface-variant">
                  แสดงในร้านค้า
                </label>
              </div>

              {isEffect && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">
                    Effects ({formData.effects.length})
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {formData.effects.map((eff, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl border-2 border-pysim-outline-variant/50 bg-pysim-surface flex items-center justify-center cursor-pointer hover:border-pysim-primary hover:shadow-md transition group"
                        onClick={() => openEditEffect(eff, idx)}
                      >
                        <span className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${TRIGGER_COLOR[eff.trigger] || "bg-indigo-400"}`} />
                        {eff.visual?.startsWith("http")
                          ? <img src={eff.visual} alt="fx" className="w-8 h-8 object-contain" />
                          : <span className="text-2xl">{eff.visual}</span>
                        }
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEffect(idx); }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} color="#fff" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={openAddEffect}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-pysim-outline-variant flex items-center justify-center text-pysim-outline hover:border-pysim-primary hover:text-pysim-primary transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-pysim-primary to-pysim-primary-container hover:opacity-90 active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "กำลังบันทึก..." : editingItem ? `อัปเดต${tabLabel}` : tabLabel}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="bg-white rounded-2xl p-8 whisper-shadow">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{tabLabel} ทั้งหมด</h2>
              <span className="bg-gradient-to-r from-pysim-primary to-pysim-primary-container text-white text-xs font-bold px-3 py-1 rounded-full">
                {items.length}
              </span>
            </div>

            {loading ? <p role="status" className="text-center py-8">กำลังโหลดรายการ...</p> : items.length === 0 && <p className="text-center text-pysim-on-surface-variant py-8">ยังไม่มีรายการ</p>}
            <p className="mb-4 text-sm text-pysim-on-surface-variant">ต้องการซ่อนรายการ: กด Edit แล้วนำเครื่องหมาย “แสดงในร้านค้า” ออก</p>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex flex-wrap gap-3 justify-between items-center bg-pysim-surface-low rounded-xl px-4 py-4 hover:bg-pysim-surface transition"
                >
                  <div className="flex items-center gap-4">
                    {(item.preview_image || item.asset_url) && (
                      <img src={assetUrl(item.preview_image || item.asset_url)} alt="" className="w-12 h-12 rounded-lg object-cover border border-pysim-outline-variant/50 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-pysim-on-surface">{item.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.is_active ? "bg-green-100 text-green-600" : "bg-pysim-surface-container text-pysim-outline"}`}>
                          {item.is_active ? "เปิด" : "ปิด"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-pysim-on-surface-variant">{item.price} เหรียญ</span>
                        {isEffect && (
                          <>
                            <span className="text-pysim-outline">•</span>
                            <div className="flex gap-1 items-center">
                              {parseEffects(item.effects).slice(0, 5).map((e, i) => (
                                <span key={i} className="inline-flex items-center justify-center w-6 h-6 bg-white border border-pysim-outline-variant/50 rounded-md text-xs">
                                  {isImage(e.visual) ? <img src={assetUrl(e.visual)} alt="" className="h-5 w-5 object-contain" /> : e.visual}
                                </span>
                              ))}
                              {parseEffects(item.effects).length === 0 && (
                                <span className="text-xs text-pysim-outline">ไม่มีเอฟเฟกต์</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-pysim-primary-fixed/30 text-pysim-primary rounded-lg text-sm font-semibold hover:bg-pysim-primary-fixed/60 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* EFFECT MODAL */}
      {showEffectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-pysim-primary to-pysim-primary-container px-6 py-5">
              <h2 className="text-lg font-bold text-white">
                {currentEffectIndex !== null ? "แก้ไขเอฟเฟกต์" : "เพิ่มเอฟเฟกต์ใหม่"}
              </h2>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">Trigger</label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-pysim-primary transition pr-10"
                    value={effectData.trigger}
                    onChange={(e) => setEffectData({ ...effectData, trigger: e.target.value })}
                  >
                    {TRIGGERS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-pysim-outline pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">Visual — Emoji หรือ URL รูป</label>
                <div className="flex gap-3 items-center">
                  {/* preview */}
                  <div className="w-14 h-14 border-2 border-pysim-outline-variant/50 rounded-xl bg-pysim-surface flex items-center justify-center text-2xl flex-shrink-0">
                    {isImage(effectData.visual)
                      ? <img src={assetUrl(effectData.visual)} alt="" className="w-9 h-9 object-contain" />
                      : effectData.visual
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary transition"
                      placeholder="💖 หรือ https://...png"
                      value={effectData.visual}
                      onChange={(e) => setEffectData({ ...effectData, visual: e.target.value })}
                    />
                    <UploadButton
                      accept="image/png,image/gif,image/webp,image/jpeg"
                      onUploaded={(url) => setEffectData({ ...effectData, visual: url })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-12 h-10 border-2 border-pysim-outline-variant/50 rounded-lg p-0.5 cursor-pointer"
                    value={effectData.color}
                    onChange={(e) => setEffectData({ ...effectData, color: e.target.value })}
                  />
                  <div className="w-8 h-8 rounded-lg border-2 border-pysim-outline-variant/50" style={{ background: effectData.color }} />
                  <span className="text-xs text-pysim-outline font-mono">{effectData.color}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">ขนาด (px)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary transition"
                    value={effectData.size}
                    onChange={(e) => setEffectData({ ...effectData, size: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-pysim-outline">Duration (ms)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-pysim-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pysim-primary transition"
                    value={effectData.duration}
                    onChange={(e) => setEffectData({ ...effectData, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleSaveEffect}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-pysim-primary to-pysim-primary-container hover:opacity-90 transition"
              >
                บันทึก
              </button>
              <button
                onClick={() => setShowEffectModal(false)}
                className="flex-1 py-3 rounded-xl text-pysim-on-surface-variant text-sm bg-pysim-surface-low hover:bg-pysim-surface-container transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
