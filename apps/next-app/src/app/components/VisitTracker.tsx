'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@unified-frontend-monorepo/workspace-data';
import { useAuth } from './AuthProvider';

const VISITOR_KEY = 'fl_visitor_id';

export function VisitTracker() {
  const pathname = usePathname();
  const { username } = useAuth();

  useEffect(() => {
    if (!pathname) return;
    const visitorId =
      localStorage.getItem(VISITOR_KEY) ||
      crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);

    void fetch(`${getApiUrl()}/analytics/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: pathname,
        visitorId,
        username: username || 'anonymous',
        referrer: document.referrer || '',
      }),
    }).catch(() => undefined);
  }, [pathname, username]);

  return null;
}
