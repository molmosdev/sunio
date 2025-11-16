import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Button, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBanknoteArrowUp, lucideLoader, lucideX } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { ISettlement } from '../../../../shared/interfaces/settlement.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-settlements',
  imports: [CurrencyPipe, Button, NgIcon, TranslatePipe],
  template: `
    @if (isSettlementsLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else {
      <div class="flex flex-col gap-3 w-full">
        @for (s of settlements(); track s.from + '-' + s.to) {
          <div
            class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-secondary dark:bg-secondary-dark"
            [class.opacity-50]="s.payment_id"
          >
            <div class="flex flex-col gap-0.5">
              <span>
                {{ participantMap()[s.from] }}
                {{ 'event.settlements.must' | translate }}
                <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
                {{ participantMap()[s.to] }}
              </span>
              <span class="text-xs">
                {{
                  s.payment_id
                    ? ('event.settlements.settled' | translate)
                    : ('event.settlements.unsettled' | translate)
                }}
              </span>
            </div>
            <div class="flex gap-2 items-center">
              <button
                b-button
                class="b-variant-ghost b-squared"
                (click)="s.payment_id ? removePayment(s) : registerPayment(s)"
              >
                <ng-icon
                  [name]="s.payment_id ? 'lucideX' : 'lucideBanknoteArrowUp'"
                  size="20"
                  color="currentColor"
                />
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  host: {
    class:
      'w-full flex flex-col items-center h-full max-h-[calc(100vh-18.1rem)] overflow-y-auto pb-4 relative',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideX,
      lucideBanknoteArrowUp,
    }),
  ],
})
export class Settlements {
  private _apiEvents = inject(ApiEvents);
  private _state = inject(State);

  eventId = computed(() => this._state.eventId());
  participants = computed<IParticipant[] | undefined>(() => this._state.participants.value());
  participantMap = computed(() => {
    const map: Record<string, string> = {};
    for (const p of this.participants() || []) {
      map[p.id] = p.name;
    }
    return map;
  });
  settlements = computed(() => this._state.settlements.value());
  isSettlementsLoading = computed(() => this._state.settlements.isLoading());

  async registerPayment(s: ISettlement) {
    const eventId = this.eventId();
    if (!eventId) return;
    await this._apiEvents.createPayment(eventId, {
      from_participant: s.from,
      to_participant: s.to,
      amount: s.amount,
    });
    this._state.reloadSettlements();
    this._state.reloadBalances();
  }

  async removePayment(s: ISettlement) {
    const eventId = this.eventId();
    if (!eventId || !s.payment_id) return;
    await this._apiEvents.deletePayment(eventId, s.payment_id);
    this._state.reloadSettlements();
    this._state.reloadBalances();
  }
}
