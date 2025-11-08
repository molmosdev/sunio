import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { State } from './core/services/state';
import { DynamicDrawer } from './shared/components/dynamic-drawer';

@Component({
  selector: 's-root',
  imports: [RouterOutlet, RouterLink, DynamicDrawer],
  template: `
    <header
      [class]="
        'flex justify-center items-center h-22 fixed top-0 left-0 w-full bg-linear-to-b to-transparent z-10 transition-colors duration-150 ' +
        gradientClass()
      "
    >
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
    <s-dynamic-drawer />
    <div
      [class]="
        'flex bg-linear-to-t to-transparent fixed bottom-0 left-0 h-22 w-full transition-colors duration-150 ' +
        gradientClass()
      "
    ></div>
  `,
  host: {
    class: 'h-dvh flex flex-col px-6 gap-6 w-full max-w-md mx-auto relative',
  },
})
export class App {
  private _state = inject(State);

  gradientClass = computed(() =>
    this._state.inDebt()
      ? 'from-balance-negative dark:from-balance-negative-dark'
      : 'from-background dark:from-background-dark',
  );

  constructor() {
    effect(() => {
      this.applyBodyClass(this._state.inDebt());
    });
  }

  applyBodyClass(negative: boolean) {
    const body = document.body;
    body.classList.remove(
      'bg-balance-negative',
      'dark:bg-balance-negative-dark',
      'bg-background',
      'dark:bg-background-dark',
    );
    if (negative) {
      body.classList.add('bg-balance-negative', 'dark:bg-balance-negative-dark');
      return;
    } else {
      body.classList.add('bg-background', 'dark:bg-background-dark');
    }
  }
}
