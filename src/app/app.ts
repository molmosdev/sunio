import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <ul>
      <li><a routerLink="/create-event">Create Event</a></li>
      <li><a routerLink="/">Load Event</a></li>
    </ul>
    <router-outlet />
  `,
  styles: [],
})
export class App {}
