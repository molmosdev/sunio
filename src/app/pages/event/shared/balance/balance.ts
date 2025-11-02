import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BalancesState } from '../../../../core/services/balances-state';

@Component({
  selector: 's-balance',
  imports: [CurrencyPipe],
  template: `{{ data() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}`,
  host: {
    class: 'text-6xl font-semibold  flex items-center justify-center',
  },
})
export class Balance {
  private _balancesState = inject(BalancesState);

  data = computed(() => this._balancesState.personal());
}
