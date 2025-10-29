import { Component, computed, effect, inject, input } from '@angular/core';
import { TBalance } from '../../../../shared/types/balance.type';
import { CurrencyPipe } from '@angular/common';
import { BalanceColor } from '../../../../core/services/balance-color';

@Component({
  selector: 's-balance',
  imports: [CurrencyPipe],
  template: `{{ balance() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}`,
  host: {
    class: 'text-6xl font-semibold  flex items-center justify-center',
  },
})
export class Balance {
  balances = input<TBalance>();
  loggedParticipantId = input.required<string>();
  balance = computed(() => this.balances()?.[this.loggedParticipantId()] || 0);
  private _balanceColor = inject(BalanceColor);

  constructor() {
    effect(() =>
      this._balanceColor.set(
        this.balance() > 0 ? 'positive' : this.balance() < 0 ? 'negative' : 'zero',
      ),
    );
  }
}
