import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BalanceColor {
  private _state = signal<'positive' | 'negative' | 'zero'>('zero');
  state = computed(() => this._state());

  set(newState: 'positive' | 'negative' | 'zero') {
    this._state.set(newState);
  }
}
