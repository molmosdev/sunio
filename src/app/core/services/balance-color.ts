import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BalanceColor {
  state = signal<'positive' | 'negative' | 'zero'>('zero');
}
