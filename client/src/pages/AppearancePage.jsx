import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Image as ImageIcon, MousePointerClick, Palette, Play, ShoppingBag, Sparkles, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickLocalized } from '../utils/problemText';
import { API_BASE, assetUrl } from '../config/api.js';
import { requestJson } from '../config/api-client.js';
import { useTheme } from '../contexts/useTheme.js';
import { getShopThemePalette } from '../themes/shopPalette.js';
import { applyCosmetic } from '../shop/equipCosmetic.js';
import { isCanvasClickFx, playClickFx, previewThemeScene, themeHasScene } from '../fx/index.js';
import { toast, friendlyError } from '../components/ui/toast.js';
import SkeletonLoading from '../components/ui/Skeleton.jsx';

// The player's wardrobe: everything they own, changed in one place with a live
// preview (asked for 2026-11-17, "like Discord or Steam"). Choices are staged
// and only sent when the player saves, so they can try a combination first.
//
// Theme, frame and cursor effect go through shop/equipCosmetic.js - the same
// code the shop's "equip" button runs. The profile picture goes through the
// profile's own select/reset routes, because its options include pictures that
// are not shop items (the level default, Google).

const SLOTS = ['THEME', 'PROFILE_PICTURE', 'PROFILE_FRAME', 'MOUSE_EFFECT'];

const parseJson = (value) => {
  if (!value || typeof value === 'object') return value || null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const pictureKey = (opt) => (opt ? `${opt.source}:${opt.itemId || opt.url}` : '');

// One tile in the wardrobe grid. At module level so a click does not remount
// every tile (and reload its picture).
const Tile = ({ selected, isSaved, inUseLabel, onClick, label, children, wide = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`group relative flex flex-col overflow-hidden rounded-xl bg-white text-left whisper-shadow transition-all hover:-translate-y-0.5 ${selected ? 'ring-2 ring-pysim-primary' : 'ring-1 ring-pysim-outline/10 hover:ring-pysim-primary/40'}`}
  >
    <div className={`relative flex items-center justify-center bg-pysim-surface-low ${wide ? 'aspect-video' : 'aspect-square'}`}>
      {children}
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-pysim-primary text-white shadow">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      {isSaved && (
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-label font-black text-pysim-success-strong shadow-sm">
          {inUseLabel}
        </span>
      )}
    </div>
    <span className="truncate px-3 py-2 text-xs font-bold text-pysim-on-surface">{label}</span>
  </button>
);

