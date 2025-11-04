import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { State } from './core/services/state';

export const eventIdResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const eventId = route.paramMap.get('eventId');
  inject(State).setEventId(eventId);
  return;
};

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
    resolve: { eventId: eventIdResolver },
  },
];
