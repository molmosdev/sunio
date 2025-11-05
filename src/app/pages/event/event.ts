import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Tab, Tabs, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideLoader,
  lucideUserLock,
  lucidePlus,
  lucideRefreshCcw,
} from '@ng-icons/lucide';
import { Balance } from './shared/balance/balance';
import { Balances } from './shared/balances/balances';
import { Title } from './shared/title/title';
import { Login } from './shared/login/login';
import { Expenses } from './shared/expenses/expenses';
import { ExpenseForm } from './shared/expense-form/expense-form';
import { Settlements } from './shared/settlements/settlements';
import { FormsModule } from '@angular/forms';
import { State } from '../../core/services/state';

@Component({
  selector: 's-event',
  imports: [
    Button,
    RouterLink,
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
    <button
      b-button
      [routerLink]="!isExpenseFormVisible() && !loggedParticipant() ? '/home' : null"
      (click)="isExpenseFormVisible() ? state.closeExpenseForm() : cleanLoggedParticipant()"
      class="b-variant-outlined b-squared fixed top-6 left-6 z-20"
    >
      <ng-icon
        [name]="
          loggedParticipant() && !isExpenseFormVisible() ? 'lucideUserLock' : 'lucideArrowLeft'
        "
        size="16"
        color="currentColor"
      />
    </button>
    @if (isEventLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (hasEventError()) {
      {{ 'event.not-found-title' | translate }}
      <button b-button routerLink="/home" class="b-variant-outlined">
        {{ 'event.go-home' | translate }}
      </button>
    } @else {
      @if (!isExpenseFormVisible()) {
        <s-title />
      }
      <div class="flex-1 w-full flex gap-6 flex-col items-cente">
        @if (loggedParticipant()) {
          <button
            b-button
            (click)="state.reloadAll()"
            class="b-variant-outlined b-squared fixed top-6 right-6 z-20"
          >
            <ng-icon name="lucideRefreshCcw" size="16" color="currentColor" />
          </button>
          @if (isExpenseFormVisible()) {
            <s-expense-form />
          } @else {
            <s-balance />
            @if (selectedTab()[0] === 'expenses') {
              <s-expenses />
            } @else if (selectedTab()[0] === 'balances') {
              <s-balances />
            } @else if (selectedTab()[0] === 'settlements') {
              <s-settlements />
            }
          }
          @if (!isExpenseFormVisible()) {
            <div class="w-full absolute bottom-6 flex gap-2 items-center z-10">
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
              <button b-button class="b-squared" (click)="state.openExpenseForm()">
                <ng-icon name="lucidePlus" size="16" color="currentColor" />
              </button>
            </div>
          }
        } @else {
          <s-login />
        }
      </div>
    }
  `,
  styles: ``,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full relative w-full py-22',
  },
  providers: [
    provideIcons({
      lucideUserLock,
      lucideLoader,
      lucideArrowLeft,
      lucidePlus,
      lucideRefreshCcw,
    }),
  ],
})
export class Event {
  state = inject(State);

  event = computed(() => this.state.event.value());
  isEventLoading = computed(() => this.state.event.isLoading());
  hasEventError = computed(() => this.state.event.error());
  participants = computed(() => this.state.participants.value());
  loggedParticipant = computed(() => this.state.loggedParticipant());
  selectedTab = signal<('expenses' | 'balances' | 'settlements')[]>(['expenses']);

  isExpenseFormVisible = computed(() => this.state.expenseForm().active);

  cleanLoggedParticipant() {
    this.state.setLoggedParticipant(null);
  }
}
