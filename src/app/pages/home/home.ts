import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCirclePlus, lucideCloudDownload } from '@ng-icons/lucide';

@Component({
  selector: 's-home',
  imports: [RouterLink, Button, TranslatePipe, NgIcon],
  template: `
    <button b-button routerLink="/create-event" class="b-variant-outlined">
      <ng-icon name="lucideCirclePlus" size="16" />
      {{ 'home.create-event' | translate }}
    </button>
    <button b-button routerLink="/load-event" class="b-variant-outlined">
      <ng-icon name="lucideCloudDownload" size="16" />
      {{ 'home.load-event' | translate }}
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideCirclePlus, lucideCloudDownload })],
})
export class Home {}
