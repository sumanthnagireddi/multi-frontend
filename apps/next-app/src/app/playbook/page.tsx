import Link from 'next/link';
import { workspacePlaybook } from '@unified-frontend-monorepo/workspace-data';

export default function PlaybookPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <section className="grid gap-4">
        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_120px_-65px_rgba(15,23,42,0.55)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
                Next playbook
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Shared libraries keep Next aligned with the rest of the
                workspace.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                The Next.js app keeps its own App Router flow, but it is still
                connected to the other apps through the same shared data and
                component libraries.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to overview
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {workspacePlaybook.map((step) => (
            <article
              key={step.title}
              className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Shared contract
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
