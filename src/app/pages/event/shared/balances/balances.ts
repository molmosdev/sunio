import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { BalancesState } from '../../../../core/services/balances-state';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';

@Component({
  selector: 's-balances',
  imports: [CurrencyPipe, NgIcon],
  template: `
    @let b = balances();
    @if (!b) {
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
            [class.opacity-50]="b[p.id] === 0"
          >
            <span>{{ p.name }}</span>
            <span>
              {{ b[p.id] | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
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
  private _balancesState = inject(BalancesState);

  participants = input<IParticipant[]>();

  balances = computed(() => this._balancesState.data.value());
}
