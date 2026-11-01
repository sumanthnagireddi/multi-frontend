import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { HeaderComponent } from './components/header';

@Component({
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  readonly title = 'angular-app';
  isHome = false;
  isAi = false;
  isFinance = false;
  isResources = false;
  mobileMenuOpen = false;
  private routerSubscription?: Subscription;
  isDark = false;
  private themeRequestListener?: (event: MessageEvent) => void;
  private themeChangeListener?: (event: Event) => void;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('app-theme');
    this.isDark = saved === 'dark'
      || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme(this.isDark);

    this.setHome(this.router.url);
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.setHome(event.urlAfterRedirects));
    this.themeRequestListener = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_READY') {
        const theme = this.isDark ? 'dark' : 'light';
        (event.source as Window)?.postMessage({ type: 'THEME_CHANGE', theme }, '*');
      }
    };
    window.addEventListener('message', this.themeRequestListener);
    this.themeChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: string }>;
      if (customEvent.detail?.theme === 'dark' || customEvent.detail?.theme === 'light') {
        this.isDark = customEvent.detail.theme === 'dark';
      }
    };
    window.addEventListener('app-theme-change', this.themeChangeListener);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    if (this.themeRequestListener) window.removeEventListener('message', this.themeRequestListener);
    if (this.themeChangeListener) window.removeEventListener('app-theme-change', this.themeChangeListener);
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme(this.isDark);
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll<HTMLIFrameElement>('iframe').forEach(iframe => {
      iframe.contentWindow?.postMessage({ type: 'THEME_CHANGE', theme }, '*');
    });
  }

  private setHome(url: string): void {
    this.mobileMenuOpen = false;
    this.isHome = url === '/' || url === '';
    this.isAi = url === '/ai' || url.startsWith('/ai?');
    this.isFinance = url.includes('/app/next/finance') || url.includes('/finance');
    this.isResources = url.includes('/app/react/resources') || url.includes('/resources');
  }
}
