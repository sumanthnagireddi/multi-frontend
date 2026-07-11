import Link from 'next/link';
import { WorkspaceShowcase } from '@unified-frontend-monorepo/react-ui';
import { workspaceCommands } from '@unified-frontend-monorepo/workspace-data';

export default function Index() {
  return (
    <main>
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
              Unified frontend monorepo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Next.js app
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-white"
            >
              Overview
            </Link>
            <Link
              href="/playbook"
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Playbook
            </Link>
            <a
              href="http://localhost:4200"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Angular
            </a>
            <a
              href="http://localhost:4201"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              React
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <WorkspaceShowcase
          currentSlug="next"
          eyebrow="Next app router"
          title="Next is sharing both workspace data and the React UI library."
          description="This page renders the same shared React showcase used by the React app, while still keeping the Next.js App Router and SSR-friendly structure."
          actions={
            <>
              <Link
                href="/playbook"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Next playbook
              </Link>
              <a
                href="http://localhost:4202"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Launch Next on http://localhost:4202
              </a>
            </>
          }
        />

        <section className="mt-6 rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Run targets
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workspaceCommands.map((command) => (
              <article
                key={command.label}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {command.label}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-teal-300">
                  {command.command}
                </pre>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {command.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
