import { Component, computed, inject, output, TemplateRef } from '@angular/core';
import { CurrencyPipe, LowerCasePipe } from '@angular/common';
import { Button, TranslationManager, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe, Button, TranslatePipe, LowerCasePipe],
  template: `
    @if (isExpensesLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (expensesHasValue()) {
      <div class="flex flex-col gap-3 w-full">
        @for (e of expensesWithPayers(); track e.id) {
          <div
            class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-xs"
          >
            <div class="flex flex-col gap-0.5">
              <span>
                <strong>{{ e.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
                {{ 'event.expenses.on' | translate }} {{ e.description | lowercase }}
              </span>
              <span class="text-xs opacity-55">
                {{ 'event.expenses.form.paidBy' | translate }} {{ e.paidBy }}
              </span>
            </div>
            <div class="flex-1 gap-1 flex justify-end items-center">
              <button
                b-button
                class="b-variant-ghost b-squared"
                (click)="onEditExpenseButtonClicked(e.id)"
              >
                <ng-icon name="lucidePencil" size="16" color="currentColor" />
              </button>
              <button b-button class="b-variant-ghost b-squared" (click)="deleteExpense(e.id)">
                <ng-icon name="lucideTrash" size="16" color="currentColor" />
              </button>
            </div>
          </div>
        }
      </div>
    } @else {
      <span>{{ 'event.expenses.list.empty' | translate }}</span>
    }
  `,
  host: {
    class:
      'w-full flex flex-col items-center h-full max-h-[calc(100vh-18.1rem)] overflow-y-auto pb-4 relative',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucidePencil,
      lucideTrash,
    }),
  ],
})
export class Expenses {
  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject<TranslationManager>(TranslationManager);
  state = inject(State);

  eventId = computed(() => this.state.eventId());
  participants = computed(() => this.state.participants.value());
  expenses = computed(() => this.state.expenses.value());
  isExpensesLoading = computed(() => this.state.expenses.isLoading());
  expensesHasValue = computed(() => this.state.expenses.hasValue());

  expensesWithPayers = computed(() => {
    return this.expenses()?.map((expense) => {
      const payer = this.participants()?.find((p) => p.id === expense.payer_id);
      return {
        ...expense,
        paidBy: payer ? payer.name : this._translationManager.translate('event.expenses.unknown'),
      };
    });
  });

  async deleteExpense(expenseId: string) {
    const eventId = this.eventId();
    if (!eventId) return;

    await this._apiEvents.deleteExpense(eventId, expenseId);
    this.state.reloadExpenses();
    this.state.reloadBalances();
  }

  editExpenseClicked = output<void>();

  onEditExpenseButtonClicked(expenseId: string) {
    this.state.setExpenseToEdit(expenseId);
    this.editExpenseClicked.emit();
  }

  onExpenseClicked(template: TemplateRef<unknown>) {
    this.state.openDynamicDrawer(template);
  }
}
