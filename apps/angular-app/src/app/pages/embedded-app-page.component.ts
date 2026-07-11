import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
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
export class EmbeddedAppPageComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly sanitizer = inject(DomSanitizer);
    private routeSub?: Subscription;

    app: WorkspaceApp | null = null;
    safeUrl: SafeResourceUrl | null = null;

    ngOnInit(): void {
        this.routeSub = combineLatest([
            this.route.paramMap,
            this.route.queryParamMap,
        ]).subscribe(([params, queryParams]) => {
            const slug = params.get('slug');
            const routePath =
                params.get('page') ??
                params.get('path') ??
                queryParams.get('path') ??
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
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }
}
