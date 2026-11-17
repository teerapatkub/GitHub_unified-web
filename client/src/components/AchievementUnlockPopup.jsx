import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Palette, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { requestJson } from '../config/api-client.js';
import { assetUrl } from '../config/api.js';
import { playClickFx } from '../fx/index.js';

// Announces achievement unlocks - level rewards included (fix list item 12).
//
// Unlocks happen in many places (a lesson, a purchase, an Arcade match, a
// Debug Lab task) and none of them used to say anything. Rather than teach
// each screen, this asks the server which unlocks the player has not been
// shown yet, shows them one at a time, and marks each seen as it is closed.
// It asks when the app opens, when the page changes, after a reward or a
// purchase (the user events), and once a minute while the tab is visible.
const POLL_MS = 60_000;

export default function AchievementUnlockPopup({ user, pathname, onUserRefresh }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const a = (key, fallback, options) => t(`achievementPopup.${key}`, { defaultValue: fallback, ...options });
  const [queue, setQueue] = useState([]);
  const busy = useRef(false);
  const signedIn = Boolean(user?.user_id) && !user?.isGuest && Number(user?.level) > 0;

  const check = useCallback(async () => {
    if (!signedIn || busy.current) return;
    busy.current = true;
    try {
      const data = await requestJson('/api/achievement-unlocks/unseen');
      const fresh = Array.isArray(data?.unlocks) ? data.unlocks : [];
      if (fresh.length) {
        setQueue((current) => {
          const known = new Set(current.map((u) => u.achievement_id));
          return [...current, ...fresh.filter((u) => !known.has(u.achievement_id))];
        });
      }
    } catch {
      // Nothing to announce if the check fails; it runs again soon.
    } finally {
      busy.current = false;
    }
  }, [signedIn]);

  useEffect(() => { check(); }, [check, pathname]);

  useEffect(() => {
    if (!signedIn) return undefined;
    const onEvent = () => window.setTimeout(check, 600);
    window.addEventListener('pysim:user-updated', onEvent);
    window.addEventListener('pysim:user-cosmetic-equipped', onEvent);
    const timer = window.setInterval(() => { if (!document.hidden) check(); }, POLL_MS);
    return () => {
      window.removeEventListener('pysim:user-updated', onEvent);
      window.removeEventListener('pysim:user-cosmetic-equipped', onEvent);
      window.clearInterval(timer);
    };
  }, [check, signedIn]);

  const current = queue[0];

  // A burst of fireworks when each one appears, and the navbar's coin count
  // brought up to date (the reward was paid on the server).
  useEffect(() => {
    if (!current) return;
    const x = window.innerWidth / 2, y = window.innerHeight * 0.32;
    playClickFx('firework', x, y);
    window.setTimeout(() => playClickFx('firework', x - 160, y + 40), 250);
    window.setTimeout(() => playClickFx('firework', x + 160, y + 30), 450);
    if (Number(current.reward_money) > 0) onUserRefresh?.();
  }, [current, onUserRefresh]);

  const dismiss = (then) => {
    if (!current) return;
    requestJson('/api/achievement-unlocks/seen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievement_ids: [current.achievement_id] }),
    }).catch(() => {});
    setQueue((q) => q.slice(1));
    then?.();
  };

  if (!current) return null;

  const isLevel = current.metric === 'level';
  const items = Array.isArray(current.reward_items) ? current.reward_items : [];
  const coins = Number(current.reward_money || 0);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="achievement-popup-title">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-center shadow-2xl">
        <div className="python-gradient px-6 pb-10 pt-8 text-white">
          <button type="button" onClick={() => dismiss()} aria-label={a('close', 'ปิด')}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white">
            <X size={18} />
          </button>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
            {isLevel ? a('levelUp', 'ถึงเลเวล {{level}} แล้ว!', { level: current.threshold }) : a('unlocked', 'ปลดล็อกความสำเร็จ!')}
          </p>
          <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl ring-4 ring-white/40">
            <span aria-hidden="true">{current.icon || '🏆'}</span>
          </div>
          <h2 id="achievement-popup-title" className="mt-4 text-2xl font-black">{current.name}</h2>
          {current.description && <p className="mt-1 text-sm text-white/90">{current.description}</p>}
        </div>

        <div className="-mt-6 space-y-3 px-6 pb-6">
          {coins > 0 && (
            <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 text-lg font-black text-amber-700 shadow ring-1 ring-amber-200">
              <Coins size={20} /> +{coins.toLocaleString()} {a('coins', 'เหรียญ')}
            </div>
          )}
          {items.length > 0 && (
            <div className={`grid gap-3 ${items.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {items.map((item) => (
                <div key={item.url} className="rounded-2xl bg-slate-50 p-3 shadow ring-1 ring-slate-200">
                  <img src={assetUrl(item.url)} alt="" className={`mx-auto h-24 w-24 ${item.type === 'PROFILE_PICTURE' ? 'rounded-full object-cover' : 'object-contain'}`} />
                  <p className="mt-2 text-sm font-black text-slate-800">{item.name}</p>
                  <p className="text-[11px] font-bold text-pysim-primary">
                    {item.type === 'PROFILE_PICTURE' ? a('newPicture', 'รูปโปรไฟล์ใหม่') : a('newFrame', 'กรอบโปรไฟล์ใหม่')}
                  </p>
                </div>
              ))}
            </div>
          )}
          {items.length > 0 && <p className="text-xs text-slate-500">{a('exclusive', 'ของพิเศษที่ซื้อในร้านไม่ได้')}</p>}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            {items.length > 0 && (
              <button type="button" onClick={() => dismiss(() => navigate('/profile/appearance'))}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl python-gradient px-4 py-3 text-sm font-black text-white hover:opacity-90">
                <Palette size={16} /> {a('wearNow', 'ไปใส่เลย')}
              </button>
            )}
            <button type="button" onClick={() => dismiss()}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${items.length > 0 ? 'border border-slate-300 text-slate-700 hover:bg-slate-50' : 'python-gradient text-white hover:opacity-90'}`}>
              {queue.length > 1 ? a('next', 'ถัดไป ({{left}})', { left: queue.length - 1 }) : a('great', 'เยี่ยม!')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
