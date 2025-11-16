import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Tab, Tabs, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePlus, lucideCog } from '@ng-icons/lucide';
import { Balances } from './shared/balances/balances';
import { Login } from './shared/login/login';
import { Expenses } from './shared/expenses/expenses';
import { ExpenseForm } from './shared/expense-form/expense-form';
import { Settlements } from './shared/settlements/settlements';
import { State } from '../../core/services/state';
import { Settings } from './shared/settings/settings';

@Component({
  selector: 's-event',
  imports: [
    Button,
    RouterLink,
    NgIcon,
    Login,
    Balances,
    Expenses,
    ExpenseForm,
    Settlements,
    TranslatePipe,
    Tabs,
    Tab,
    Settings,
  ],
  template: `
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
      <h2 class="text-2xl font-bold flex items-center gap-2">
        {{ event()?.name }}
      </h2>
      <div class="flex-1 w-full flex gap-6 flex-col items-cente">
        @if (loggedParticipant()) {
          <ng-template #expenseFormTpl>
            <s-expense-form />
          </ng-template>
          @if (selectedTab()[0] === 'expenses') {
            <s-expenses (editExpenseClicked)="openExpenseFormDrawer(expenseFormTpl)" />
          } @else if (selectedTab()[0] === 'balances') {
            <s-balances />
            <s-settlements />
          }

          <ng-template #settingsTpl>
            <s-settings />
          </ng-template>
          <div
            class="absolute bottom-6 w-full flex gap-2 items-center z-10 left-1/2 transform -translate-x-1/2 translate-y-1/2"
          >
            <button
              b-button
              class="b-squared b-rounded-full b-size-lg b-variant-primary"
              (click)="openExpenseFormDrawer(expenseFormTpl)"
            >
              <ng-icon name="lucidePlus" size="18" color="currentColor" />
            </button>

            <b-tabs class="b-rounded-full flex-1" [(value)]="selectedTab">
              <b-tab value="expenses" class="flex-1 b-rounded-full">
                {{ 'event.expenses.title' | translate }}
              </b-tab>
              <b-tab value="balances" class="flex-1 b-rounded-full">
                {{ 'event.balances.title' | translate }}
              </b-tab>
            </b-tabs>
            <button
              b-button
              class="b-squared b-rounded-full b-size-lg b-variant-primary"
              (click)="onSettingsButtonClicked(settingsTpl)"
            >
              <ng-icon name="lucideCog" size="18" color="currentColor" />
            </button>
          </div>
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
      lucideLoader,
      lucidePlus,
      lucideCog,
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
  selectedTab = signal<('expenses' | 'balances')[]>(['expenses']);

  openExpenseFormDrawer(template: TemplateRef<unknown>) {
    this.state.openDynamicDrawer(template);
  }

  onSettingsButtonClicked(template: TemplateRef<unknown>) {
    this.state.openDynamicDrawer(template);
  }
}
