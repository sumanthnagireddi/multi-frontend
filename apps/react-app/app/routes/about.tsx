import { useMemo } from 'react';
import { workspaceCommands } from '@unified-frontend-monorepo/workspace-data';

export default function AboutRoute() {
  const commands = useMemo(() => workspaceCommands, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-8 shadow-[0_30px_120px_-65px_rgba(15,23,42,0.55)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
          Playbook
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Shared workspace commands
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          This page shows the shared workspace commands used by Angular, React, and Next.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {commands.map((command) => (
            <article key={command.label} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{command.label}</p>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 px-4 py-3 text-xs text-slate-100">
                {command.command}
              </pre>
              <p className="mt-3 text-sm leading-6 text-slate-600">{command.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
