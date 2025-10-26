import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/load-event/load-event').then((c) => c.LoadEvent),
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
