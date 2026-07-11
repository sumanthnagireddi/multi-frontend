import { Route } from '@angular/router';
import { EmbeddedAppPageComponent } from './pages/embedded-app-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { PlaybookPageComponent } from './pages/playbook-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'app/:slug/:page',
    component: EmbeddedAppPageComponent,
  },
];
