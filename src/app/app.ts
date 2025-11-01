import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BalanceColor } from './core/services/balance-color';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class=" flex justify-center items-center h-9">
      <svg
        class="cursor-pointer outline-none"
        routerLink="/home"
        width="30"
        height="30"
        viewBox="0 0 328 328"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="80.5"
          cy="240"
          rx="64.5"
          ry="66"
          transform="rotate(180 80.5 240)"
          fill="currentColor"
        />
        <path
          d="M81 174H181.697C201.176 174 215.49 192.275 210.823 211.187L192.493 285.469C189.517 297.527 178.726 306 166.305 306L81 306V174Z"
          fill="currentColor"
        />
        <ellipse cx="247.5" cy="87" rx="64.5" ry="66" fill="currentColor" />
        <path
          d="M247 153H146.303C126.824 153 112.51 134.725 117.177 115.813L135.507 41.5313C138.483 29.4729 149.274 21 161.695 21L247 21V153Z"
          fill="currentColor"
        />
      </svg>
    </header>
    <router-outlet class="absolute " />
  `,
  host: {
    class: 'h-dvh flex flex-col p-4 gap-6',
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
