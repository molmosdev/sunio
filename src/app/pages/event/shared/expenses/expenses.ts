import { Component, computed, inject, input, resource } from '@angular/core';
import { ApiEvents } from '../../../../core/services/api-events';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { CurrencyPipe } from '@angular/common';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';

@Component({
  selector: 's-expenses',
  imports: [NgIcon, CurrencyPipe],
  template: `
    @if (expenses.isLoading()) {
      <ng-icon
        name="lucideLoader"
        size="23"
        color="currentColor"
        class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    } @else if (expenses.hasValue()) {
      @for (e of expensesWithPayers(); track e.paidBy) {
        <span>
          {{ e.paidBy }} ha pagado {{ e.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }} en
          {{ e.description }}
        </span>
      }
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
        amount: expense.amount,
        description: expense.description,
        paidBy: payer ? payer.name : 'Desconocido',
      };
    });
  });
}
