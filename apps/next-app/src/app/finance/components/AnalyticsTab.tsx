'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '@unified-frontend-monorepo/workspace-data';

interface Visit {
  _id: string;
  visitorId: string;
  route: string;
  username: string;
  ip: string;
  userAgent: string;
  referrer: string;
  visitedAt: string;
}

export default function AnalyticsTab() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVisits = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiUrl()}/analytics/visits?limit=500`);
      if (!response.ok) throw new Error('Unable to load visit history');
      const data = await response.json();
      setVisits(Array.isArray(data.visits) ? data.visits : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load visit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadVisits(); }, []);

  const routeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((visit) => counts.set(visit.route, (counts.get(visit.route) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [visits]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--claude-border)] p-4">
          <p className="text-[10px] uppercase text-[color:var(--claude-ink-sub)]">Total visits</p>
          <p className="mt-1 text-xl font-semibold">{visits.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--claude-border)] p-4">
          <p className="text-[10px] uppercase text-[color:var(--claude-ink-sub)]">Unique visitors</p>
          <p className="mt-1 text-xl font-semibold">{new Set(visits.map((visit) => visit.visitorId)).size}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--claude-border)] p-4">
          <p className="text-[10px] uppercase text-[color:var(--claude-ink-sub)]">Routes opened</p>
          <p className="mt-1 text-xl font-semibold">{routeCounts.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="rounded-xl border border-[color:var(--claude-border)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Route popularity</h3>
          </div>
          <div className="space-y-2">
            {routeCounts.map(([route, count]) => (
              <div key={route} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium">{route}</span>
                <span className="rounded-full bg-[color:var(--claude-bg-strong)] px-2 py-1">{count}</span>
              </div>
            ))}
            {!routeCounts.length && <p className="text-xs text-[color:var(--claude-ink-sub)]">No route data yet.</p>}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[color:var(--claude-border)]">
          <div className="flex items-center justify-between border-b border-[color:var(--claude-border)] p-4">
            <h3 className="text-sm font-semibold">All visit history</h3>
            <button onClick={() => void loadVisits()} className="text-xs font-semibold text-[color:var(--claude-accent)]">Refresh</button>
          </div>
          {loading ? (
            <p className="p-6 text-center text-xs text-[color:var(--claude-ink-sub)]">Loading visits…</p>
          ) : error ? (
            <p className="p-6 text-center text-xs text-rose-600">{error}</p>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="sticky top-0 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)]">
                  <tr>
                    <th className="p-3">Visited at</th>
                    <th className="p-3">User</th>
                    <th className="p-3">IP address</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Device / browser</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit._id} className="border-t border-[color:var(--claude-border)]">
                      <td className="p-3">{new Date(visit.visitedAt).toLocaleString()}</td>
                      <td className="p-3 font-semibold">{visit.username || 'anonymous'}</td>
                      <td className="p-3">{visit.ip}</td>
                      <td className="p-3 font-medium">{visit.route}</td>
                      <td className="max-w-[260px] truncate p-3" title={visit.userAgent}>{visit.userAgent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visits.length && <p className="p-8 text-center text-xs text-[color:var(--claude-ink-sub)]">No visits recorded yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
