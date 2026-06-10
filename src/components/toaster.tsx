'use client';
import { useEffect, useState } from 'react';

let toastId = 0;
type Toast = { id: number; message: string; type: 'success' | 'error' };

let addToast: (t: Toast) => void = () => {};
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  addToast({ id: ++toastId, message, type });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => { addToast = (t) => { setToasts((p) => [...p, t]); setTimeout(() => setToasts((p) => p.filter((x) => x.id !== t.id)), 2500); }; }, []);
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm transition-all ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
