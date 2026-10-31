import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class LandingComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  roles = ['Angular', 'React','Node JS', 'Nest JS', 'React', 'AI Native']
  roleIndex = signal(0);

  currentRole = computed(() => this.roles[this.roleIndex()]);
  currentRoleClass = computed(() => {
    const idx = this.roleIndex();
    if (idx === 0) return 'from-blue-600 to-indigo-600';
    if (idx === 1 || idx === 4) return 'from-violet-600 to-fuchsia-600';
    if (idx === 2 || idx === 3) return 'from-emerald-500 to-teal-500';
    return 'from-amber-500 to-orange-500';
  });

  displayedRole = signal('');
  private isDestroyed = false;
  private timerId: any;
  private revealObserver?: IntersectionObserver;
  private scrollListener?: EventListener;
  private lastScrollY = 0;

  // Typewriter initializer hook
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.runTypewriter();
      requestAnimationFrame(() => this.initScrollEffects());
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.revealObserver?.disconnect();
    if (this.scrollListener) window.removeEventListener('scroll', this.scrollListener);
  }

  private initScrollEffects(): void {
    const elements = document.querySelectorAll('.clerk-home .reveal, .clerk-home .reveal-left, .clerk-home .reveal-right');
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY >= this.lastScrollY;

        if (entry.isIntersecting) {
          target.classList.remove('is-visible', 'reveal-enter-up', 'reveal-enter-down');
          void target.offsetWidth;
          target.classList.add('is-visible', scrollingDown ? 'reveal-enter-down' : 'reveal-enter-up');
        } else {
          target.classList.remove('is-visible', 'reveal-enter-up', 'reveal-enter-down');
        }
        this.lastScrollY = currentScrollY;
      });
    }, { threshold: [0, 0.08, 0.12, 0.35], rootMargin: '0px 0px -4% 0px' });
    elements.forEach((element, index) => {
      element.classList.add('reveal-ready');
      element.setAttribute('style', `${element.getAttribute('style') || ''};--reveal-delay:${Math.min(index % 4, 3) * 70}ms`);
      this.revealObserver?.observe(element);
    });

    this.scrollListener = () => {
      const home = document.querySelector<HTMLElement>('.clerk-home');
      if (home) home.style.setProperty('--scroll-y', `${Math.min(window.scrollY, 900)}px`);
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    this.scrollListener(new Event('scroll'));
  }

  private async runTypewriter() {
    let currentIdx = 0;
    while (!this.isDestroyed) {
      const fullText = this.roles[currentIdx];
      this.roleIndex.set(currentIdx);

      // 1. Type word letter-by-letter
      for (let i = 0; i <= fullText.length; i++) {
        if (this.isDestroyed) return;
        this.displayedRole.set(fullText.slice(0, i));
        await this.delay(120);
      }

      // 2. Pause when fully typed
      await this.delay(1800);

      // 3. Delete word letter-by-letter
      for (let i = fullText.length; i >= 0; i--) {
        if (this.isDestroyed) return;
        this.displayedRole.set(fullText.slice(0, i));
        await this.delay(60);
      }

      // 4. Brief pause before next word
      await this.delay(400);

      currentIdx = (currentIdx + 1) % this.roles.length;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.timerId = setTimeout(resolve, ms);
    });
  }

  calculateExperience(): number {
    const startDate = new Date('2021-11-22');
    const endDate = new Date();

    let yearsExperience = endDate.getFullYear() - startDate.getFullYear();
    let monthsExperience = endDate.getMonth() - startDate.getMonth();
    let daysExperience = endDate.getDate() - startDate.getDate();

    if (daysExperience < 0) {
      monthsExperience--;
      const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      daysExperience += previousMonth.getDate();
    }

    if (monthsExperience < 0) {
      yearsExperience--;
      monthsExperience += 12;
    }

    const totalExperience = yearsExperience + monthsExperience / 12 + daysExperience / 365;
    return parseFloat(totalExperience.toFixed(2));
  }

  openLink(id: string): void {
    const links: Record<string, string> = {
      github: 'https://github.com/sumanthnagireddi',
      linkedin: 'https://www.linkedin.com/in/sumanth-nagireddi-7171081b7/',
      twitter: 'https://twitter.com/sumanthnagireddi',
      mail: 'mailto:you@example.com',
      instagram: 'https://www.instagram.com/sumanthnagireddi/',
      facebook: 'https://www.facebook.com/sumanth.nagireddi',
      whatsapp: 'https://wa.me/sumanth_nagireddi',
    };

    window.open(links[id] ?? links['github'], '_blank', 'noopener');
  }
}
