import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from 'react-router';
import { useEffect, useState, createContext, useContext } from 'react';
import appStylesHref from '../styles.css?url';

// ─── Atlaskit theme integration ───────────────────────────────────────────────
// Dynamic import to avoid SSR issues; runs only in the browser
async function applyAtlaskitTheme(mode: 'dark' | 'light') {
  try {
    const { setGlobalTheme } = await import('@atlaskit/tokens');
    await setGlobalTheme({ colorMode: mode, light: 'light', dark: 'dark' });
  } catch {
    // @atlaskit/tokens not available or not in browser — ignore
  }
}

// ─── Generic dark/light class toggle ──────────────────────────────────────────
function applyTheme(theme: string) {
  const mode = theme === 'dark' ? 'dark' : 'light';
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  // Atlaskit: update data-theme & data-color-mode attrs on <html>
  applyAtlaskitTheme(mode);
}

// ─── Theme Context ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext<{ isDark: boolean }>({ isDark: false });
export function useTheme() { return useContext(ThemeContext); }

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesHref },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Signal readiness to Angular parent → parent responds with THEME_CHANGE
    window.parent?.postMessage({ type: 'THEME_READY' }, '*');

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'THEME_CHANGE') {
        const theme: string = e.data.theme ?? 'light';
        applyTheme(theme);
        setIsDark(theme === 'dark');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <ThemeContext.Provider value={{ isDark }}>
          {children}
        </ThemeContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
