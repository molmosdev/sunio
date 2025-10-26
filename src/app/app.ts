import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from '@basis-ng/primitives';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink, Button],
  template: `
    <router-outlet />
    <div class="flex gap-4">
      <button b-button routerLink="/create-event" class="flex-1 b-variant-outlined">
        Create Event
      </button>
      <button b-button routerLink="/" class="flex-1 b-variant-outlined">Load Event</button>
    </div>
  `,
  host: {
    class: 'h-dvh flex flex-col p-6',
  },
})
export class App {}
