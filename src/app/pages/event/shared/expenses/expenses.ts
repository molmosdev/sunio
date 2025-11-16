import { Component, computed, inject, output, signal, TemplateRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Button, TranslationManager, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe, Button, TranslatePipe],
  template: `
    @if (isExpensesLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (expensesHasValue()) {
      <ng-template #expenseOptionsTpl>
        <button
          b-button
          class="b-size-lg b-variant-secondary b-rounded-full"
          (click)="onEditExpenseButtonClicked()"
        >
          Editar
        </button>
        <button
          b-button
          class="b-size-lg b-variant-destructive b-rounded-full"
          (click)="deleteExpense()"
        >
          Eliminar
        </button>
      </ng-template>
      <div class="flex flex-col gap-3 w-full">
        @for (e of expensesWithPayers(); track e.id) {
          <div
            (click)="onExpenseClicked(expenseOptionsTpl, e.id)"
            class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-secondary dark:bg-secondary-dark"
          >
            <div class="flex flex-col gap-0.5">
              <span> {{ e.description }} </span>
              <span class="text-xs opacity-55">
                {{ 'event.expenses.form.paidBy' | translate }} {{ e.paidBy }}
              </span>
            </div>
            <div class="flex-1 gap-1 flex justify-end items-center">
              <strong>{{ e.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
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

  selectedExpenseId = signal<string | null>(null);

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

  async deleteExpense() {
    const eventId = this.eventId();
    const expenseId = this.selectedExpenseId();

    if (!eventId || !expenseId) return;

    await this._apiEvents.deleteExpense(eventId, expenseId);
    this.state.reloadExpenses();
    this.state.reloadBalances();
  }

  editExpenseClicked = output<void>();

  onEditExpenseButtonClicked() {
    this.state.setExpenseToEdit(this.selectedExpenseId());
    this.editExpenseClicked.emit();
  }

  onExpenseClicked(template: TemplateRef<unknown>, expenseId: string) {
    this.selectedExpenseId.set(expenseId);
    this.state.openDynamicDrawer(template);
  }
}
