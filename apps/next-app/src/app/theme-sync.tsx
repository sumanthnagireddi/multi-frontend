"use client";

import { useEffect } from 'react';

async function applyAtlaskitTheme(mode: 'dark' | 'light') {
  try {
    const { setGlobalTheme } = await import('@atlaskit/tokens');
    await setGlobalTheme({ colorMode: mode, light: 'light', dark: 'dark' });
  } catch {
    // ignore if not available
  }
}

function applyTheme(theme: string) {
  const mode = theme === 'dark' ? 'dark' : 'light';
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  localStorage.setItem('app-theme', mode);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: mode } }));
  applyAtlaskitTheme(mode);
}

export function ThemeSync() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
    }
    // Signal to Angular parent that this iframe is ready
    window.parent?.postMessage({ type: 'THEME_READY' }, '*');

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'THEME_CHANGE') {
        applyTheme(e.data.theme ?? 'light');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return null;
}
