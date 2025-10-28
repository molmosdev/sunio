import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class=" flex justify-center items-center h-8">
      <a routerLink="/home" class="text-xl font-bold">sunio</a>
    </header>
    <router-outlet />
  `,
  host: {
    class: 'h-dvh flex flex-col p-4 gap-2',
  },
})
export class App {}
