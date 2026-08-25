import { RotateCcw } from 'lucide-react';
import ShopItemCard from './ShopItemCard.jsx';

export default function ShopPhaseView({
  timeLeft,
  playerState,
  shopState,
  rollShop,
  canBuyItem,
  buyItem,
  sellItem,
  t
}) {
  return (
    <div className="h-full w-full overflow-y-auto p-8 max-w-[1400px] mx-auto">
      <div className="text-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-orange-500"></div>
        <h2 className="text-3xl font-black text-slate-800">{t('shopPhase')}</h2>
        <p className="text-sm text-slate-400 font-bold mt-1">
          {t('timeRemaining')} <span className="text-rose-500 text-lg font-black ml-1">{timeLeft}s</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100">
          <p className="text-lg font-black text-slate-700 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
            <span>{t('yourCash')}</span>
            <span className="text-emerald-600">🪙 {playerState.cash}</span>
          </p>
          <button
            onClick={() => rollShop()}
            className="bg-white hover:bg-amber-50 border border-amber-300 text-amber-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all hover:scale-102 active:scale-98 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t('reroll')} (🪙 {shopState.rerollCost})</span>
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
          />
        ))}
      </div>

      {/* SELL BACK YOUR OWN INVENTORY — shop phase only, human player
          only, refund is 50% of the original purchase price. */}
      <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">{t('yourItemsSell')}</h3>
        {playerState.inventory.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold">{t('empty')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {playerState.inventory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-black text-slate-700">{t(item.nameKey)}</span>
                <button
                  onClick={() => sellItem(idx)}
                  className="text-[10px] font-black uppercase bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
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
