import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@basis-ng/primitives';

@Component({
  selector: 's-home',
  imports: [RouterLink, Button],
  template: `
    <button b-button routerLink="/create-event" class="b-variant-outlined">Create Event</button>
    <button b-button routerLink="/load-event" class="b-variant-outlined">Load Event</button>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
})
export class Home {}
