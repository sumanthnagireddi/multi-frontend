import { Component } from '@angular/core';
import {  LandingComponent } from '../components/landing';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ LandingComponent],
  template: `
    <app-landing></app-landing>
  `,
})
export class HomePageComponent {
}
