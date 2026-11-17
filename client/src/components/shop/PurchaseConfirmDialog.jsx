import { useEffect, useRef } from 'react';
import { Coins, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../../config/api.js';

// The step between "ซื้อ" and the purchase (UI review 2026-11-18, P1). A set
// can cost 15,200 coins and there is no refund, so the player sees what they
// are buying, the price and what will be left before any coins move.
//
// purchase: { kind: 'item' | 'set', name, price, image, icon } or null.
export default function PurchaseConfirmDialog({ purchase, wallet, busy = false, onConfirm, onCancel }) {
  const { t, i18n } = useTranslation();
  const confirmRef = useRef(null);
  const lang = i18n.language === 'en' ? 'en-US' : 'th-TH';
  const coins = (value) => Number(value || 0).toLocaleString(lang);

  useEffect(() => {
    if (!purchase) return undefined;
    confirmRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [purchase, busy, onCancel]);

  if (!purchase) return null;
  const after = Number(wallet || 0) - Number(purchase.price || 0);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4"
      onPointerDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-confirm-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h2 id="purchase-confirm-title" className="text-lg font-bold text-slate-900">
          {purchase.kind === 'set'
            ? t('shop.confirm.titleSet', 'ซื้อเซ็ตนี้ไหม?')
            : t('shop.confirm.title', 'ซื้อชิ้นนี้ไหม?')}
        </h2>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
            {purchase.image ? (
              <img src={assetUrl(purchase.image)} alt="" className="h-12 w-12 object-contain" />
            ) : purchase.icon ? (
              <span aria-hidden="true" className="text-2xl">{purchase.icon}</span>
            ) : (
              <ShoppingBag aria-hidden="true" className="h-7 w-7 text-slate-500" />
            )}
          </span>
          <p className="min-w-0 break-words font-bold text-slate-900">{purchase.name}</p>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">{t('shop.confirm.price', 'ราคา')}</dt>
            <dd className="inline-flex items-center gap-1 font-bold text-slate-900 tabular-nums">
              <Coins size={15} aria-hidden="true" className="text-amber-600" />{coins(purchase.price)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">{t('shop.confirm.balance', 'เหรียญที่มี')}</dt>
            <dd className="font-bold text-slate-900 tabular-nums">{coins(wallet)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-2">
            <dt className="font-bold text-slate-700">{t('shop.confirm.after', 'เหลือหลังซื้อ')}</dt>
            <dd className="font-bold text-slate-900 tabular-nums">{coins(after)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">{t('shop.confirm.note', 'ซื้อแล้วคืนเหรียญไม่ได้')}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {t('shop.confirm.cancel', 'ยกเลิก')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 rounded-xl python-gradient px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? t('shop.confirm.buying', 'กำลังซื้อ…') : t('shop.confirm.buy', 'ยืนยันการซื้อ')}
          </button>
        </div>
      </div>
    </div>
  );
}
