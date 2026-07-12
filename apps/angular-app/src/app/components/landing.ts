import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class LandingComponent implements OnInit, OnDestroy {
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

  // Typewriter initializer hook
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.runTypewriter();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
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
      github: 'https://github.com/your-profile',
      linkedin: 'https://www.linkedin.com/in/your-profile',
      twitter: 'https://twitter.com/your-profile',
      mail: 'mailto:you@example.com',
      instagram: 'https://www.instagram.com/your-profile',
      facebook: 'https://www.facebook.com/your-profile',
      whatsapp: 'https://wa.me/your-number',
    };

    window.open(links[id] ?? links['github'], '_blank', 'noopener');
  }
}
