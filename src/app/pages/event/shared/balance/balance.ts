import { Component, computed, inject, input, OnInit } from '@angular/core';
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
export class Balance implements OnInit {
  balances = input<TBalance>();
  loggedParticipantId = input<string>();
  balance = computed(() => {
    const participantId = this.loggedParticipantId();
    if (!participantId) return 0;
    return this.balances()?.[participantId] || 0;
  });
  balanceColor = inject(BalanceColor);

  ngOnInit() {
    this.updateBalanceColor();
  }

  updateBalanceColor() {
    const balance = this.balance();
    if (balance > 0) {
      this.balanceColor.state.set('positive');
    } else if (balance < 0) {
      this.balanceColor.state.set('negative');
    } else {
      this.balanceColor.state.set('zero');
    }
  }
}
