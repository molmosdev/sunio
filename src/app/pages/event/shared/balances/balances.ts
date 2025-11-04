import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-balances',
  imports: [CurrencyPipe, NgIcon],
  template: `
    @if (isBalancesLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else {
      <div class="flex flex-col gap-3 w-full">
        @for (p of participants(); track p.id) {
          <div
            class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-xs"
            [class.opacity-50]="balances()![p.id] === 0"
          >
            <span>{{ p.name }}</span>
            <span>
              {{ balances()![p.id] | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
            </span>
          </div>
        }
      </div>
    }
  `,
  standalone: true,
  host: {
    class: 'flex flex-col gap-2 items-center justify-center w-full',
  },
  providers: [
    provideIcons({
      lucideLoader,
    }),
  ],
})
export class Balances {
  private _state = inject(State);

  balances = computed(() => this._state.balances.value());
  isBalancesLoading = computed(() => this._state.balances.isLoading());
  participants = computed(() => this._state.participants.value());
}
