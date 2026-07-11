import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class LandingComponent {
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
