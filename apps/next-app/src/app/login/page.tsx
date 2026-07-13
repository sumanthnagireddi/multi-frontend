'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/finance');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setSubmitting(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      router.replace('/finance');
    } else {
      setError(result.error ?? 'Login failed.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setSubmitting(false);
  };

  if (isLoading) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          background: #080c14;
          position: relative;
          overflow: hidden;
        }

        /* Ambient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift 8s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%);
          top: -120px; left: -120px;
          animation-duration: 10s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-duration: 12s; animation-delay: -4s;
        }
        .orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%);
          top: 50%; left: 60%;
          animation-duration: 9s; animation-delay: -2s;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.05); }
        }

        /* Grid texture */
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Card */
        .card {
          position: relative;
          width: min(440px, 95vw);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 44px;
          box-shadow:
            0 32px 64px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 1px 0 rgba(255,255,255,0.08) inset;
          opacity: 0;
          transform: translateY(24px) scale(0.97);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        .card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .card.shake {
          animation: shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97);
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-3px); }
          20%, 80% { transform: translateX(5px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }

        /* Logo area */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .logo-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35);
          flex-shrink: 0;
        }
        .logo-text { flex: 1; }
        .logo-title {
          font-size: 17px; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.3px;
        }
        .logo-sub {
          font-size: 11px; font-weight: 400;
          color: rgba(255,255,255,0.35);
          margin-top: 1px;
          letter-spacing: 0.02em;
        }

        /* Heading */
        .heading {
          font-size: 26px; font-weight: 700;
          color: #f8fafc;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        .subheading {
          font-size: 13.5px; color: rgba(255,255,255,0.4);
          margin-top: 6px; margin-bottom: 32px;
        }

        /* Form elements */
        .field { margin-bottom: 16px; }
        .label {
          display: block;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .input-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          display: flex; align-items: center;
        }
        .input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          padding: 12px 44px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .input::placeholder { color: rgba(255,255,255,0.2); }
        .input:focus {
          border-color: rgba(16,185,129,0.5);
          background: rgba(16,185,129,0.04);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .eye-btn {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer; padding: 4px;
          display: flex; align-items: center;
          transition: color 0.2s;
          border-radius: 6px;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.65); }

        /* Error */
        .error-box {
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
          color: #f87171;
          font-size: 13px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 13px 24px;
          border-radius: 12px;
          border: none;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(16,185,129,0.45);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.65; cursor: not-allowed;
        }

        /* Spinner inside button */
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider hint */
        .hint {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          font-size: 11.5px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.02em;
        }
        .hint span {
          font-family: 'Courier New', monospace;
          color: rgba(16,185,129,0.6);
          font-size: 11px;
        }
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        <div className={`card ${mounted ? 'visible' : ''} ${shake ? 'shake' : ''}`}>
          {/* Logo */}
          <div className="logo-wrap">
            <div className="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-title">Finance Ledger</div>
              <div className="logo-sub">Private Dashboard</div>
            </div>
          </div>

          <h1 className="heading">Welcome back</h1>
          <p className="subheading">Sign in to access your financial overview.</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="field">
              <label htmlFor="fl-username" className="label">Username</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="fl-username"
                  type="text"
                  className="input"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  autoComplete="username"
                  disabled={submitting}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="fl-password" className="label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="fl-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-box" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="fl-submit"
              type="submit"
              className="submit-btn"
              disabled={submitting || !username.trim() || !password}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="hint">
            Demo credentials &nbsp;·&nbsp;
            <span>admin</span> / <span>finance@123</span>
          </div>
        </div>
      </div>
    </>
  );
}
