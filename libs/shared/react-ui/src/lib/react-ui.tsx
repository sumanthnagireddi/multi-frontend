import { ReactNode } from 'react';
import {
  getAppBySlug,
  getSiblingApps,
  workspaceCapabilities,
  type WorkspaceApp,
  type WorkspaceSlug,
} from '@unified-frontend-monorepo/workspace-data';

function buildAngularRoute(slug: WorkspaceSlug) {
  return `/app/${slug}`;
}

type WorkspaceShowcaseProps = {
  currentSlug: WorkspaceSlug;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

const appBadgeStyles: Record<WorkspaceSlug, string> = {
  angular: 'bg-orange-100 text-orange-700',
  react: 'bg-sky-100 text-sky-700',
  next: 'bg-violet-100 text-violet-700',
};

function AppCard({ app }: { app: WorkspaceApp }) {
  return (
    <a
      href={buildAngularRoute(app.slug)}
      className="group block rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{app.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-400">
            {app.framework}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${appBadgeStyles[app.slug]}`}
        >
          {app.focus}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{app.description}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
        {app.localUrl}
      </p>
    </a>
  );
}

export function WorkspaceShowcase({
  currentSlug,
  eyebrow,
  title,
  description,
  actions,
}: WorkspaceShowcaseProps) {
  const current = getAppBySlug(currentSlug);
  const siblings = getSiblingApps(currentSlug);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/90 shadow-[0_30px_120px_-65px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="grid gap-8 lg:grid-cols-[1.45fr,0.95fr]">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              This view is powered by the shared monorepo libraries.
            </div>
          </div>
          <div className="bg-slate-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
              Framework map
            </p>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-teal-300">
                Current app
              </p>
              <p className="mt-2 text-2xl font-semibold">{current.name}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {current.description}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {siblings.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {workspaceCapabilities.map((capability) => (
          <article
            key={capability.title}
            className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Shared capability
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
              {capability.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {capability.detail}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default WorkspaceShowcase;
