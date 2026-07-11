import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
  openMenu = false;
  
  downloadPdf() {
    const pdfUrl = 'assets/Resume.pdf'; // Path to your PDF file
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Resume.pdf'; // Specify the desired filename for the downloaded PDF
    link.click();
  }
}
