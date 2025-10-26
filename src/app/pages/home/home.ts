import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, TranslatePipe } from '@basis-ng/primitives';

@Component({
  selector: 's-home',
  imports: [RouterLink, Button, TranslatePipe],
  template: `
    <button b-button routerLink="/create-event" class="b-variant-outlined">
      {{ 'home.create-event' | translate }}
    </button>
    <button b-button routerLink="/load-event" class="b-variant-outlined">
      {{ 'home.load-event' | translate }}
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
})
export class Home {}
