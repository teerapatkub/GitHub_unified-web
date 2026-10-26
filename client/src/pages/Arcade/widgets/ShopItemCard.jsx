export default function ShopItemCard({ item, onBuy, canBuy, t }) {
  return (
    <div className="bg-pysim-card p-6 rounded-3xl shadow-sm border border-pysim-outline-variant flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden group">
      {item.purchased && (
        <div className="absolute inset-0 bg-pysim-card/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <span className="bg-pysim-on-surface text-pysim-on-primary font-black px-5 py-2 rounded-xl rotate-[-8deg] text-sm tracking-widest uppercase shadow-md">
            {t('soldOut')}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner
            ${item.type === 'attack' ? 'bg-pysim-accent-container text-pysim-accent-strong' : item.type === 'aoe' ? 'bg-pysim-info-container text-pysim-info' : 'bg-pysim-success-container text-pysim-success-strong'}`}>
            <span>{item.icon}</span>
          </div>
          <span className="bg-pysim-surface text-pysim-on-surface-variant px-3 py-1.5 rounded-xl font-mono text-sm font-black border border-pysim-outline-variant shadow-sm">
            🪙 {item.price}
          </span>
        </div>
        <h3 className="text-base font-black text-pysim-on-surface mb-1 leading-tight">
          {t(item.nameKey)}
        </h3>
        <p className="text-pysim-label text-xs leading-relaxed">{t(item.descKey)}</p>
      </div>

      <button
        onClick={onBuy}
        disabled={item.purchased || !canBuy}
        className={`py-3 rounded-2xl font-black text-xs uppercase transition-all w-full ${
          item.purchased ? 'bg-pysim-surface-container text-pysim-label' :
          canBuy
          ? 'bg-pysim-accent-strong hover:bg-pysim-accent-strong/90 text-pysim-on-primary shadow-md hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-pysim-surface text-pysim-label border border-pysim-outline-variant cursor-not-allowed'
        }`}
      >
        {t('purchase')}
      </button>
    </div>
  );
}
