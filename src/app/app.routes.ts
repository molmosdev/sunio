import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
  },
  {
    path: 'create-event',
    loadComponent: () => import('./pages/create-event/create-event').then((c) => c.CreateEvent),
  },
  {
    path: ':eventId',
    loadComponent: () => import('./pages/event/event').then((c) => c.Event),
  },
];
