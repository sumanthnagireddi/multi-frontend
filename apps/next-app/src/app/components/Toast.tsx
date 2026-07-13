'use client';

import React, { useEffect, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const TYPE_STYLES: Record<ToastType, { accent: string; iconBg: string; bar: string }> = {
  success: {
    accent: '#10b981',
    iconBg: 'rgba(16,185,129,0.18)',
    bar: '#10b981',
  },
  error: {
    accent: '#f43f5e',
    iconBg: 'rgba(244,63,94,0.18)',
    bar: '#f43f5e',
  },
  info: {
    accent: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.18)',
    bar: '#3b82f6',
  },
  warning: {
    accent: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.18)',
    bar: '#f59e0b',
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const styles = TYPE_STYLES[toast.type];

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    // Progress bar countdown (4 s)
    const duration = 4000;
    const interval = 30;
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      if (elapsed >= duration) {
        clearInterval(progressTimer);
      }
    }, interval);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 350);
    }, duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-28px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        background: 'rgba(17,24,39,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${styles.accent}33`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.32), 0 0 0 1px ${styles.accent}1a, inset 0 1px 0 rgba(255,255,255,0.07)`,
        overflow: 'hidden',
        minWidth: '300px',
        maxWidth: '420px',
        width: 'max-content',
        pointerEvents: 'all',
        position: 'relative',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${styles.bar}cc, ${styles.bar})`,
          borderRadius: '16px 16px 0 0',
          transition: 'width 0.03s linear',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: styles.iconBg,
            color: styles.accent,
            flexShrink: 0,
          }}
        >
          {ICONS[toast.type]}
        </div>

        {/* Message */}
        <p
          style={{
            margin: 0,
            fontSize: '13.5px',
            fontWeight: 500,
            color: '#e2e8f0',
            lineHeight: '1.45',
            flex: 1,
            letterSpacing: '0.01em',
          }}
        >
          {toast.message}
        </p>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Dismiss notification"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            flexShrink: 0,
            padding: 0,
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Toast Container ────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
