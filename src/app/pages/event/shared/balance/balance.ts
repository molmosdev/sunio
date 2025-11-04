import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@basis-ng/primitives';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-balance',
  imports: [CurrencyPipe, TranslatePipe],
  template: `
    @if (personalBalance() > 0) {
      {{ 'balance.they-owe-you' | translate }}
    } @else if (personalBalance() < 0) {
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
  private _state = inject(State);

  personalBalance = computed(() => this._state.personalBalance());
  formattedAmount = computed(() => Math.abs(this.personalBalance()));
}
