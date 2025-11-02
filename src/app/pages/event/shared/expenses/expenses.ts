import { CurrencyPipe, LowerCasePipe } from '@angular/common';
import { Component, computed, inject, input, model, output, resource } from '@angular/core';
import { Button, TranslationManager, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe, Button, TranslatePipe, LowerCasePipe],
  template: `
    @if (expenses.isLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (expenses.hasValue()) {
      <div class="flex flex-col gap-3 w-full">
        @for (e of expensesWithPayers(); track e.paidBy) {
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
              <button b-button class="b-variant-ghost b-squared" (click)="expenseToEdit.set(e)">
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
  providers: [
    provideIcons({
      lucideLoader,
      lucidePencil,
      lucideTrash,
    }),
  ],
  host: {
    class:
      'w-full flex flex-col items-center h-full max-h-[calc(100vh-15.7rem)] overflow-y-auto pb-4 relative',
  },
})
export class Expenses {
  eventId = input.required<string>();
  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject<TranslationManager>(TranslationManager);
  participants = input.required<IParticipant[]>();
  expenseToEdit = model<Expense | null>();
  expenseDeleted = output<void>();
  expenses = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this._apiEvents.getExpenses(params.id);
      } catch (error) {
        console.error('Error loading expenses:', error);
        throw error;
      }
    },
  });

  expensesWithPayers = computed(() => {
    return this.expenses.value()?.map((expense) => {
      const payer = this.participants().find((p) => p.id === expense.payer_id);
      return {
        ...expense,
        paidBy: payer ? payer.name : this._translationManager.translate('event.expenses.unknown'),
      };
    });
  });

  async deleteExpense(expenseId: string) {
    await this._apiEvents.deleteExpense(this.eventId(), expenseId);
    this.expenses.reload();
    this.expenseDeleted.emit();
  }
}
