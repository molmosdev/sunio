import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, model, output, resource } from '@angular/core';
import { Button, TranslationManager, TranslatePipe } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe, Button, TranslatePipe],
  template: `
    @if (expenses.isLoading()) {
      <ng-icon name="lucideLoader" size="23" color="currentColor" class="animate-spin" />
    } @else if (expenses.hasValue()) {
      <div class="flex flex-col gap-2">
        @for (e of expensesWithPayers(); track e.paidBy) {
          <div class="flex gap-2 items-center justify-center">
            <span>
              {{ e.paidBy }} {{ 'event.expenses.has-paid' | translate }}
              <strong>{{ e.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong> en
              {{ e.description }}
            </span>
            <div class="flex gap-1">
              <button
                b-button
                class="b-variant-secondary b-squared b-size-sm"
                (click)="expenseToEdit.set(e)"
              >
                <ng-icon name="lucidePencil" size="13" color="currentColor" />
              </button>
              <button
                b-button
                class="b-variant-secondary b-squared b-size-sm"
                (click)="deleteExpense(e.id)"
              >
                <ng-icon name="lucideTrash" size="13" color="currentColor" />
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
