// ─── API Endpoints ────────────────────────────────────────────────────────────

/**
 * The production backend URL, shared across all apps in the monorepo.
 * Apps should call getApiUrl() rather than hard-coding this value.
 */
export const PROD_API_URL = 'https://webservices-rqvr.onrender.com';
export const DEV_API_URL = 'http://localhost:3000';

/**
 * Returns the correct API base URL depending on the runtime environment.
 *
 * Priority order:
 *  1. NEXT_PUBLIC_API_URL env var (Next.js / CI override)
 *  2. REACT_APP_API_URL env var   (CRA / React override)
 *  3. NG_APP_API_URL env var      (Angular env override)
 *  4. Automatic detection: production hostname → PROD_API_URL, else DEV_API_URL
 */
export function getApiUrl(): string {
  // 1. Explicit env var (Next.js)
  if (typeof process !== 'undefined' && process.env?.['NEXT_PUBLIC_API_URL']) {
    return process.env['NEXT_PUBLIC_API_URL'];
  }
  // 2. React CRA style
  if (typeof process !== 'undefined' && process.env?.['REACT_APP_API_URL']) {
    return process.env['REACT_APP_API_URL'];
  }
  // 3. Angular style
  if (typeof process !== 'undefined' && process.env?.['NG_APP_API_URL']) {
    return process.env['NG_APP_API_URL'];
  }
  // 4. Detect production by hostname at runtime (browser)
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    return isLocalhost ? DEV_API_URL : PROD_API_URL;
  }
  // 5. Server-side / SSG fallback: use prod if NODE_ENV is production
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') {
    return PROD_API_URL;
  }
  return DEV_API_URL;
}
