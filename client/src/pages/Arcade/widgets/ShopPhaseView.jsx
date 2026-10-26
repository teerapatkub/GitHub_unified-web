import { RotateCcw } from 'lucide-react';
import ShopItemCard from './ShopItemCard.jsx';
import { TYPING_ONLY_ITEMS } from '../constants.js';

export default function ShopPhaseView({
  timeLeft,
  playerState,
  shopState,
  rollShop,
  canBuyItem,
  buyItem,
  sellItem,
  t,
  nextRoundLabel = '',
  // The coming round is answered by tapping: attacks on typing do nothing there.
  nextRoundIsChoice = false
}) {
  return (
    <div className="h-full w-full overflow-y-auto p-8 max-w-[1400px] mx-auto">
      <div className="text-center mb-8 bg-pysim-card p-8 rounded-3xl shadow-sm border border-pysim-outline-variant relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pysim-accent-strong to-pysim-warning"></div>
        <h2 className="text-3xl font-black text-pysim-on-surface">{t('shopPhase')}</h2>
        <p className="text-sm text-pysim-label font-bold mt-1">
          {t('timeRemaining')} <span className="text-pysim-accent-strong text-lg font-black ml-1">{timeLeft}s</span>
        </p>
        {/* Shown before the shop so players can buy for the round that is coming. */}
        {nextRoundLabel && <p className="text-sm font-black text-pysim-on-surface-variant mt-2">{nextRoundLabel}</p>}

        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-pysim-outline-variant">
          <p className="text-lg font-black text-pysim-on-surface-variant bg-pysim-surface px-5 py-2.5 rounded-2xl border border-pysim-outline-variant flex items-center gap-2">
            <span>{t('yourCash')}</span>
            <span className="text-pysim-success-strong">🪙 {playerState.cash}</span>
          </p>
          <button
            onClick={() => rollShop()}
            disabled={shopState.busy || !shopState.ready || playerState.eliminated}
            aria-busy={shopState.busy}
            className="bg-pysim-card hover:bg-pysim-warning-container border border-pysim-warning-border text-pysim-warning-strong px-6 py-2.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all hover:scale-102 active:scale-98 shadow-sm disabled:cursor-wait disabled:opacity-70"
          >
            {/* A reroll round-trips through the database and can take a couple
                of seconds; without this the button looked like it did nothing
                (Spec 0005 #09, seen in the 2026-10-25 user test). */}
            <RotateCcw className={`h-4 w-4 ${shopState.busy ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
            <span>{shopState.busy ? t('shopWorking') : `${t('reroll')} (🪙 ${shopState.rerollCost})`}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {shopState.items.map((item, index) => (
          <ShopItemCard
            key={`${item.id}-${index}`}
            item={item}
            onBuy={() => buyItem(item, index)}
            canBuy={canBuyItem(item)}
            t={t}
            blockedNote={nextRoundIsChoice && TYPING_ONLY_ITEMS.includes(item.id) ? t('itemBlockedNextRound') : ''}
          />
        ))}
      </div>

      {/* SELL BACK YOUR OWN INVENTORY — shop phase only, human player
          only, refund is 50% of the original purchase price. */}
      <div className="mt-8 bg-pysim-card p-6 rounded-3xl shadow-sm border border-pysim-outline-variant">
        <h3 className="text-sm font-black text-pysim-on-surface-variant uppercase tracking-wider mb-4">{t('yourItemsSell')}</h3>
        {playerState.inventory.length === 0 ? (
          <p className="text-xs text-pysim-label font-bold">{t('empty')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {playerState.inventory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-pysim-surface border border-pysim-outline-variant rounded-2xl px-4 py-2.5">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-black text-pysim-on-surface-variant">{t(item.nameKey)}</span>
                <button
                  onClick={() => sellItem(idx)}
                  disabled={shopState.busy || !shopState.ready || playerState.eliminated}
                  className="text-label font-black uppercase bg-pysim-warning-container hover:bg-pysim-warning-border text-pysim-warning-strong px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  {t('sell')} 🪙 {Math.floor(item.price * 0.5)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
