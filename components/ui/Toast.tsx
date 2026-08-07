
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      id="toast-notification"
      className={`fixed bottom-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
        type === 'success' 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'bg-rose-50 text-rose-800 border-rose-205'
      }`}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span className="text-xs font-semibold font-sans">{message}</span>
      </div>
      <button 
        id="toast-close-btn"
        onClick={onClose} 
        className="text-xs font-bold hover:opacity-75 px-1.5 py-0.5 rounded transition bg-black/5"
      >
        &times;
      </button>
    </div>
  );
}

export function useToast() {
  const [toastData, setToastData] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToastData({ message, type });
  }, []);

  const handleClose = useCallback(() => {
    setToastData(null);
  }, []);

  const toast = toastData ? (
    <Toast 
      message={toastData.message} 
      type={toastData.type} 
      onClose={handleClose} 
    />
  ) : null;

  return {
    toast,
    showToast
  };
}
