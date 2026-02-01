import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Button, Tab, Tabs, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { ISettlement } from '../../../../shared/interfaces/settlement.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-settlements',
  imports: [CurrencyPipe, Button, NgIcon, TranslatePipe, Tabs, Tab],
  template: `
    @if (isSettlementsLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else {
      <!-- Settlement drawer options -->
      <ng-template #settlementOptionsTpl>
        <button
          b-button
          class="b-size-lg b-variant-secondary b-rounded-full"
          (click)="selectedSettlement()?.payment_id ? removePayment() : registerPayment()"
        >
          {{ selectedSettlement()?.payment_id ? 'Deshacer el reembolso' : 'Saldar reembolso' }}
        </button>
      </ng-template>

      <!-- All settlements drawer -->
      <ng-template #allSettlementsTpl>
        <b-tabs class="b-rounded-full flex-1" [(value)]="selectedAllSettlementsTab">
          <b-tab value="old-mine" class="flex-1 b-rounded-full"> Pasados </b-tab>
          <b-tab value="others" class="flex-1 b-rounded-full"> Otros </b-tab>
        </b-tabs>
        @if (selectedAllSettlementsTab()[0] === 'old-mine') {
          @if (myPastSettlements().length === 0) {
            <span class="text-center my-2">No tienes rembolsos pasados.</span>
          } @else {
            @for (s of myPastSettlements(); track s.from + '-' + s.to) {
              <div
                (click)="onSettlementClicked(settlementOptionsTpl, s)"
                class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-secondary dark:bg-secondary-dark opacity-50"
              >
                <div class="flex flex-col gap-0.5">
                  <span>
                    {{ 'event.settlements.you-must-past' | translate }}
                    <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
                    {{ 'event.settlements.to' | translate }}
                    {{ participantMap()[s.to] }}
                  </span>
                  <span class="text-xs">
                    {{ 'event.settlements.settled' | translate }}
                  </span>
                </div>
              </div>
            }
          }
        } @else if (selectedAllSettlementsTab()[0] === 'others') {
          @if (othersSuggestedSettlements().length === 0) {
            <span class="text-center my-2">No hay rembolsos sugeridos de otros participantes.</span>
          } @else {
            @for (s of othersSuggestedSettlements(); track s.from + '-' + s.to) {
              <div
                class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-secondary dark:bg-secondary-dark"
              >
                <div class="flex flex-col gap-0.5">
                  <span>
                    {{ participantMap()[s.from] }}
                    {{ 'event.settlements.must' | translate }}
                    <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
                    {{ 'event.settlements.to' | translate }}
                    {{ participantMap()[s.to] }}
                  </span>
                  <span class="text-xs">
                    {{ 'event.settlements.unsettled' | translate }}
                  </span>
                </div>
              </div>
            }
          }
        }
      </ng-template>

      @if (mySuggestedSettlements().length > 0) {
        @for (s of mySuggestedSettlements(); track s.from + '-' + s.to) {
          <div
            (click)="onSettlementClicked(settlementOptionsTpl, s)"
            class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-secondary dark:bg-secondary-dark"
          >
            <div class="flex flex-col gap-0.5">
              <span>
                {{ 'event.settlements.you-must' | translate }}
                <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
                {{ 'event.settlements.to' | translate }}
                {{ participantMap()[s.to] }}
              </span>
              <span class="text-xs">
                {{ 'event.settlements.unsettled' | translate }}
              </span>
            </div>
          </div>
        }
      } @else {
        <span class="text-center">¡Todo saldado por tu parte!</span>
      }
      <button
        b-button
        class="b-size-md b-variant-secondary b-rounded-full self-center"
        (click)="onSeeAllSettlementsButtonClicked(allSettlementsTpl)"
      >
        Ver todos los rembolsos sugeridos
      </button>
    }
  `,
  host: {
    class: 'w-full flex flex-col items-center gap-4 relative',
  },
  providers: [
    provideIcons({
      lucideLoader,
    }),
  ],
})
export class Settlements {
  private _apiEvents = inject(ApiEvents);
  private _state = inject(State);

  selectedSettlement = signal<ISettlement | null>(null);
  selectedAllSettlementsTab = signal<('old-mine' | 'others')[]>(['old-mine']);

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

  loggedParticipant = computed(() => this._state.loggedParticipant());

  mySuggestedSettlements = computed(() => {
    const settlements = this.settlements();
    const logged = this.loggedParticipant();
    if (!logged) return [];
    return (settlements || []).filter((s) => s.from === logged.id && !s.payment_id);
  });

  myPastSettlements = computed(() => {
    const settlements = this.settlements();
    const logged = this.loggedParticipant();
    if (!logged) return [];
    return (settlements || []).filter((s) => s.from === logged.id && !!s.payment_id);
  });

  othersSuggestedSettlements = computed(() => {
    const settlements = this.settlements();
    const logged = this.loggedParticipant();
    if (!logged) return [];
    return (settlements || []).filter((s) => s.from !== logged.id && !s.payment_id);
  });

  onSettlementClicked(template: TemplateRef<unknown>, settlement: ISettlement) {
    this.selectedSettlement.set(settlement);
    this._state.openDynamicDrawer(template);
  }

  async registerPayment() {
    const eventId = this.eventId();
    const s = this.selectedSettlement();
    if (!eventId || !s) return;
    await this._apiEvents.createPayment(eventId, {
      from_participant: s.from,
      to_participant: s.to,
      amount: s.amount,
    });
    this._state.reloadSettlements();
    this._state.reloadBalances();
    this._state.closeDynamicDrawer();
  }

  async removePayment() {
    const eventId = this.eventId();
    const s = this.selectedSettlement();
    if (!eventId || !s?.payment_id) return;
    await this._apiEvents.deletePayment(eventId, s.payment_id);
    this._state.reloadSettlements();
    this._state.reloadBalances();
    this._state.closeDynamicDrawer();
  }

  onSeeAllSettlementsButtonClicked(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }
}
