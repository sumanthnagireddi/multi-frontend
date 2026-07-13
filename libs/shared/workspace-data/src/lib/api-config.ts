// ─── API Endpoints ────────────────────────────────────────────────────────────

/**
 * Production backend URL.
 */
export const PROD_API_URL = 'https://webservices-rqvr.onrender.com';

/**
 * Local development backend URL.
 */
export const DEV_API_URL = 'http://localhost:3000';

/**
 * Returns the API base URL based on the current hostname.
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return PROD_API_URL;
  }

  const { hostname } = window.location;

  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.');

  return isLocalhost ? DEV_API_URL : PROD_API_URL;
}