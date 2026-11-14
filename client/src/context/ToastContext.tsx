import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string }

const ToastContext = createContext<{ toast: (type: Toast['type'], message: string) => void } | null>(null);
let seq = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = seq++;
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  const icons = { success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />, error: <XCircle size={18} className="text-red-500 shrink-0" />, info: <Info size={18} className="text-kajok-royal shrink-0" /> };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 start-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92vw] max-w-md">
        {toasts.map(t => (
          <div key={t.id} role="status" className="flex items-center gap-2 bg-white shadow-lift border border-kajok-soft rounded-xl px-4 py-3 text-sm text-kajok-text animate-[toastIn_.25s_ease]">
            {icons[t.type]}<span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
