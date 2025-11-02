import { Component, computed, inject, input, resource } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Button, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBanknoteArrowUp, lucideX } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { BalancesState } from '../../../../core/services/balances-state';
import { ISettlement } from '../../../../shared/interfaces/settlement.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { Payment } from '../../../../shared/interfaces/payment.interface';

@Component({
  selector: 's-settlements',
  imports: [CurrencyPipe, Button, NgIcon, TranslatePipe],
  template: `
    <div class="flex flex-col gap-3 w-full">
      @for (s of settlements.value(); track s.from + '-' + s.to) {
        <div
          class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-xs"
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
  `,
  providers: [
    provideIcons({
      lucideX,
      lucideBanknoteArrowUp,
    }),
  ],
  host: {
    class: 'flex flex-col gap-2 items-center justify-center w-full',
  },
})
export class Settlements {
  private _apiEvents = inject(ApiEvents);
  private _balancesState = inject(BalancesState);

  eventId = input.required<string>();
  participants = input<IParticipant[]>();
  payments = input<Payment[] | null>();

  participantMap = computed(() => {
    const map: Record<string, string> = {};
    for (const p of this.participants() || []) {
      map[p.id] = p.name;
    }
    return map;
  });

  settlements = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return (await this._apiEvents.calculateSettlements(params.id)).settlements;
      } catch (error) {
        console.error('Error loading settlements:', error);
        throw error;
      }
    },
  });

  async registerPayment(s: ISettlement) {
    const eventId = this.eventId();
    if (!eventId) return;
    await this._apiEvents.createPayment(eventId, {
      from_participant: s.from,
      to_participant: s.to,
      amount: s.amount,
    });
    this.settlements.reload();
    this._balancesState.data.reload();
  }

  async removePayment(s: ISettlement) {
    const eventId = this.eventId();
    if (!eventId || !s.payment_id) return;
    await this._apiEvents.deletePayment(eventId, s.payment_id);
    this.settlements.reload();
    this._balancesState.data.reload();
  }
}