export default function AppearancePage({ onUserRefresh }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'th';
  const a = (key, fallback, options) => t(`appearance.${key}`, { defaultValue: fallback, ...options });
  const { registerTheme, setTheme } = useTheme();
  const storedUser = useMemo(readStoredUser, []);
  const userId = Number(storedUser?.user_id || 0);

  const [profile, setProfile] = useState(null);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('THEME');
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId || storedUser?.isGuest) {
      setError(a('signIn', 'เข้าสู่ระบบก่อนเพื่อแต่งโปรไฟล์'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [data, inventoryRes] = await Promise.all([
        requestJson(`/api/profile/${userId}`),
        fetch(`${API_BASE}/api/shop/inventory/${userId}`),
      ]);
      const inventory = inventoryRes.ok ? await inventoryRes.json() : [];
      const items = (Array.isArray(inventory) ? inventory : []).map((row) => ({
        itemId: Number(row.item_id),
        name: row.name,
        nameEn: row.name_en || '',
        type: row.type,
        assetUrl: row.asset_url || '',
        previewImage: row.preview_image || '',
        effectData: parseJson(row.preview_data) || [],
      }));
      const user = readStoredUser() || {};
      const current = {
        THEME: Number(user.equipped_theme_id) || null,
        PROFILE_FRAME: Number(user.equipped_profile_frame_id) || null,
        MOUSE_EFFECT: Number(user.equipped_mouse_effect_id) || null,
        PROFILE_PICTURE: pictureKey((data.user.avatar_options || []).find((o) => o.selected)),
      };
      setProfile(data);
      setOwned(items);
      setSaved(current);
      setDraft(current);
    } catch {
      setError(a('loadFailed', 'โหลดของตกแต่งไม่สำเร็จ ลองใหม่อีกครั้ง'));
    } finally {
      setLoading(false);
    }
    // `a` is a fresh closure each render; the strings it returns do not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const byType = useMemo(() => {
    const groups = { THEME: [], PROFILE_FRAME: [], MOUSE_EFFECT: [] };
    owned.forEach((item) => { if (groups[item.type]) groups[item.type].push(item); });
    return groups;
  }, [owned]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pysim-surface px-4 py-8">
        <SkeletonLoading variant="profile" label={a('loading', 'กำลังโหลดตู้ของตกแต่ง...')} className="mx-auto max-w-6xl" />
      </div>
    );
  }
  if (error || !profile || !draft) {
    return (
      <div className="min-h-screen bg-pysim-surface px-4 py-16">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center whisper-shadow">
          <p className="text-sm font-bold text-red-600">{error || a('loadFailed', 'โหลดของตกแต่งไม่สำเร็จ ลองใหม่อีกครั้ง')}</p>
          <button type="button" onClick={() => navigate('/profile')} className="mt-5 rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white">
            {a('backToProfile', 'กลับหน้าโปรไฟล์')}
          </button>
        </div>
      </div>
    );
  }

  const { user, progression } = profile;
  const pictures = user.avatar_options || [];
  const chosen = {
    THEME: byType.THEME.find((i) => i.itemId === draft.THEME) || null,
    PROFILE_FRAME: byType.PROFILE_FRAME.find((i) => i.itemId === draft.PROFILE_FRAME) || null,
    MOUSE_EFFECT: byType.MOUSE_EFFECT.find((i) => i.itemId === draft.MOUSE_EFFECT) || null,
    PROFILE_PICTURE: pictures.find((o) => pictureKey(o) === draft.PROFILE_PICTURE) || null,
  };
  const changed = SLOTS.filter((slot) => draft[slot] !== saved[slot]);
  // What a cosmetic is called on screen: English when it has one, Thai
  // otherwise (fix list item 16.10). `name` itself stays Thai, because the
  // theme's colours and scene are picked by keyword in it.
  const shownName = (item) => pickLocalized(lang, item?.nameEn, item?.name);
  const shownLabel = (opt) => pickLocalized(lang, opt?.label_en, opt?.label);
  const themeText = chosen.THEME ? `${chosen.THEME.name} ${chosen.THEME.assetUrl}` : '';
  const palette = chosen.THEME ? getShopThemePalette({ name: chosen.THEME.name, assetUrl: chosen.THEME.assetUrl }) : null;
  const clickFx = (chosen.MOUSE_EFFECT?.effectData || []).find((e) => String(e?.trigger || 'click') === 'click' && isCanvasClickFx(e?.fx));
  const dblFx = (chosen.MOUSE_EFFECT?.effectData || []).find((e) => String(e?.trigger) === 'dblclick' && isCanvasClickFx(e?.fx));
  const pick = (slot, value) => setDraft((current) => ({ ...current, [slot]: value }));

  const save = async () => {
    setSaving(true);
    const failed = [];
    for (const slot of changed) {
      try {
        if (slot === 'PROFILE_PICTURE') {
          const opt = chosen.PROFILE_PICTURE;
          if (!opt) continue;
          if (opt.source === 'default') {
            await requestJson(`/api/profile/${userId}/avatar/reset`, { method: 'POST' });
          } else {
            await requestJson(`/api/profile/${userId}/avatar/select`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: opt.source, itemId: opt.itemId }),
            });
          }
        } else {
          const result = await applyCosmetic({ type: slot, item: chosen[slot], registerTheme, setTheme });
          if (!result.ok) failed.push(friendlyError(result.error, a(`slot.${slot}`, slot), lang));
        }
      } catch (err) {
        failed.push(err?.detail || a(`slot.${slot}`, slot));
      }
    }
    setSaving(false);
    if (failed.length) toast(a('saveFailed', 'บันทึกบางส่วนไม่สำเร็จ: {{list}}', { list: failed.join(', ') }));
    else toast(a('saved', 'บันทึกการแต่งโปรไฟล์แล้ว'));
    onUserRefresh?.();
    await load();
  };

  const tabs = [
    { id: 'THEME', icon: <Palette size={16} />, label: a('tab.theme', 'ธีม'), count: byType.THEME.length },
    { id: 'PROFILE_PICTURE', icon: <ImageIcon size={16} />, label: a('tab.picture', 'รูปโปรไฟล์'), count: pictures.length },
    { id: 'PROFILE_FRAME', icon: <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current" aria-hidden="true" />, label: a('tab.frame', 'กรอบโปรไฟล์'), count: byType.PROFILE_FRAME.length },
    { id: 'MOUSE_EFFECT', icon: <MousePointerClick size={16} />, label: a('tab.effect', 'เอฟเฟกต์คลิก'), count: byType.MOUSE_EFFECT.length },
  ];

  const noneTile = (slot, label) => (
    <Tile inUseLabel={a('inUse', 'ใช้อยู่')} selected={draft[slot] === null} isSaved={saved[slot] === null} onClick={() => pick(slot, null)} label={label} wide={slot === 'THEME'}>
      <Ban size={28} className="text-pysim-outline" />
    </Tile>
  );

  const shopTile = () => (
    <button type="button" onClick={() => navigate('/shop')}
      className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pysim-outline/25 p-4 text-center text-xs font-bold text-pysim-on-surface-variant transition-colors hover:border-pysim-primary/50 hover:text-pysim-primary">
      <ShoppingBag size={22} />
      {a('getMore', 'หาเพิ่มในร้านค้า')}
    </button>
  );

  const avatarUrl = assetUrl(chosen.PROFILE_PICTURE?.url || user.avatar?.url);
  const frameUrl = chosen.PROFILE_FRAME ? assetUrl(chosen.PROFILE_FRAME.assetUrl || chosen.PROFILE_FRAME.previewImage) : '';

  return (
    <div className="min-h-screen bg-pysim-surface pb-28">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {/* On light panels throughout: this page sits on the player's own theme
            art, whose busiest parts can be anywhere. */}
        <div className="mb-6 rounded-2xl bg-white/90 p-5 whisper-shadow backdrop-blur-sm">
          <button type="button" onClick={() => navigate('/profile')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface">
            <ArrowLeft size={16} /> {a('backToProfile', 'กลับหน้าโปรไฟล์')}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg python-gradient"><Sparkles size={20} className="text-white" /></div>
            <div>
              <h1 className="text-3xl font-black text-pysim-on-surface">{a('title', 'แต่งโปรไฟล์')}</h1>
              <p className="text-sm text-pysim-on-surface-variant">{a('subtitle', 'เลือกจากของที่คุณมี ดูตัวอย่างก่อน แล้วค่อยกดบันทึก')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ---------- live preview (first on phones) ---------- */}
          <aside className="min-w-0 lg:order-2">
            <div className="rounded-2xl bg-white/90 p-4 whisper-shadow backdrop-blur-sm lg:sticky lg:top-28">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-pysim-outline">{a('preview', 'ตัวอย่าง')}</p>
              <div
                ref={previewRef}
                data-profile-appearance
                onClick={(event) => clickFx && playClickFx(clickFx.fx, event.clientX, event.clientY)}
                onDoubleClick={(event) => dblFx && playClickFx(dblFx.fx, event.clientX, event.clientY)}
                className="relative cursor-pointer overflow-hidden rounded-2xl whisper-shadow"
                style={{
                  backgroundColor: palette?.bg || '#f1f5f9',
                  backgroundImage: chosen.THEME ? `url(${JSON.stringify(assetUrl(chosen.THEME.assetUrl || chosen.THEME.previewImage))})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6">
                  <div className="relative h-32 w-32">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" referrerPolicy="no-referrer"
                        className="absolute inset-[16px] h-[calc(100%-32px)] w-[calc(100%-32px)] rounded-full bg-white object-cover" />
                    ) : (
                      <div className="absolute inset-[16px] rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
                    )}
                    {frameUrl && <img src={frameUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />}
                  </div>
                  <div className="rounded-xl bg-white/85 px-4 py-2 text-center backdrop-blur-sm">
                    <p className="text-lg font-black" style={{ color: palette?.text || '#0f172a' }}>{user.username}</p>
                    <p className="text-xs font-bold" style={{ color: palette?.accent || '#2563eb' }}>
                      {a('level', 'เลเวล {{level}}', { level: progression?.level ?? user.level ?? 1 })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {clickFx && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-pysim-on-surface-variant whisper-shadow">
                    <MousePointerClick size={14} /> {a('clickToTry', 'คลิกที่ตัวอย่างเพื่อลองเอฟเฟกต์')}
                  </span>
                )}
                {chosen.THEME && themeHasScene(themeText) && (
                  <button type="button" onClick={() => previewThemeScene(themeText)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-pysim-primary/30 bg-white px-3 py-1.5 text-xs font-bold text-pysim-primary whisper-shadow hover:bg-pysim-primary/10">
                    <Play size={14} /> {a('playScene', 'ดูฉากเคลื่อนไหวของธีม')}
                  </button>
                )}
              </div>
              <dl className="mt-4 space-y-1.5 rounded-xl bg-pysim-surface-low p-4 text-sm">
                {[
                  ['THEME', a('tab.theme', 'ธีม'), shownName(chosen.THEME) || a('defaultTheme', 'ธีมเริ่มต้น')],
                  ['PROFILE_PICTURE', a('tab.picture', 'รูปโปรไฟล์'), shownLabel(chosen.PROFILE_PICTURE) || '-'],
                  ['PROFILE_FRAME', a('tab.frame', 'กรอบโปรไฟล์'), shownName(chosen.PROFILE_FRAME) || a('none', 'ไม่ใช้')],
                  ['MOUSE_EFFECT', a('tab.effect', 'เอฟเฟกต์คลิก'), shownName(chosen.MOUSE_EFFECT) || a('none', 'ไม่ใช้')],
                ].map(([slot, label, value]) => (
                  <div key={slot} className="flex justify-between gap-3">
                    <dt className="text-pysim-on-surface-variant">{label}</dt>
                    <dd className={`truncate text-right font-bold ${changed.includes(slot) ? 'text-pysim-primary' : 'text-pysim-on-surface'}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          {/* ---------- wardrobe ---------- */}
          <section className="min-w-0 lg:order-1">
            <div role="tablist" aria-label={a('title', 'แต่งโปรไฟล์')} className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 whisper-shadow">
              {tabs.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${tab === item.id ? 'bg-pysim-primary text-white' : 'text-pysim-on-surface-variant hover:bg-pysim-surface-low'}`}>
                  {item.icon}{item.label}
                  <span className={`rounded-full px-1.5 text-xs ${tab === item.id ? 'bg-white/25' : 'bg-pysim-surface-low'}`}>{item.count}</span>
                </button>
              ))}
            </div>

            {tab === 'THEME' && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {noneTile('THEME', a('defaultTheme', 'ธีมเริ่มต้น'))}
                {byType.THEME.map((item) => (
                  <Tile inUseLabel={a('inUse', 'ใช้อยู่')} key={item.itemId} wide selected={draft.THEME === item.itemId} isSaved={saved.THEME === item.itemId}
                    onClick={() => pick('THEME', item.itemId)} label={shownName(item)}>
                    <img src={assetUrl(item.assetUrl || item.previewImage)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </Tile>
                ))}
                {shopTile()}
              </div>
            )}

            {tab === 'PROFILE_PICTURE' && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {pictures.map((opt) => (
                  <Tile inUseLabel={a('inUse', 'ใช้อยู่')} key={pictureKey(opt)} selected={draft.PROFILE_PICTURE === pictureKey(opt)} isSaved={saved.PROFILE_PICTURE === pictureKey(opt)}
                    onClick={() => pick('PROFILE_PICTURE', pictureKey(opt))} label={shownLabel(opt)}>
                    <img src={assetUrl(opt.url)} alt="" referrerPolicy="no-referrer" className="h-3/4 w-3/4 rounded-full bg-white object-cover" />
                  </Tile>
                ))}
                {shopTile()}
              </div>
            )}

            {tab === 'PROFILE_FRAME' && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {noneTile('PROFILE_FRAME', a('noFrame', 'ไม่ใส่กรอบ'))}
                {byType.PROFILE_FRAME.map((item) => (
                  <Tile inUseLabel={a('inUse', 'ใช้อยู่')} key={item.itemId} selected={draft.PROFILE_FRAME === item.itemId} isSaved={saved.PROFILE_FRAME === item.itemId}
                    onClick={() => pick('PROFILE_FRAME', item.itemId)} label={shownName(item)}>
                    {avatarUrl && <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="absolute inset-[22%] h-[56%] w-[56%] rounded-full object-cover opacity-80" />}
                    <img src={assetUrl(item.assetUrl || item.previewImage)} alt="" className="relative h-[88%] w-[88%]" />
                  </Tile>
                ))}
                {shopTile()}
              </div>
            )}

            {tab === 'MOUSE_EFFECT' && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {noneTile('MOUSE_EFFECT', a('noEffect', 'ไม่ใช้เอฟเฟกต์'))}
                {byType.MOUSE_EFFECT.map((item) => (
                  <Tile inUseLabel={a('inUse', 'ใช้อยู่')} key={item.itemId} selected={draft.MOUSE_EFFECT === item.itemId} isSaved={saved.MOUSE_EFFECT === item.itemId}
                    onClick={() => {
                      pick('MOUSE_EFFECT', item.itemId);
                      // Show it straight away, from the middle of the preview.
                      const fx = (item.effectData || []).find((e) => String(e?.trigger || 'click') === 'click' && isCanvasClickFx(e?.fx));
                      const box = previewRef.current?.getBoundingClientRect();
                      if (fx && box) playClickFx(fx.fx, box.left + box.width / 2, box.top + box.height / 2);
                    }}
                    label={shownName(item)}>
                    <span className="text-4xl">{item.effectData?.[0]?.visual || '*'}</span>
                  </Tile>
                ))}
                {shopTile()}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ---------- unsaved changes bar ---------- */}
      {changed.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-2xl">
            <p className="text-sm font-bold">{a('unsaved', 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก ({{count}})', { count: changed.length })}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDraft(saved)} disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50">
                {a('reset', 'ยกเลิก')}
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-black text-white hover:bg-emerald-400 disabled:opacity-60">
                {saving ? a('saving', 'กำลังบันทึก...') : a('save', 'บันทึก')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
