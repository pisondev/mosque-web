"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";
interface Toast { 
  id: number; 
  message: string; 
  type: ToastType; 
  isLeaving: boolean; // State baru untuk trigger animasi fade-out
}
interface ToastContextType { addToast: (message: string, type: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, isLeaving: false }]);
    
    // Trigger animasi keluar di detik ke 1.7 (300ms sebelum dihapus)
    setTimeout(() => {
      setToasts((prev) => prev.map(t => t.id === id ? { ...t, isLeaving: true } : t));
    }, 1700);

    // Hapus dari DOM di detik ke 2
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, isLeaving: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300); // Tunggu animasi fade-out selesai
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }
        .animate-toast-shrink { animation: toast-shrink 2s linear forwards; }
      `}} />

      <div className="fixed top-6 right-6 z-[260] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`relative overflow-hidden pointer-events-auto flex items-center justify-between min-w-[300px] max-w-sm px-4 py-3.5 rounded-lg shadow-xl text-white transition-all duration-300 ease-in-out
              ${toast.type === 'success' ? 'bg-emerald-800' : 'bg-rose-900'}
              ${toast.isLeaving ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 animate-in slide-in-from-right-8 fade-in'}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Ikon Logo di sisi kiri */}
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-300" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-300" />
              )}
              <span className="text-sm font-medium mr-4 leading-tight">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-white hover:text-gray-200 transition-colors focus:outline-none ml-2">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
              <div className="h-full bg-white/80 animate-toast-shrink origin-left" />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus digunakan di dalam ToastProvider");
  return context;
};
