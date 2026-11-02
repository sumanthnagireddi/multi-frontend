export const environment = {
  financeApiUrl: import.meta.env.VITE_FINANCE_API_URL || (
    typeof window !== 'undefined' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'https://webservices-rqvr.onrender.com'
      : 'http://localhost:3000'
  ),
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:3001',
  goldApiUrl: import.meta.env.VITE_GOLD_API_URL || 'https://ai-webservices.onrender.com',
  resourcesApiUrl: import.meta.env.VITE_RESOURCES_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000',
} as const;
