export default function NotificationStack({ notifications }) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none max-w-sm">
      {notifications.map(n => (
        <div key={n.id} className={`px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 border arcade-toast-in ${
          n.type === 'error' ? 'bg-pysim-error-container border-pysim-error-border text-pysim-error' :
          n.type === 'success' ? 'bg-pysim-success-container border-pysim-success-border text-pysim-success-strong' :
          n.type === 'warning' ? 'bg-pysim-warning-container border-pysim-warning-border text-pysim-warning-strong' :
          'bg-pysim-card border-pysim-outline-variant text-pysim-on-surface-variant'
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
