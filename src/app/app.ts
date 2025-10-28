import { Component, computed, inject } from '@angular/core';
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
    '[class.bg-background]': "balanceColorState() === 'zero'",
    '[class.dark:bg-background-dark]': "balanceColorState() === 'zero'",
    '[class.bg-balance-positive]': "balanceColorState() === 'positive'",
    '[class.dark:bg-balance-positive-dark]': "balanceColorState() === 'positive'",
    '[class.bg-balance-negative]': "balanceColorState() === 'negative'",
    '[class.dark:bg-balance-negative-dark]': "balanceColorState() === 'negative'",
  },
})
export class App {
  balanceColor = inject(BalanceColor);
  balanceColorState = computed(() => this.balanceColor.state());
}
