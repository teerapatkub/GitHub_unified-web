export default function ShopItemCard({ item, onBuy, canBuy, t }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden group">
      {item.purchased && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <span className="bg-slate-900 text-white font-black px-5 py-2 rounded-xl rotate-[-8deg] text-sm tracking-widest uppercase shadow-md">
            {t('soldOut')}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner
            ${item.type === 'attack' ? 'bg-rose-50 text-rose-600' : item.type === 'aoe' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <span>{item.icon}</span>
          </div>
          <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm font-black border border-slate-200 shadow-sm">
            🪙 {item.price}
          </span>
        </div>
        <h3 className="text-base font-black text-slate-800 mb-1 leading-tight">
          {t(item.nameKey)}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">{t(item.descKey)}</p>
      </div>

      <button
        onClick={onBuy}
        disabled={item.purchased || !canBuy}
        className={`py-3 rounded-2xl font-black text-xs uppercase transition-all w-full ${
          item.purchased ? 'bg-slate-100 text-slate-400' :
          canBuy
          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
        }`}
      >
        {t('purchase')}
      </button>
    </div>
  );
}
