import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
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
    // OnPush avoids the checked-after-check issue:
    // state mutations go through cdr.markForCheck() explicitly.
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <section class="grid gap-4 relative">
      @if (isLoading) {
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 transition-all duration-300 h-[91vh]">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <span class="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide animate-pulse">
            Loading {{ app?.name || 'Application' }}...
          </span>
        </div>
      }
      @if (app && safeUrl) {
        <div class="overflow-hidden">
          <iframe
            #embeddedIframe
            [src]="safeUrl"
            (load)="onIframeLoad()"
            class="h-[91vh] w-full border-0 bg-white dark:bg-slate-900"
            [title]="app.name"
          ></iframe>
        </div>
      }
    </section>
  `,
})
export class EmbeddedAppPageComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly cdr = inject(ChangeDetectorRef);
    private routeSub?: Subscription;

    @ViewChild('embeddedIframe') iframeRef?: ElementRef<HTMLIFrameElement>;

    app: WorkspaceApp | null = null;
    safeUrl: SafeResourceUrl | null = null;
    isLoading = false;

    ngOnInit(): void {
        this.routeSub = combineLatest([
            this.route.paramMap,
            this.route.queryParamMap,
        ]).subscribe(([params, queryParams]) => {
            const slug = params.get('slug');
            const page = params.get('page') ?? '';
            const subpage = params.get('subpage') ? `/${params.get('subpage')}` : '';
            const routePath = `${page}${subpage}` || queryParams.get('path') || '';

            if (slug && ['angular', 'react', 'next'].includes(slug)) {
                this.isLoading = true;
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
                this.isLoading = false;
            }

            // Inform Angular that state changed (needed for OnPush)
            this.cdr.markForCheck();
        });
    }

    onIframeLoad(): void {
        // Defer to next microtask so Angular's current CD cycle is fully done
        // before we mutate isLoading — eliminates NG0100.
        Promise.resolve().then(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }
}
