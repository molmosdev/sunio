import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BalancesState } from '../../../../core/services/balances-state';
import { TranslatePipe } from '@basis-ng/primitives';

@Component({
  selector: 's-balance',
  imports: [CurrencyPipe, TranslatePipe],
  template: `
    @if (amount() > 0) {
      {{ 'balance.they-owe-you' | translate }}
    } @else if (amount() < 0) {
      {{ 'balance.you-owe-them' | translate }}
    } @else {
      {{ 'balance.all-settled' | translate }}
    }
    <span class="text-6xl font-semibold">
      {{ formattedAmount() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</span
    >
  `,
  host: {
    class: 'flex flex-col gap-1 items-center justify-center',
  },
})
export class Balance {
  private _balancesState = inject(BalancesState);

  amount = computed(() => this._balancesState.personal());
  formattedAmount = computed(() => Math.abs(this._balancesState.personal()));
}
