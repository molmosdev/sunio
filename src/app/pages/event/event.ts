import { Component, inject, resource, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiEvents } from '../../core/services/api-events';
import { IParticipant } from '../../shared/interfaces/participant.interface';
import { Expense } from '../../shared/interfaces/expense.interface';
import { Button } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideLoader, lucidePlus } from '@ng-icons/lucide';
import { Balance } from './shared/balance/balance';
import { Title } from './shared/title/title';
import { Login } from './shared/login/login';
import { Expenses } from './shared/expenses/expenses';
import { BalanceColor } from '../../core/services/balance-color';
import { ExpenseForm } from './shared/expense-form/expense-form';
import { Settlements } from './shared/settlements/settlements';

@Component({
  selector: 's-event',
  imports: [Button, NgIcon, Login, Title, Balance, Expenses, ExpenseForm, Settlements],
  template: `
    <button b-button (click)="goBack()" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    @if (event.isLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else {
      @if (!addingExpense() && !expenseToEdit()) {
        <s-title
          [event]="event.value()"
          [editable]="!!loggedParticipant()"
          (reload)="event.reload()"
        />
      }
      @if (loggedParticipant()) {
        @if (addingExpense() || expenseToEdit()) {
          <s-expense-form
            [eventId]="eventId()"
            [participants]="participants.value()!"
            [expenseToEdit]="expenseToEdit()"
            (updatedOrCreated)="goBack()"
          />
        } @else {
          <s-balance
            [balances]="balances.value()?.balances"
            [loggedParticipantId]="loggedParticipant()!.id"
          />
          <s-expenses
            [eventId]="eventId()"
            [participants]="participants.value()!"
            [(expenseToEdit)]="expenseToEdit"
            (expenseDeleted)="balances.reload()"
          />
          <button b-button class="b-variant-outlined" (click)="addingExpense.set(true)">
            <ng-icon name="lucidePlus" size="16" color="currentColor" />
            Add expense
          </button>
          <s-settlements [data]="settlements.value()" [participants]="participants.value()" />
        }
      } @else {
        <s-login
          [eventId]="eventId()"
          [participants]="participants.value()!"
          [(loggedParticipant)]="loggedParticipant"
        />
      }
    }
  `,
  styles: ``,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideArrowLeft,
      lucidePlus,
    }),
  ],
})
export class Event {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _balanceColor = inject(BalanceColor);
  private _apiEvents = inject(ApiEvents);

  eventId = signal(this._activatedRoute.snapshot.params['eventId']);
  loggedParticipant = signal<IParticipant | null>(null);
  addingExpense = signal(false);
  expenseToEdit = signal<Expense | null>(null);

  event = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this._apiEvents.getEvent(params.id);
      } catch (error) {
        console.error('Error loading event:', error);
        throw error;
      }
    },
  });

  participants = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this._apiEvents.getParticipants(params.id);
      } catch (error) {
        console.error('Error loading participants:', error);
        throw error;
      }
    },
  });

  balances = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this._apiEvents.getBalances(params.id);
      } catch (error) {
        console.error('Error loading balances:', error);
        throw error;
      }
    },
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

  goBack() {
    if (this.expenseToEdit() || this.addingExpense()) {
      this.balances.reload();
      this.settlements.reload();
      this.expenseToEdit.set(null);
      this.addingExpense.set(false);
    } else if (this.loggedParticipant()) {
      this.loggedParticipant.set(null);
      this._balanceColor.set('zero');
    } else {
      this._router.navigate(['/home']);
    }
  }
}
