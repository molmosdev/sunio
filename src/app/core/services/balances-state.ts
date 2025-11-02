import { computed, inject, Injectable, linkedSignal, resource } from '@angular/core';
import { ApiEvents } from './api-events';
import { EventState } from './event-state';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class BalancesState {
  private _apiEvents = inject(ApiEvents);
  private _eventState = inject(EventState);
  private _auth = inject(Auth);

  private _eventId = computed(() => this._eventState.id());
  loggedParticipantId = computed(() => this._auth.loggedParticipant()?.id || '');
  personal = computed(() => this.data.value()?.[this.loggedParticipantId()] || 0);

  color = linkedSignal(() => {
    const amount = this.personal();
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'zero';
  });

  data = resource({
    params: () => ({ id: this._eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      const balances = (await this._apiEvents.getBalances(params.id)).balances;
      // Redondear cada balance a 2 decimales
      Object.keys(balances).forEach(
        (key) => (balances[key] = Math.round(balances[key] * 100) / 100),
      );
      return balances;
    },
  });
}
