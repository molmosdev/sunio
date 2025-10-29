import { Component, computed, inject, input, model, output, resource } from '@angular/core';
import { ApiEvents } from '../../../../core/services/api-events';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { CurrencyPipe } from '@angular/common';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { Button } from '@basis-ng/primitives';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe, Button],
  template: `
    @if (expenses.isLoading()) {
      <ng-icon name="lucideLoader" size="23" color="currentColor" class="animate-spin" />
    } @else if (expenses.hasValue()) {
      <div class="flex flex-col gap-2">
        @for (e of expensesWithPayers(); track e.paidBy) {
          <div class="flex gap-2 items-center justify-center">
            <span>
              {{ e.paidBy }} ha pagado
              <strong>{{ e.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong> en
              {{ e.description }}
            </span>
            <div class="flex gap-1">
              <button
                b-button
                class="b-variant-outlined b-squared b-size-sm"
                (click)="expenseToEdit.set(e)"
              >
                <ng-icon name="lucidePencil" size="13" color="currentColor" />
              </button>
              <button
                b-button
                class="b-variant-outlined b-squared b-size-sm"
                (click)="deleteExpense(e.id)"
              >
                <ng-icon name="lucideTrash" size="13" color="currentColor" />
              </button>
            </div>
          </div>
        }
      </div>
    } @else {
      <span>Aún no hay gastos registrados</span>
    }
  `,
  providers: [
    provideIcons({
      lucideLoader,
    }),
  ],
})
export class Expenses {
  eventId = input.required<string>();
  private _apiEvents = inject(ApiEvents);
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
        paidBy: payer ? payer.name : 'Desconocido',
      };
    });
  });

  async deleteExpense(expenseId: string) {
    await this._apiEvents.deleteExpense(this.eventId(), expenseId);
    this.expenses.reload();
    this.expenseDeleted.emit();
  }
}
