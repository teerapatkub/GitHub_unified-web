import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X, Pencil, Trash2, ChevronDown, Upload, Loader2 } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const UPLOAD_API = "http://localhost:3001/api/upload";

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
      const data = await res.json();
      if (!res.ok) { alert(data.error || "อัปโหลดไม่สำเร็จ"); return; }
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
        className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-dashed border-cyan-300 bg-cyan-50 text-cyan-600 rounded-xl text-xs font-semibold hover:bg-cyan-100 transition disabled:opacity-50 whitespace-nowrap"
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

const API = "http://localhost:3001/api/themes";

const EP = {
  effect:             { get: API,                   post: API,                   put: (id) => `${API}/${id}`,              del: (id) => `${API}/${id}` },
  ui_theme:           { get: `${API}/themes`,        post: `${API}/themes`,        put: (id) => `${API}/themes/${id}`,       del: (id) => `${API}/themes/${id}` },
  profile_frame:      { get: `${API}/frames`,        post: `${API}/frames`,        put: (id) => `${API}/frames/${id}`,       del: (id) => `${API}/frames/${id}` },
  profile_background: { get: `${API}/backgrounds`,   post: `${API}/backgrounds`,   put: (id) => `${API}/backgrounds/${id}`,  del: (id) => `${API}/backgrounds/${id}` },
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
    if (typeof raw === "string") return JSON.parse(raw);
  } catch (_) {}
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

  const [showEffectModal, setShowEffectModal]       = useState(false);
  const [currentEffectIndex, setCurrentEffectIndex] = useState(null);
  const [effectData, setEffectData]                 = useState(DEFAULT_EFFECT);

  const fetchItems = useCallback(async () => {
    try {
      const res  = await fetch(EP[activeTab].get);
      const data = await res.json();
      setItems((Array.isArray(data) ? data : []).map((t) => ({ ...t, effects: parseEffects(t.effects) })));
    } catch (err) { console.error(err); setItems([]); }
  }, [activeTab]);

  const resetForm = useCallback(() => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setEffectData(DEFAULT_EFFECT);
    setCurrentEffectIndex(null);
    setShowEffectModal(false);
  }, []);

  useEffect(() => { fetchItems(); resetForm(); }, [activeTab, fetchItems, resetForm]);

  const handleSave = async () => {
    if (!formData.name || formData.price === "") { alert("กรุณากรอกชื่อและราคา"); return; }
    setSaving(true);
    try {
      const url    = editingItem ? EP[activeTab].put(editingItem.item_id) : EP[activeTab].post;
      const method = editingItem ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: Number(formData.price) }),
      });
      if (!res.ok) { alert("บันทึกไม่สำเร็จ: " + await res.text()); return; }
      await fetchItems();
      resetForm();
    } catch (err) { console.error(err); alert("เกิดข้อผิดพลาด"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ลบรายการนี้?")) return;
    try {
      await fetch(EP[activeTab].del(id), { method: "DELETE" });
      fetchItems();
    } catch (err) { console.error(err); }
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

          {/* TABS */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                    : "bg-white text-gray-500 shadow hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FORM CARD */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 flex items-center justify-between">
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
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ชื่อ</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                    placeholder="เช่น Neon Glow"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ราคา (฿)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                    placeholder="เช่น 250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">คำอธิบาย</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                  placeholder="อธิบาย"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {hasAsset && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ── Asset URL ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">URL (PNG / GIF)</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                        placeholder="https://... หรืออัปโหลดไฟล์"
                        value={formData.asset_url}
                        onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
                      />
                      <UploadButton onUploaded={(url) => setFormData({ ...formData, asset_url: url })} />
                    </div>
                    {formData.asset_url && (
                      <img src={formData.asset_url} alt="asset" className="h-20 rounded-xl border-2 border-gray-200 object-contain bg-gray-50 mt-1" />
                    )}
                  </div>

                  {/* ── Preview Image URL ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview Image URL</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                        placeholder="https://... หรืออัปโหลดไฟล์"
                        value={formData.preview_image}
                        onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                      />
                      <UploadButton onUploaded={(url) => setFormData({ ...formData, preview_image: url })} />
                    </div>
                    {formData.preview_image && (
                      <img src={formData.preview_image} alt="preview" className="h-20 rounded-xl border-2 border-gray-200 object-contain bg-gray-50 mt-1" />
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
                  className="w-4 h-4 accent-cyan-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-600">
                  แสดงในร้านค้า
                </label>
              </div>

              {isEffect && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Effects ({formData.effects.length})
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {formData.effects.map((eff, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:shadow-md transition group"
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
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "กำลังบันทึก..." : editingItem ? `อัปเดต${tabLabel}` : tabLabel}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{tabLabel} ทั้งหมด</h2>
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {items.length}
              </span>
            </div>

            {items.length === 0 && <p className="text-center text-gray-300 py-8">ยังไม่มีรายการ</p>}

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex justify-between items-center bg-gray-100 rounded-xl px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {item.preview_image && (
                      <img src={item.preview_image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.is_active ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}>
                          {item.is_active ? "เปิด" : "ปิด"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">฿{item.price}</span>
                        {isEffect && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex gap-1 items-center">
                              {parseEffects(item.effects).slice(0, 5).map((e, i) => (
                                <span key={i} className="inline-flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-md text-xs">
                                  {e.visual?.startsWith("http") ? "🖼" : e.visual}
                                </span>
                              ))}
                              {parseEffects(item.effects).length === 0 && (
                                <span className="text-xs text-gray-400">ไม่มีเอฟเฟกต์</span>
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                    >
                      <Trash2 size={13} /> Delete
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
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-5">
              <h2 className="text-lg font-bold text-white">
                {currentEffectIndex !== null ? "แก้ไขเอฟเฟกต์" : "เพิ่มเอฟเฟกต์ใหม่"}
              </h2>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Trigger</label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-cyan-400 transition pr-10"
                    value={effectData.trigger}
                    onChange={(e) => setEffectData({ ...effectData, trigger: e.target.value })}
                  >
                    {TRIGGERS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Visual — Emoji หรือ URL รูป</label>
                <div className="flex gap-3 items-center">
                  {/* preview */}
                  <div className="w-14 h-14 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {effectData.visual?.startsWith("http")
                      ? <img src={effectData.visual} alt="" className="w-9 h-9 object-contain" />
                      : effectData.visual
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition"
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
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-12 h-10 border-2 border-gray-200 rounded-lg p-0.5 cursor-pointer"
                    value={effectData.color}
                    onChange={(e) => setEffectData({ ...effectData, color: e.target.value })}
                  />
                  <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ background: effectData.color }} />
                  <span className="text-xs text-gray-400 font-mono">{effectData.color}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ขนาด (px)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition"
                    value={effectData.size}
                    onChange={(e) => setEffectData({ ...effectData, size: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Duration (ms)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition"
                    value={effectData.duration}
                    onChange={(e) => setEffectData({ ...effectData, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleSaveEffect}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition"
              >
                บันทึก
              </button>
              <button
                onClick={() => setShowEffectModal(false)}
                className="flex-1 py-3 rounded-xl text-gray-500 text-sm bg-gray-100 hover:bg-gray-200 transition"
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
