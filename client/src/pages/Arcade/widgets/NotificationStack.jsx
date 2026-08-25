export default function NotificationStack({ notifications }) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none max-w-sm">
      {notifications.map(n => (
        <div key={n.id} className={`px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 border animate-bounce-slight ${
          n.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          'bg-white border-slate-200 text-slate-700'
        }`}>
          <span>{
            n.type === 'error' ? '🚨' :
            n.type === 'success' ? '✅' :
            n.type === 'warning' ? '🔔' : 'ℹ️'
          }</span>
          <span className="flex-1">{n.msg}</span>
        </div>
      ))}
    </div>
  );
}
