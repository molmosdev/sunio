import { Component, computed, inject, OnInit, resource, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiEvents } from '../../core/services/api-events';
import { Expense } from '../../shared/interfaces/expense.interface';
import { Button, Tab, Tabs, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideLoader, lucidePlus } from '@ng-icons/lucide';
import { Balance } from './shared/balance/balance';
import { Balances } from './shared/balances/balances';
import { Title } from './shared/title/title';
import { Login } from './shared/login/login';
import { Expenses } from './shared/expenses/expenses';
import { ExpenseForm } from './shared/expense-form/expense-form';
import { Settlements } from './shared/settlements/settlements';
import { FormsModule } from '@angular/forms';
import { BalancesState } from '../../core/services/balances-state';
import { EventState } from '../../core/services/event-state';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 's-event',
  imports: [
    Button,
    NgIcon,
    Login,
    Title,
    Balance,
    Balances,
    Expenses,
    ExpenseForm,
    Settlements,
    TranslatePipe,
    Tabs,
    Tab,
    FormsModule,
  ],
  template: `
    <button b-button (click)="goBack()" class="b-variant-outlined b-squared fixed top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    @let event = eventState.data;
    @if (event.isLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (event.error()) {
      {{ 'event.not-found-title' | translate }}
      <button b-button (click)="goBack()" class="b-variant-outlined">
        {{ 'event.go-home' | translate }}
      </button>
    } @else {
      @if (!addingExpense() && !expenseToEdit()) {
        <s-title
          [event]="event.value()"
          [editable]="!!loggedParticipant()"
          (reload)="event.reload()"
        />
      }
      <div class="flex-1 w-full flex gap-6 flex-col items-center">
        @if (loggedParticipant()) {
          @if (addingExpense() || expenseToEdit()) {
            <s-expense-form
              [eventId]="eventId()"
              [participants]="participants.value()!"
              [expenseToEdit]="expenseToEdit()"
              (updatedOrCreated)="goBack()"
            />
          } @else {
            <s-balance />
            @if (selectedTab()[0] === 'expenses') {
              <s-expenses
                [eventId]="eventId()"
                [participants]="participants.value()!"
                [(expenseToEdit)]="expenseToEdit"
              />
            } @else if (selectedTab()[0] === 'balances') {
              <s-balances [participants]="participants.value()!" />
            } @else if (selectedTab()[0] === 'settlements') {
              <s-settlements [eventId]="eventId()" [participants]="participants.value()" />
            }
          }
          @if (!addingExpense() && !expenseToEdit()) {
            <div class="w-full absolute bottom-0 flex gap-2 items-center">
              <b-tabs class="b-size-lg flex-1" [(ngModel)]="selectedTab">
                <b-tab value="expenses" class="flex-1">
                  {{ 'event.expenses.title' | translate }}
                </b-tab>
                <b-tab value="balances" class="flex-1">
                  {{ 'event.balances.title' | translate }}
                </b-tab>
                <b-tab value="settlements" class="flex-1">
                  {{ 'event.settlements.title' | translate }}
                </b-tab>
              </b-tabs>
              <button b-button class="b-squared" (click)="addingExpense.set(true)">
                <ng-icon name="lucidePlus" size="16" color="currentColor" />
              </button>
            </div>
          }
        } @else {
          <s-login [eventId]="eventId()" [participants]="participants.value()!" />
        }
      </div>
    }
  `,
  styles: ``,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full relative w-full',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideArrowLeft,
      lucidePlus,
    }),
  ],
})
export class Event implements OnInit {
  private _router = inject(Router);
  private _balances = inject(BalancesState);
  private _apiEvents = inject(ApiEvents);
  private _auth = inject(Auth);
  private _activatedRoute = inject(ActivatedRoute);
  eventState = inject(EventState);

  eventId = computed(() => this.eventState.id());
  loggedParticipant = computed(() => this._auth.loggedParticipant());

  expenseToEdit = signal<Expense | null>(null);
  selectedTab = signal<('expenses' | 'balances' | 'settlements')[]>(['expenses']);
  addingExpense = signal(false);

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

  ngOnInit(): void {
    this.eventState.setId(this._activatedRoute.snapshot.params['eventId']);
  }

  goBack() {
    this._balances.data.reload();
    if (this.expenseToEdit() || this.addingExpense()) {
      this.expenseToEdit.set(null);
      this.addingExpense.set(false);
    } else if (this.loggedParticipant()) {
      this._auth.setLoggedParticipant(null);
    } else {
      this._router.navigate(['/home']);
    }
  }
}
