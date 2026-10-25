import { useEffect, useState } from 'react';
import { subscribeToasts, TOAST_MS } from './toast.js';
import './toast.css';

const STYLES = {
  error: 'bg-rose-50 border-rose-300 text-rose-900',
  success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  info: 'bg-white border-slate-300 text-slate-800',
};

// Renders toast() messages bottom-centre. role="status" / "alert" so screen
// readers announce them without moving focus, unlike window.alert().
export default function ToastHost() {
  const [entries, setEntries] = useState([]);

  useEffect(() => subscribeToasts((entry) => {
    setEntries(prev => [...prev.slice(-2), entry]);
    window.setTimeout(() => setEntries(prev => prev.filter(e => e.id !== entry.id)), TOAST_MS);
  }), []);

  if (entries.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {entries.map(entry => (
        <div
          key={entry.id}
          role={entry.type === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto max-w-md w-full rounded-2xl border px-4 py-3 text-sm font-bold shadow-lg app-toast-in ${STYLES[entry.type] || STYLES.info}`}
        >
          {entry.message}
        </div>
      ))}
    </div>
  );
}
