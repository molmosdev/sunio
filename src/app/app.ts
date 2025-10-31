import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BalanceColor } from './core/services/balance-color';

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
export class App {
  balanceColor = inject(BalanceColor);

  constructor() {
    effect(() => {
      this.applyBodyClass(this.balanceColor.state());
    });
  }

  applyBodyClass(state: string) {
    const body = document.body;
    body.classList.remove(
      'bg-balance-positive',
      'dark:bg-balance-positive-dark',
      'bg-balance-negative',
      'dark:bg-balance-negative-dark',
      'bg-background',
      'dark:bg-background-dark',
    );
    switch (state) {
      case 'positive':
        body.classList.add('bg-balance-positive', 'dark:bg-balance-positive-dark');
        break;
      case 'negative':
        body.classList.add('bg-balance-negative', 'dark:bg-balance-negative-dark');
        break;
      case 'zero':
      default:
        body.classList.add('bg-background', 'dark:bg-background-dark');
        break;
    }
  }
}
