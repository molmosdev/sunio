import { computed, inject, Injectable, linkedSignal, resource, signal } from '@angular/core';
import { ApiEvents } from './api-events';
import { IParticipant } from '../../shared/interfaces/participant.interface';
import { Expense } from '../../shared/interfaces/expense.interface';

@Injectable({
  providedIn: 'root',
})
export class State {
  private _apiEvents = inject(ApiEvents);

  recentEvents = resource({
    loader: async () => (await this._apiEvents.getRecentEvents()).recentEvents,
  });

  reloadRecentEvents(): void {
    this.recentEvents.reload();
  }

  private _eventId = signal<string | null>(null);
  eventId = computed(() => this._eventId());

  setEventId(id: string | null): void {
    this._eventId.set(id);
  }

  event = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return await this._apiEvents.getEvent(params.id);
    },
  });

  reloadEvent(): void {
    this.event.reload();
  }

  expenses = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return await this._apiEvents.getExpenses(params.id);
    },
  });

  reloadExpenses(): void {
    this.expenses.reload();
  }

  balances = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      const balances = (await this._apiEvents.getBalances(params.id)).balances;
      Object.keys(balances).forEach(
        (key) => (balances[key] = Math.round(balances[key] * 100) / 100),
      );
      return balances;
    },
  });

  reloadBalances(): void {
    this.balances.reload();
  }

  personalBalance = computed(
    () => this.balances.value()?.[this.loggedParticipant()?.id || ''] || 0,
  );

  inDebt = linkedSignal(() => this.personalBalance() < 0);

  participants = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return await this._apiEvents.getParticipants(params.id);
    },
  });

  reloadParticipants(): void {
    this.participants.reload();
  }

  settlements = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return (await this._apiEvents.calculateSettlements(params.id)).settlements;
    },
  });

  reloadSettlements(): void {
    this.settlements.reload();
  }

  private _loggedParticipant = signal<IParticipant | null>(null);
  loggedParticipant = computed(() => this._loggedParticipant());

  setLoggedParticipant(participant: IParticipant | null): void {
    this._loggedParticipant.set(participant);
  }

  private _expenseForm = signal<{
    active: boolean;
    expense: Expense | undefined;
  }>({
    active: false,
    expense: undefined,
  });

  expenseForm = computed(() => this._expenseForm());

  openExpenseForm(expense?: Expense): void {
    this._expenseForm.set({ active: true, expense });
  }

  closeExpenseForm(): void {
    this._expenseForm.set({ active: false, expense: undefined });
  }

  reloadAll(): void {
    this.reloadExpenses();
    this.reloadBalances();
    this.reloadSettlements();
  }
}
