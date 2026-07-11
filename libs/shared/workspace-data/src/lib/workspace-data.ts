export type WorkspaceSlug = 'angular' | 'react' | 'next';

export type WorkspaceApp = {
  slug: WorkspaceSlug;
  name: string;
  framework: string;
  localUrl: string;
  focus: string;
  description: string;
};

export type WorkspaceCapability = {
  title: string;
  detail: string;
};

export type WorkspaceCommand = {
  label: string;
  command: string;
  description: string;
};

export type WorkspacePlaybookStep = {
  title: string;
  detail: string;
};

export const workspaceApps: WorkspaceApp[] = [
  {
    slug: 'angular',
    name: 'Angular app',
    framework: 'Angular',
    localUrl: 'http://localhost:4200',
    focus: 'Standalone shell',
    description:
      'Angular handles the shell experience and reads the shared workspace catalog from the monorepo.',
  },
  {
    slug: 'react',
    name: 'React app',
    framework: 'React Router',
    localUrl: 'http://localhost:4201',
    focus: 'Route-driven client',
    description:
      'React uses shared data plus a shared React UI component library so it stays aligned with Next.',
  },
  {
    slug: 'next',
    name: 'Next app',
    framework: 'Next.js',
    localUrl: 'http://localhost:4202',
    focus: 'App Router view',
    description:
      'Next consumes the same shared libraries, giving you SSR-ready pages without duplicating workspace logic.',
  },
];

export const workspaceCapabilities: WorkspaceCapability[] = [
  {
    title: 'Shared workspace-data lib',
    detail:
      'All three apps import the same typed app catalog, command list, and architecture notes.',
  },
  {
    title: 'Shared react-ui lib',
    detail:
      'React and Next render the same showcase component so both apps stay visually in sync.',
  },
  {
    title: 'Tailwind in every app',
    detail:
      'Angular, React, and Next each have their own Tailwind config while still scanning shared library files.',
  },
];

export const workspaceCommands: WorkspaceCommand[] = [
  {
    label: 'Angular',
    command: 'npm run dev:angular',
    description: 'Runs the Angular shell on port 4200.',
  },
  {
    label: 'React',
    command: 'npm run dev:react',
    description: 'Runs the React Router app on port 4201.',
  },
  {
    label: 'Next',
    command: 'npm run dev:next',
    description: 'Runs the Next.js app on port 4202.',
  },
];

export const workspacePlaybook: WorkspacePlaybookStep[] = [
  {
    title: 'One source of truth',
    detail:
      'The workspace-data library keeps URLs, copy, and run commands centralized instead of repeating them in every app.',
  },
  {
    title: 'Shared React presentation layer',
    detail:
      'The react-ui library provides a reusable showcase section that React and Next both render directly.',
  },
  {
    title: 'Framework-specific routing',
    detail:
      'Angular uses the router, React uses React Router, and Next uses the App Router so each app stays idiomatic.',
  },
];

export function getAppBySlug(slug: WorkspaceSlug): WorkspaceApp {
  const app = workspaceApps.find((candidate) => candidate.slug === slug);

  if (!app) {
    throw new Error(`Unknown workspace app slug: ${slug}`);
  }

  return app;
}

export function getSiblingApps(slug: WorkspaceSlug): WorkspaceApp[] {
  return workspaceApps.filter((candidate) => candidate.slug !== slug);
}
