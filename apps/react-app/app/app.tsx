import { workspaceCommands } from '@unified-frontend-monorepo/workspace-data';
import { useState } from 'react';
import { Link } from 'react-router';

const navigation = [
  {
    id: 'overview',
    title: 'Overview',
    summary: 'A polished teaching console that mirrors the Claude Certified Architect experience.',
  },
  {
    id: 'domains',
    title: 'Domains',
    summary: 'Inspect the five core architecture domains and how they connect to the monorepo.',
  },
  {
    id: 'playbook',
    title: 'Playbook',
    summary: 'Jump into the shared React playbook and keep the narrative moving.',
  },
];

export function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">

    </main>
  );
}

export default App;
