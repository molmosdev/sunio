import { computed, inject, Injectable, resource, signal, TemplateRef } from '@angular/core';
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

  private _expenseToEdit = signal<Expense | null>(null);
  expenseToEdit = computed(() => this._expenseToEdit());

  setExpenseToEdit(expenseId: string | null): void {
    if (!expenseId) {
      this._expenseToEdit.set(null);
      return;
    }
    const expense = this.expenses.value()?.find((e) => e.id === expenseId) || null;
    this._expenseToEdit.set(expense);
  }

  admins = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return await this._apiEvents.getAdmins(params.id);
    },
  });

  reloadAll(): void {
    this.reloadExpenses();
    this.reloadBalances();
    this.reloadSettlements();
  }

  isDynamicDrawerOpen = signal<boolean>(false);
  dynamicDrawerContent = signal<TemplateRef<unknown> | null>(null);

  private _drawerTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly _drawerDelay = 200;

  openDynamicDrawer(content: TemplateRef<unknown> | null): void {
    if (this._drawerTimeout) {
      clearTimeout(this._drawerTimeout);
      this._drawerTimeout = null;
    }

    if (this.isDynamicDrawerOpen()) {
      this.isDynamicDrawerOpen.set(false);
      this._drawerTimeout = setTimeout(() => {
        this.dynamicDrawerContent.set(content);
        this.isDynamicDrawerOpen.set(true);
        this._drawerTimeout = null;
      }, this._drawerDelay);
    } else {
      this.dynamicDrawerContent.set(content);
      this.isDynamicDrawerOpen.set(true);
    }
  }

  closeDynamicDrawer(): void {
    this.isDynamicDrawerOpen.set(false);

    if (this._drawerTimeout) {
      clearTimeout(this._drawerTimeout);
      this._drawerTimeout = null;
    }
    this._drawerTimeout = setTimeout(() => {
      this.dynamicDrawerContent.set(null);
      this._drawerTimeout = null;
    }, this._drawerDelay);
  }
}
