import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { customError, Field, form, minLength, required } from '@angular/forms/signals';
import { Button, Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';
import { SelectField } from '../../../../shared/components/select-field';

@Component({
  selector: 's-expense-form',
  imports: [Input, InputGroup, Button, Field, TranslatePipe, SelectField],
  template: `
    <div class="flex flex-col gap-1.5">
      @let form = expenseToEdit() ? editForm : createForm;
      <label class="font-semibold">{{ 'event.expenses.form.description' | translate }}</label>
      <input
        b-input
        type="text"
        class="b-size-lg"
        [field]="form.description"
        placeholder="{{ 'event.expenses.form.description-placeholder' | translate }}"
      />
      @if (descriptionError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ descriptionError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="font-semibold">{{ 'event.expenses.form.amount' | translate }}</label>
      <b-input-group>
        <input
          b-input
          type="text"
          inputmode="decimal"
          class="b-size-lg"
          [field]="form.amount"
          [placeholder]="'0.00'"
          (blur)="onAmountBlur($event)"
        />
        <span>€</span>
      </b-input-group>
      @if (amountError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ amountError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="font-semibold">{{ 'event.expenses.form.paidBy' | translate }}</label>

      <s-select-field
        [value]="form.payer_id().value() ? [form.payer_id().value()] : []"
        [options]="participantsOptions()!"
        [placeholder]="'event.expenses.form.payer-placeholder' | translate"
        (valueChanged)="onPayerSelected($event)"
      />
      @if (payerError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ payerError() }}
        </p>
      }
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="font-semibold">{{ 'event.expenses.form.split-between' | translate }}</label>
      <s-select-field
        [value]="form.consumers().value()"
        [options]="participantsOptions()!"
        [placeholder]="'event.expenses.form.consumers-placeholder' | translate"
        [multiple]="true"
        (valueChanged)="onConsumersSelected($event)"
      />
      @if (consumersError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark mt-1">
          {{ consumersError() }}
        </p>
      }
    </div>
    <button
      b-button
      class="mt-2 b-size-lg b-rounded-full"
      (click)="expenseToEdit() ? submitEditForm() : submitCreateForm()"
    >
      @if (expenseToEdit()) {
        <span>{{ 'event.expenses.update' | translate }}</span>
      } @else {
        <span>{{ 'event.expenses.add' | translate }}</span>
      }
    </button>
  `,
  host: {
    class: 'flex w-full flex-col gap-5',
  },
})
export class ExpenseForm {
  private _apiEvents = inject(ApiEvents);
  private _state = inject(State);
  private _translateManager = inject(TranslationManager);

  participants = computed(() => this._state.participants.value());
  participantsOptions = computed(() => {
    return this.participants()?.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  });
  expenseToEdit = computed(() => this._state.expenseToEdit());
  loggedParticipantId = computed(() => this._state.loggedParticipant()?.id);

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
    amount: '',
    consumers: [] as string[],
    description: '',
    updated_by: this.loggedParticipantId() || '',
  });

  createForm = form(this.createFormDataModel, (expense) => {
    required(
      expense.payer_id,
      customError({
        message: this._translateManager.translate('event.expenses.form.errors.payer-required'),
      }),
    );
    required(
      expense.amount,
      customError({
        message: this._translateManager.translate('event.expenses.form.errors.amount-required'),
      }),
    );
    minLength(
      expense.consumers,
      1,
      customError({
        message: this._translateManager.translate('event.expenses.form.errors.consumers-required'),
      }),
    );
    required(
      expense.description,
      customError({
        message: this._translateManager.translate(
          'event.expenses.form.errors.description-required',
        ),
      }),
    );
  });

  editFormDataModel = linkedSignal(() => {
    const expense = this.expenseToEdit();
    return {
      payer_id: this.selectedPayer().length ? this.selectedPayer()[0].id : '',
      amount: expense && expense.amount != null ? expense.amount.toString() : '',
      consumers: this.selectedConsumers().map((p) => p.id),
      description: expense?.description || '',
      updated_by: this.loggedParticipantId() || '',
    };
  });

  editForm = form(this.editFormDataModel, (expense) => {
    required(
      expense.amount,
      customError({
        message: this._translateManager.translate('event.expenses.form.errors.amount-required'),
      }),
    );
    minLength(
      expense.consumers,
      1,
      customError({
        message: this._translateManager.translate('event.expenses.form.errors.consumers-required'),
      }),
    );
    required(
      expense.description,
      customError({
        message: this._translateManager.translate(
          'event.expenses.form.errors.description-required',
        ),
      }),
    );
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

  onPayerSelected(selectedValue?: string[]) {
    if (selectedValue) {
      // Called from select-field
      const selectedParticipants = this.participants()?.filter((p) => selectedValue.includes(p.id));
      this.selectedPayer.set(selectedParticipants || []);
    }
    // Update form with current selectedPayer value (works for both select-field and participants)
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    form.payer_id().markAsDirty();
    form.payer_id().value.set(this.selectedPayer().length ? this.selectedPayer()[0].id : '');
  }

  onConsumersSelected(selectedValue?: string[]) {
    if (selectedValue) {
      // Called from select-field
      const selectedParticipants = this.participants()?.filter((p) => selectedValue.includes(p.id));
      this.selectedConsumers.set(selectedParticipants || []);
    }
    // Update form with current selectedConsumers value (works for both select-field and participants)
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    form.consumers().markAsDirty();
    form.consumers().value.set(selectedValue || []);
  }

  createDataModelWithFormattedAmount = computed(() => {
    const data = this.createFormDataModel();
    return {
      ...data,
      amount: this._parseAmount(data.amount),
    };
  });

  async submitCreateForm() {
    const eventId = this._state.eventId();
    if (!eventId) return;

    this.createForm.payer_id().markAsDirty();
    this.createForm.amount().markAsDirty();
    this.createForm.consumers().markAsDirty();
    this.createForm.description().markAsDirty();

    const amountValue = this._parseAmount(this.createFormDataModel().amount);
    if (amountValue <= 0) {
      this.createForm
        .amount()
        .errors()
        .push(
          customError({
            kind: 'min_amount',
            message: this._translateManager.translate(
              'event.expenses.form.errors.amount-greater-than-0',
            ),
          }),
        );
      return;
    }

    if (this.createForm().valid()) {
      await this._apiEvents.createExpense(eventId, this.createDataModelWithFormattedAmount());

      this._state.reloadBalances();
      this._state.reloadExpenses();
      this._state.reloadSettlements();
      this._state.closeDynamicDrawer();
      this._state.setExpenseToEdit(null);
    }
  }

  editDataModelWithFormattedAmount = computed(() => {
    const data = this.editFormDataModel();
    return {
      ...data,
      amount: this._parseAmount(data.amount),
    };
  });

  async submitEditForm() {
    const eventId = this._state.eventId();
    if (!eventId) return;

    this.editForm.payer_id().markAsDirty();
    this.editForm.amount().markAsDirty();
    this.editForm.consumers().markAsDirty();
    this.editForm.description().markAsDirty();

    const amountValue = this._parseAmount(this.editFormDataModel().amount);
    if (amountValue <= 0) {
      this.editForm
        .amount()
        .errors()
        .push(
          customError({
            kind: 'min_amount',
            message: this._translateManager.translate(
              'event.expenses.form.errors.amount-greater-than-0',
            ),
          }),
        );
      return;
    }

    if (this.editForm().valid() && this.expenseToEdit()) {
      await this._apiEvents.updateExpense(
        eventId,
        this.expenseToEdit()!.id,
        this.editDataModelWithFormattedAmount(),
      );

      this._state.reloadBalances();
      this._state.reloadExpenses();
      this._state.reloadSettlements();
      this._state.closeDynamicDrawer();
      this._state.setExpenseToEdit(null);
    }
  }

  onAmountBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const form = this.expenseToEdit() ? this.editForm : this.createForm;
    const sanitized = this._sanitizeAmount(input.value);
    form.amount().value.set(sanitized);
    input.value = sanitized;
  }

  private _sanitizeAmount(value: string): string {
    const cleaned = value
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');

    const parts = cleaned.split('.');
    if (parts.length > 1) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    return cleaned;
  }

  private _parseAmount(value: string): number {
    const num = parseFloat(value.replace(/,/g, '.'));
    return isNaN(num) ? 0 : num;
  }
}
