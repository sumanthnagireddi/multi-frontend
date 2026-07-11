import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
    getAppBySlug,
    type WorkspaceApp,
    type WorkspaceSlug,
} from '@unified-frontend-monorepo/workspace-data';

@Component({
    selector: 'app-embedded-app-page',
    standalone: true,
    imports: [],
    template: `
    <section class="grid gap-4">
      @if (app && safeUrl) {
        <div class="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_22px_80px_-60px_rgba(15,23,42,0.8)]">
          <iframe [src]="safeUrl" class="h-[78vh] w-full border-0 bg-white" [title]="app.name"></iframe>
        </div>
      }
    </section>
  `,
})
export class EmbeddedAppPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly sanitizer = inject(DomSanitizer);

    readonly app: WorkspaceApp | null;
    readonly safeUrl: SafeResourceUrl | null;

    constructor() {
        const slug = this.route.snapshot.paramMap.get('slug');
        const routePath =
            this.route.snapshot.paramMap.get('page') ??
            this.route.snapshot.paramMap.get('path') ??
            this.route.snapshot.queryParamMap.get('path') ??
            '';

        if (slug && ['angular', 'react', 'next'].includes(slug)) {
            this.app = getAppBySlug(slug as WorkspaceSlug);
            const normalizedPath = routePath
                ? routePath.startsWith('/')
                    ? routePath
                    : `/${routePath}`
                : '';

            let baseUrl = this.app.localUrl;
            if (
                typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'
            ) {
                if (slug === 'react') {
                    baseUrl = 'https://multi-frontends-react.web.app';
                } else if (slug === 'next') {
                    baseUrl = 'https://multi-frontends-next.web.app';
                } else if (slug === 'angular') {
                    baseUrl = 'https://sumanth16.web.app';
                }
            }

            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                `${baseUrl}${normalizedPath}`,
            );
        } else {
            this.app = null;
            this.safeUrl = null;
        }
    }
}
