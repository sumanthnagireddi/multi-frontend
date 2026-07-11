import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  workspaceCommands,
  workspacePlaybook,
} from '@unified-frontend-monorepo/workspace-data';

@Component({
  selector: 'app-playbook-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="grid gap-4">
      <div
        class="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_120px_-65px_rgba(15,23,42,0.55)]"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700"
            >
              Angular playbook
            </p>
            <h2
              class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
            >
              The cross-framework contract lives in shared libraries.
            </h2>
            <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Every app can navigate to its own route structure while staying
              connected through one shared data library and one shared React
              component library.
            </p>
          </div>

          <a
            routerLink="/"
            class="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to overview
          </a>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article
          class="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]"
        >
          <p
            class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400"
          >
            Run each app
          </p>
          <div class="mt-5 space-y-3">
            @for (command of commands; track command.label) {
              <div
                class="rounded-3xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div class="flex items-center justify-between gap-4">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ command.label }}
                  </p>
                  <span
                    class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    app target
                  </span>
                </div>
                <pre
                  class="mt-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-teal-300"
                  >{{ command.command }}</pre
                >
                <p class="mt-3 text-sm leading-6 text-slate-600">
                  {{ command.description }}
                </p>
              </div>
            }
          </div>
        </article>

        <article
          class="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]"
        >
          <p
            class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400"
          >
            Shared contract
          </p>
          <div class="mt-5 space-y-3">
            @for (step of playbook; track step.title) {
              <div class="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 class="text-base font-semibold text-slate-900">
                  {{ step.title }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ step.detail }}
                </p>
              </div>
            }
          </div>
        </article>
      </div>
    </section>
  `,
})
export class PlaybookPageComponent {
  readonly commands = workspaceCommands;
  readonly playbook = workspacePlaybook;
}
