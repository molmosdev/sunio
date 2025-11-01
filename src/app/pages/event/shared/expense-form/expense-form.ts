import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { customError, Field, form, min, minLength, required } from '@angular/forms/signals';
import { Button, Input, InputGroup, TranslatePipe } from '@basis-ng/primitives';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { Participants } from '../../../../shared/components/participants/participants';
import { ApiEvents } from '../../../../core/services/api-events';

@Component({
  selector: 's-expense-form',
  imports: [Input, InputGroup, Button, Field, Participants, TranslatePipe],
  template: `
    <div class="flex flex-col gap-1.5 items-center">
      <label class="font-semibold">{{ 'event.expenses.form.description' | translate }}</label>
      <input
        b-input
        type="text"
        [field]="expenseToEdit() ? editForm.description : createForm.description"
        placeholder="{{ 'event.expenses.form.description-placeholder' | translate }}"
      />
      @if (descriptionError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ descriptionError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-1.5 items-center">
      <label class="font-semibold">{{ 'event.expenses.form.amount' | translate }}</label>
      <b-input-group>
        <input
          b-input
          type="text"
          inputmode="decimal"
          step="0.01"
          min="0"
          [field]="expenseToEdit() ? editForm.amount : createForm.amount"
          [placeholder]="'0.00'"
        />
        <span>€</span>
      </b-input-group>
      @if (amountError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ amountError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-0.5 items-center">
      <label class="font-semibold">{{ 'event.expenses.form.paidBy' | translate }}</label>
      <s-participants
        [participants]="participants()"
        [(selected)]="selectedPayer"
        [multiple]="false"
        (participantSelected)="onPayerSelected()"
      />
      @if (payerError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ payerError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-0.5 items-center">
      <label class="font-semibold">{{ 'event.expenses.form.split-between' | translate }}</label>
      <s-participants
        [participants]="participants()"
        [(selected)]="selectedConsumers"
        [multiple]="true"
        (participantSelected)="onConsumersSelected()"
      />
      @if (consumersError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ consumersError() }}
        </p>
      }
    </div>
    <button
      b-button
      class="b-variant-outlined mt-2"
      (click)="expenseToEdit() ? submitEditForm() : submitCreateForm()"
    >
      {{
        expenseToEdit() ? ('event.expenses.update' | translate) : ('event.expenses.add' | translate)
      }}
    </button>
  `,
  host: {
    class: 'flex flex-col gap-5 justify-center items-center',
  },
})
export class ExpenseForm {
  private _apiEvents = inject(ApiEvents);
  eventId = input.required<string>();
  participants = input<IParticipant[]>();
  expenseToEdit = input<Expense | null>();
  updatedOrCreated = output<void>();
  selectedPayer = linkedSignal<IParticipant[]>(() => {
    if (this.expenseToEdit()) {
      const payer = this.participants()?.find((p) => p.id === this.expenseToEdit()!.payer_id);
      return payer ? [payer] : [];
    } else {
      return [];
    }
  });
  selectedConsumers = linkedSignal<IParticipant[]>(() => {
    if (this.expenseToEdit()) {
      return (
        this.participants()?.filter((p) => this.expenseToEdit()!.consumers.includes(p.id)) || []
      );
    } else {
      return [];
    }
  });

  createFormDataModel = signal({
    payer_id: '',
    amount: 0,
    consumers: [] as string[],
    description: '',
  });

  createForm = form(this.createFormDataModel, (expense) => {
    required(expense.payer_id, customError({ message: 'Payer is required' }));
    required(expense.amount, customError({ message: 'Amount is required' }));
    min(expense.amount, 0, customError({ message: 'Amount must be positive' }));
    minLength(expense.consumers, 1, customError({ message: 'At least one consumer is required' }));
    required(expense.description, customError({ message: 'Description is required' }));
  });

  editFormDataModel = linkedSignal(() => {
    return {
      payer_id: this.selectedPayer().length ? this.selectedPayer()[0].id : '',
      amount: this.expenseToEdit()?.amount || 0,
      consumers: this.selectedConsumers().map((p) => p.id),
      description: this.expenseToEdit()?.description || '',
    };
  });

  editForm = form(this.editFormDataModel, (expense) => {
    required(expense.amount, customError({ message: 'Amount is required' }));
    min(expense.amount, 0, customError({ message: 'Amount must be positive' }));
    required(expense.consumers, customError({ message: 'At least one consumer is required' }));
    required(expense.description, customError({ message: 'Description is required' }));
  });

  payerError = computed(() => {
    const form = this.createForm;
    return form.payer_id().dirty() && form.payer_id().errors().length > 0
      ? form.payer_id().errors()[0].message
      : null;
  });

  amountError = computed(() => {
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    return form.amount().dirty() && form.amount().errors().length > 0
      ? form.amount().errors()[0].message
      : null;
  });

  consumersError = computed(() => {
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    return form.consumers().dirty() && form.consumers().errors().length > 0
      ? form.consumers().errors()[0].message
      : null;
  });

  descriptionError = computed(() => {
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    return form.description().dirty() && form.description().errors().length > 0
      ? form.description().errors()[0].message
      : null;
  });

  onPayerSelected() {
    const selected = this.selectedPayer();
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    form.payer_id().markAsDirty();
    form.payer_id().value.set(selected.length ? selected[0].id : '');
  }

  onConsumersSelected() {
    const selected = this.selectedConsumers();
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    form.consumers().markAsDirty();
    form.consumers().value.set(selected.map((p) => p.id));
  }

  createDataModelWithFormattedAmount = computed(() => {
    const data = this.createFormDataModel();
    let amountStr = String(data.amount ?? '');
    amountStr = amountStr
      .replace(',', '.') // permite coma como decimal
      .replace(/[^0-9.]/g, '') // solo números y punto
      .replace(/(\..*)\./g, '$1') // solo un punto decimal
      .replace(/^(\d+\.?\d{0,2}).*$/, '$1'); // máx 2 decimales
    return {
      ...data,
      amount: amountStr ? Number(amountStr) : 0,
    };
  });

  async submitCreateForm() {
    this.createForm.payer_id().markAsDirty();
    this.createForm.amount().markAsDirty();
    this.createForm.consumers().markAsDirty();
    this.createForm.description().markAsDirty();

    if (this.createForm().valid()) {
      await this._apiEvents.createExpense(
        this.eventId(),
        this.createDataModelWithFormattedAmount(),
      );

      this.updatedOrCreated.emit();
    }
  }

  editDataModelWithFormattedAmount = computed(() => {
    const data = this.editFormDataModel();
    let amountStr = String(data.amount ?? '');
    amountStr = amountStr
      .replace(',', '.') // permite coma como decimal
      .replace(/[^0-9.]/g, '') // solo números y punto
      .replace(/(\..*)\./g, '$1') // solo un punto decimal
      .replace(/^(\d+\.?\d{0,2}).*$/, '$1'); // máx 2 decimales
    return {
      ...data,
      amount: amountStr ? Number(amountStr) : 0,
    };
  });

  async submitEditForm() {
    this.editForm.payer_id().markAsDirty();
    this.editForm.amount().markAsDirty();
    this.editForm.consumers().markAsDirty();
    this.editForm.description().markAsDirty();

    if (this.editForm().valid() && this.expenseToEdit()) {
      await this._apiEvents.updateExpense(
        this.eventId(),
        this.expenseToEdit()!.id,
        this.editDataModelWithFormattedAmount(),
      );

      this.updatedOrCreated.emit();
    }
  }
}
