import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext<{ showToast: (message: string, type?: 'success' | 'error') => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    window.clearTimeout((window as any).__portfolioToastTimer);
    (window as any).__portfolioToastTimer = window.setTimeout(() => setMessage(''), 3200);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <div className="standalone-toast">{message}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
