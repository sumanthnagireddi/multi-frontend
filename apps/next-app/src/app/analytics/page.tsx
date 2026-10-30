'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import AnalyticsTab from '../finance/components/AnalyticsTab';

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-[color:var(--claude-bg)] px-4 py-6 text-[color:var(--claude-ink)] md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[color:var(--claude-accent)]">Application analytics</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Visitor history</h1>
          </div>
          <Link
            href="/finance"
            className="rounded-xl border border-[color:var(--claude-border)] px-4 py-2 text-xs font-semibold"
          >
            Back to finance
          </Link>
        </div>
        <AnalyticsTab />
      </div>
    </main>
  );
}
