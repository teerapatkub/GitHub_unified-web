import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { Check, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../../config/api.js';

export default function PurchaseSuccessPopup({ purchase, onDismiss }) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence mode="wait">
      {purchase && (
        <Motion.aside
          key={purchase.id}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
          transition={transition}
          className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0"
        >
          <div className="h-1.5 bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400" aria-hidden="true" />
          <div className="relative p-5">
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t('shopPurchase.close')}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <X size={18} />
            </button>
            <div className="flex items-start gap-4 pr-7">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-100 ring-1 ring-sky-200/70">
                {purchase.image ? (
                  <img src={assetUrl(purchase.image)} alt="" className="h-16 w-16 object-contain" />
                ) : purchase.kind === 'set' ? (
                  <ShoppingBag aria-hidden="true" className="h-9 w-9 text-sky-700" />
                ) : (
                  <span aria-hidden="true" className="text-3xl font-black text-sky-700">{purchase.icon || '✦'}</span>
                )}
                <Motion.span
                  aria-hidden="true"
                  initial={reduceMotion ? false : { scale: 0, rotate: -35 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm"
                >
                  <Check size={15} strokeWidth={3} />
                </Motion.span>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                  <Sparkles size={12} aria-hidden="true" /> PyArena Shop
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{t('shopPurchase.success')}</h2>
                <p className="mt-0.5 break-words text-sm font-bold text-slate-700">{purchase.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {purchase.kind === 'set' ? t('shopPurchase.setAdded') : t('shopPurchase.itemAdded')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {t('shopPurchase.continue')}
            </button>
          </div>
        </Motion.aside>
      )}
    </AnimatePresence>
  );
}
