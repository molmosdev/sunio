import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="font-semibold flex justify-center">
      <a routerLink="/home">sunio</a>
    </header>
    <router-outlet />
  `,
  host: {
    class: 'h-dvh flex flex-col p-6',
  },
})
export class App {}
