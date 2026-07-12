import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  openMenu = false;
  isDark = false;

  private themeRequestListener?: (e: MessageEvent) => void;

  ngOnInit(): void {
    // Restore saved theme from localStorage
    const saved = localStorage.getItem('app-theme');
    this.isDark = saved === 'dark'
      || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme(this.isDark);

    // Listen for THEME_READY from embedded iframes and respond with current theme
    this.themeRequestListener = (e: MessageEvent) => {
      if (e.data?.type === 'THEME_READY') {
        const theme = this.isDark ? 'dark' : 'light';
        try {
          (e.source as Window)?.postMessage({ type: 'THEME_CHANGE', theme }, '*');
        } catch {
          // cross-origin safe
        }
      }
    };
    window.addEventListener('message', this.themeRequestListener);
  }

  ngOnDestroy(): void {
    if (this.themeRequestListener) {
      window.removeEventListener('message', this.themeRequestListener);
    }
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme(this.isDark);
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    localStorage.setItem('app-theme', theme);

    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Broadcast to all embedded iframes immediately
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage({ type: 'THEME_CHANGE', theme }, '*');
      } catch {
        // cross-origin safe
      }
    });
  }

  downloadPdf() {
    const pdfUrl = 'assets/Resume.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Resume.pdf';
    link.click();
  }
}
