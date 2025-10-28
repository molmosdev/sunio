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
    class:
      'h-dvh flex flex-col p-4 gap-2 text-font dark:text-font-dark transition-colors duration-500',
    '[class]': 'balancedThemeClasses()',
  },
})
export class App {
  balanceColor = inject(BalanceColor);
  balancedThemeClasses = computed(() => {
    switch (this.balanceColor.state()) {
      case 'positive':
        return 'bg-balance-positive dark:bg-balance-positive-dark';
      case 'negative':
        return 'bg-balance-negative dark:bg-balance-negative-dark';
      default:
        return 'bg-background dark:bg-background-dark';
    }
  });
}
