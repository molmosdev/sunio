import { DecimalPipe } from '@angular/common';
import { Component, inject, resource, signal, computed } from '@angular/core';
import { Field, form, required, validate, customError } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiEvents } from '../../core/services/api-events';
import { Participant } from '../../shared/interfaces/participant.interface';
import { Expense } from '../../shared/interfaces/expense.interface';
import { Settlement } from '../../shared/interfaces/balance.interface';
import { Button, Input, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';

@Component({
  selector: 's-event',
  imports: [Field, DecimalPipe, Button, TranslatePipe, RouterLink, NgIcon, Input],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>

    @if (
      event.isLoading() || participants.isLoading() || expenses.isLoading() || balances.isLoading()
    ) {
      <p>{{ 'event.loading' | translate }}</p>
    } @else if (event.error()) {
      <div>
        <h2>{{ 'event.notFound.title' | translate }}</h2>
        <p>{{ 'event.notFound' | translate }} "{{ eventId() }}"</p>
        <button b-button routerLink="/home">{{ 'event.goHome' | translate }}</button>
      </div>
    } @else {
      <div>
        @if (!editingEventName()) {
          <h2>
            {{ event.value()?.name }}
            <button b-button class="b-variant-outlined" (click)="startEditEvent()">
              {{ 'event.edit' | translate }}
            </button>
          </h2>
        } @else {
          <div>
            <input
              type="text"
              [field]="editEventForm.name"
              [placeholder]="'event.event-name' | translate"
            />
            <button b-button (click)="submitEditEvent()">{{ 'event.save' | translate }}</button>
            <button b-button class="b-variant-outlined" (click)="cancelEditEvent()">
              {{ 'event.cancel' | translate }}
            </button>
            @if (editEventError()) {
              <p class="text-destructive dark:text-destructive-dark">{{ editEventError() }}</p>
            }
          </div>
        }

        @if (!loggedInParticipantId()) {
          <h3>{{ 'event.participants.title' | translate }}</h3>
          @if (participants.error()) {
            <p>{{ 'event.participants.load-error' | translate }}</p>
          } @else {
            @for (participant of participants.value(); track participant.id) {
              <div>
                <span>{{ participant.name }}</span>
                <button
                  b-button
                  class="b-size-sm b-variant-outlined"
                  (click)="selectParticipant(participant)"
                >
                  {{ 'event.participants.select' | translate }}
                </button>
                <button
                  b-button
                  class="b-size-sm b-variant-outlined"
                  (click)="startEditParticipant(participant)"
                >
                  {{ 'event.participants.edit' | translate }}
                </button>
                <button
                  b-button
                  class="b-size-sm b-variant-outlined"
                  (click)="deleteParticipantConfirm(participant)"
                >
                  {{ 'event.participants.delete' | translate }}
                </button>

                @if (selectedParticipantId() === participant.id) {
                  <div>
                    @if (!participant.pin) {
                      <p>{{ 'event.participants.pin.setup' | translate }}</p>
                    } @else {
                      <p>{{ 'event.participants.pin.prompt' | translate }}</p>
                    }
                    <input
                      b-input
                      type="password"
                      [value]="pin()"
                      (input)="pin.set($any($event.target).value)"
                      maxLength="4"
                    />
                    <button
                      b-button
                      (click)="submitPin(participant)"
                      [disabled]="isSubmittingPin()"
                    >
                      {{ 'event.participants.pin.submit' | translate }}
                    </button>
                    @if (authError()) {
                      <p class="text-destructive dark:text-destructive-dark">{{ authError() }}</p>
                    }
                  </div>
                }

                @if (participantEditId() === participant.id) {
                  <div>
                    <input
                      type="text"
                      [field]="editParticipantForm.name"
                      [placeholder]="'event.participants.participant-name' | translate"
                    />
                    <button b-button (click)="submitEditParticipant()">
                      {{ 'event.save' | translate }}
                    </button>
                    <button
                      b-button
                      class="b-variant-outlined"
                      (click)="participantEditId.set(null)"
                    >
                      {{ 'event.cancel' | translate }}
                    </button>
                    @if (editParticipantError()) {
                      <p class="text-destructive dark:text-destructive-dark">
                        {{ editParticipantError() }}
                      </p>
                    }
                  </div>
                }
              </div>
            }
          }
        } @else {
          <div>
            <button b-button (click)="logout()">{{ 'event.logout' | translate }}</button>
          </div>
        }

        @if (loggedInParticipantId()) {
          <h3>{{ 'event.expenses.title' | translate }}</h3>
          @if (expenses.error()) {
            <p>{{ 'event.expenses.load-error' | translate }}</p>
          } @else {
            <div>
              <h4>{{ 'event.expenses.create.title' | translate }}</h4>
              <div>
                <label>{{ 'event.expenses.payer' | translate }}</label>
                <select [field]="newExpenseForm.payer_id">
                  <option value="">
                    {{ '-- ' + ('event.expenses.select' | translate) + ' --' }}
                  </option>
                  @for (p of participants.value(); track p.id) {
                    <option value="{{ p.id }}">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label>{{ 'event.expenses.amount' | translate }}</label>
                <input b-inputtype="number" [field]="newExpenseForm.amount" />
              </div>
              <div>
                <label>{{ 'event.expenses.consumers' | translate }}</label>
                @for (p of participants.value(); track p.id) {
                  <label>
                    <input
                      type="checkbox"
                      (change)="toggleConsumer(newExpenseForm, p.id, $any($event.target).checked)"
                    />
                    {{ p.name }}
                  </label>
                }
              </div>
              <div>
                <label>{{ 'event.expenses.description' | translate }}</label>
                <input b-input type="text" [field]="newExpenseForm.description" />
              </div>
              <div>
                <button b-button (click)="createExpense()">
                  {{ 'event.expenses.create.button' | translate }}
                </button>
                @if (newExpenseError()) {
                  <p class="text-destructive dark:text-destructive-dark">{{ newExpenseError() }}</p>
                }
              </div>

              <h4>{{ 'event.expenses.list.title' | translate }}</h4>
              @for (e of expenses.value(); track e.id) {
                <div>
                  @if (editingExpenseId() === e.id) {
                    <div>
                      <label>{{ 'event.expenses.payer' | translate }}</label>
                      <select [field]="editExpenseForm.payer_id">
                        @for (p of participants.value(); track p.id) {
                          <option value="{{ p.id }}">{{ p.name }}</option>
                        }
                      </select>
                      <label>{{ 'event.expenses.amount' | translate }}</label>
                      <input b-input type="number" [field]="editExpenseForm.amount" />
                      <label>{{ 'event.expenses.consumers' | translate }}</label>
                      @for (p of participants.value(); track p.id) {
                        <label>
                          <input
                            type="checkbox"
                            (change)="
                              toggleConsumer(editExpenseForm, p.id, $any($event.target).checked)
                            "
                            [checked]="editExpenseForm.consumers().value().includes(p.id)"
                          />
                          {{ p.name }}
                        </label>
                      }
                      <label>{{ 'event.expenses.description' | translate }}</label>
                      <input b-input type="text" [field]="editExpenseForm.description" />
                      <div>
                        <button b-button (click)="submitEditExpense()">
                          {{ 'event.save' | translate }}
                        </button>
                        <button b-button class="b-variant-outlined" (click)="cancelEditExpense()">
                          {{ 'event.cancel' | translate }}
                        </button>
                        @if (editExpenseError()) {
                          <p class="text-destructive dark:text-destructive-dark">
                            {{ editExpenseError() }}
                          </p>
                        }
                      </div>
                    </div>
                  } @else {
                    <p>
                      <strong>{{ getParticipantName(e.payer_id) }}</strong> - {{ e.amount }} -
                      {{ e.description }}
                      <button
                        b-button
                        class="b-size-sm b-variant-outlined"
                        (click)="startEditExpense(e)"
                      >
                        {{ 'event.edit' | translate }}
                      </button>
                      <button
                        b-button
                        class="b-size-sm b-variant-outlined"
                        (click)="deleteExpense(e)"
                      >
                        {{ 'event.delete' | translate }}
                      </button>
                    </p>
                  }
                </div>
              }
            </div>
          }

          <h3>{{ 'event.balances.title' | translate }}</h3>
          <button b-button (click)="calculateSettlements()" [disabled]="isCalculatingSettlements()">
            {{ 'event.balances.calculate' | translate }}
          </button>
          @if (balances.error()) {
            <p>{{ 'event.balances.load-error' | translate }}</p>
          } @else {
            @for (item of balancesWithNames(); track item.id) {
              <p>{{ item.name }}: {{ item.balance | number: '1.2-2' }}</p>
            }
            @if (settlements()) {
              <h4>{{ 'event.balances.settlements' | translate }}</h4>
              @for (s of settlements(); track s.from + '-' + s.to) {
                <p>
                  {{ getParticipantName(s.from) }} → {{ getParticipantName(s.to) }}:
                  {{ s.amount | number: '1.2-2' }}
                </p>
              }
            } @else if (settlementsError()) {
              <p class="text-destructive dark:text-destructive-dark">{{ settlementsError() }}</p>
            }
          }
        } @else {
          <p>{{ 'event.auth.required' | translate }}</p>
        }
      </div>
    }
  `,
  styles: ``,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideArrowLeft })],
})
export class Event {
  translationManager = inject(TranslationManager);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  eventId = signal(this.activatedRoute.snapshot.params['eventId']);
  apiEvents = inject(ApiEvents);

  // UI / auth signals for participant PIN flow
  selectedParticipantId = signal<string | null>(null);
  pin = signal('');
  authError = signal<string | null>(null);
  isSubmittingPin = signal(false);
  // Id of participant who successfully authenticated (set or login)
  loggedInParticipantId = signal<string | null>(null);

  // New / edit expense signals
  // form-based new expense
  newExpenseForm = form(
    signal<{ payer_id: string; amount: number; consumers: string[]; description: string }>({
      payer_id: '',
      amount: 0,
      consumers: [],
      description: '',
    }),
    (path) => {
      required(path.payer_id, {
        message: this.translationManager.translate('event.errors.payer-required'),
      });
      validate(path.amount, (ctx) => {
        const v = ctx.value();
        if (!v || v <= 0) {
          return customError({
            kind: 'invalid_amount',
            message: this.translationManager.translate('event.errors.invalid-amount'),
          });
        }
        return null;
      });
      validate(path.consumers, (ctx) => {
        const v = ctx.value();
        if (!v || v.length === 0) {
          return customError({
            kind: 'no_consumers',
            message: this.translationManager.translate('event.errors.select-consumer'),
          });
        }
        return null;
      });
    },
  );

  newExpenseError = signal<string | null>(null);

  // edit expense form
  editingExpenseId = signal<string | null>(null);
  editExpenseForm = form(
    signal<{ payer_id: string; amount: number; consumers: string[]; description: string }>({
      payer_id: '',
      amount: 0,
      consumers: [],
      description: '',
    }),
    (path) => {
      required(path.payer_id, {
        message: this.translationManager.translate('event.errors.payer-required'),
      });
      validate(path.amount, (ctx) => {
        const v = ctx.value();
        if (!v || v <= 0)
          return customError({
            kind: 'invalid_amount',
            message: this.translationManager.translate('event.errors.invalid-amount'),
          });
        return null;
      });
      validate(path.consumers, (ctx) => {
        const v = ctx.value();
        if (!v || v.length === 0)
          return customError({
            kind: 'no_consumers',
            message: this.translationManager.translate('event.errors.select-consumer'),
          });
        return null;
      });
    },
  );

  editExpenseError = signal<string | null>(null);

  // Participant CRUD signals
  newParticipantError = signal<string | null>(null);

  participantEditId = signal<string | null>(null);
  editParticipantError = signal<string | null>(null);

  // form-based participant create/edit
  newParticipantForm = form(signal<{ name: string }>({ name: '' }), (path) => {
    required(path.name, {
      message: this.translationManager.translate('event.errors.participant-name-required'),
    });
  });

  editParticipantForm = form(signal<{ name: string }>({ name: '' }), (path) => {
    required(path.name, {
      message: this.translationManager.translate('event.errors.participant-name-required'),
    });
  });

  // Edit event name
  editingEventName = signal(false);
  editEventName = signal('');
  editEventError = signal<string | null>(null);
  editEventForm = form(signal<{ name: string }>({ name: '' }), (path) => {
    required(path.name, {
      message: this.translationManager.translate('event.errors.event-name-required'),
    });
  });

  event = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this.apiEvents.getEvent(params.id);
      } catch (error) {
        console.error('Error loading event:', error);
        throw error;
      }
    },
  });

  participants = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this.apiEvents.getParticipants(params.id);
      } catch (error) {
        console.error('Error loading participants:', error);
        throw error;
      }
    },
  });

  expenses = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this.apiEvents.getExpenses(params.id);
      } catch (error) {
        console.error('Error loading expenses:', error);
        throw error;
      }
    },
  });

  balances = resource({
    params: () => ({ id: this.eventId() }),
    loader: async ({ params }) => {
      try {
        return await this.apiEvents.getBalances(params.id);
      } catch (error) {
        console.error('Error loading balances:', error);
        throw error;
      }
    },
  });

  balancesWithNames = computed(() => {
    const raw = this.balances.value()?.balances;
    const parts = this.participants.value() ?? [];
    if (!raw) return [] as { id: string; name: string; balance: number }[];

    return Object.entries(raw).map(([id, balance]) => {
      const p = parts.find((x) => x.id === id);
      return { id, name: p ? p.name : id, balance };
    });
  });

  // Settlements UI state
  settlements = signal<Settlement[] | null>(null);
  settlementsError = signal<string | null>(null);
  isCalculatingSettlements = signal(false);

  async calculateSettlements() {
    this.isCalculatingSettlements.set(true);
    this.settlementsError.set(null);
    try {
      const res = await this.apiEvents.calculateSettlements(this.eventId());
      this.settlements.set(res.settlements ?? []);
      // refresh balances from server
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.settlementsError.set(
        msg || this.translationManager.translate('event.errors.calculate-settlements'),
      );
    } finally {
      this.isCalculatingSettlements.set(false);
    }
  }

  // Select a participant to show PIN input
  selectParticipant(participant: Participant) {
    this.authError.set(null);
    this.pin.set('');
    this.selectedParticipantId.set(participant.id);
    // If participant has no pin, we'll propose to set one. Otherwise, prompt for login.
  }

  // Helpers for expenses
  toggleConsumer(frm: unknown, id: string, checked: boolean) {
    type ValFn = (() => string[]) & { set: (v: string[]) => void };
    const f = frm as {
      consumers: () => { value: ValFn };
    };
    const current = f.consumers().value();
    let next = current ? [...current] : [];
    if (checked) {
      if (!next.includes(id)) next.push(id);
    } else {
      next = next.filter((x) => x !== id);
    }
    f.consumers().value.set(next);
  }

  // Participant CRUD
  async createParticipant() {
    this.newParticipantForm.name().markAsDirty();
    if (!this.newParticipantForm().valid()) {
      this.newParticipantError.set(this.translationManager.translate('event.errors.fix-fields'));
      return;
    }
    const data = this.newParticipantForm().value();
    try {
      await this.apiEvents.createParticipant(this.eventId(), { name: data.name.trim() });
      this.newParticipantForm.name().value.set('');
      this.newParticipantError.set(null);
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.newParticipantError.set(
        msg || this.translationManager.translate('event.errors.create-participant'),
      );
    }
  }

  startEditParticipant(p: Participant) {
    this.participantEditId.set(p.id);
    this.editParticipantForm.name().value.set(p.name);
    this.editParticipantError.set(null);
  }

  async submitEditParticipant() {
    const id = this.participantEditId();
    if (!id) return;
    this.editParticipantForm.name().markAsDirty();
    if (!this.editParticipantForm().valid()) {
      this.editParticipantError.set(this.translationManager.translate('event.errors.fix-fields'));
      return;
    }
    const data = this.editParticipantForm().value();
    try {
      await this.apiEvents.updateParticipant(this.eventId(), id, { name: data.name.trim() });
      this.participantEditId.set(null);
      this.editParticipantForm.name().value.set('');
      this.editParticipantError.set(null);
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.editParticipantError.set(
        msg || this.translationManager.translate('event.errors.edit-participant'),
      );
    }
  }

  async deleteParticipantConfirm(p: Participant) {
    try {
      await this.apiEvents.deleteParticipant(this.eventId(), p.id);
      // if deleted logged in participant, logout
      if (this.loggedInParticipantId() === p.id) this.logout();
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.newParticipantError.set(
        msg || this.translationManager.translate('event.errors.delete-participant'),
      );
    }
  }

  // Edit event name
  startEditEvent() {
    this.editingEventName.set(true);
    this.editEventForm.name().value.set(this.event.value()?.name ?? '');
    this.editEventError.set(null);
  }

  cancelEditEvent() {
    this.editingEventName.set(false);
    this.editEventError.set(null);
  }

  async submitEditEvent() {
    this.editEventForm.name().markAsDirty();
    if (!this.editEventForm().valid()) {
      this.editEventError.set(this.translationManager.translate('event.errors.fix-fields'));
      return;
    }
    const data = this.editEventForm().value();
    try {
      await this.apiEvents.updateEvent(this.eventId(), { name: data.name.trim() });
      this.editingEventName.set(false);
      this.editEventError.set(null);
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.editEventError.set(
        msg || this.translationManager.translate('event.errors.update-event'),
      );
    }
  }

  async createExpense() {
    this.newExpenseForm.payer_id().markAsDirty();
    this.newExpenseForm.amount().markAsDirty();
    this.newExpenseForm.consumers().markAsDirty();
    if (!this.newExpenseForm().valid()) {
      this.newExpenseError.set(this.translationManager.translate('event.errors.fix-fields'));
      return;
    }

    const data = this.newExpenseForm().value();
    try {
      await this.apiEvents.createExpense(this.eventId(), {
        payer_id: data.payer_id,
        amount: data.amount,
        consumers: data.consumers,
        description: data.description || undefined,
      });
      this.newExpenseError.set(null);
      this.newExpenseForm.payer_id().value.set('');
      this.newExpenseForm.amount().value.set(0);
      this.newExpenseForm.consumers().value.set([]);
      this.newExpenseForm.description().value.set('');
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.newExpenseError.set(
        msg || this.translationManager.translate('event.errors.create-expense'),
      );
    }
  }

  startEditExpense(e: Expense) {
    this.editingExpenseId.set(e.id);
    this.editExpenseForm.payer_id().value.set(e.payer_id);
    this.editExpenseForm.amount().value.set(e.amount);
    this.editExpenseForm.consumers().value.set([...e.consumers]);
    this.editExpenseForm.description().value.set(e.description ?? '');
    this.editExpenseError.set(null);
  }

  cancelEditExpense() {
    this.editingExpenseId.set(null);
    this.editExpenseError.set(null);
  }

  async submitEditExpense() {
    this.editExpenseForm.payer_id().markAsDirty();
    this.editExpenseForm.amount().markAsDirty();
    this.editExpenseForm.consumers().markAsDirty();
    if (!this.editExpenseForm().valid()) {
      this.editExpenseError.set(this.translationManager.translate('event.errors.fix-fields'));
      return;
    }

    const id = this.editingExpenseId();
    if (!id) return;
    const data = this.editExpenseForm().value();
    try {
      await this.apiEvents.updateExpense(this.eventId(), id, {
        amount: data.amount,
        consumers: data.consumers,
        description: data.description || undefined,
      });
      this.editingExpenseId.set(null);
      this.reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.editExpenseError.set(
        msg || this.translationManager.translate('event.errors.update-expense'),
      );
    }
  }

  async deleteExpense(e: Expense) {
    try {
      await this.apiEvents.deleteExpense(this.eventId(), e.id);
      this.reloadData();
    } catch (err: unknown) {
      // attach to newExpenseError for simplicity
      const msg = err instanceof Error ? err.message : String(err);
      this.newExpenseError.set(
        msg || this.translationManager.translate('event.errors.delete-expense'),
      );
    }
  }

  getParticipantName(id: string) {
    const p = (this.participants.value() ?? []).find((x) => x.id === id);
    return p ? p.name : id;
  }

  // Try to reload resources (best-effort)
  reloadData() {
    try {
      (this.expenses as unknown as { reload?: () => void }).reload?.();
      (this.balances as unknown as { reload?: () => void }).reload?.();
      (this.participants as unknown as { reload?: () => void }).reload?.();
      (this.event as unknown as { reload?: () => void }).reload?.();
    } catch {
      // ignore
    }
  }

  // Submit PIN: if participant has no pin -> setPin, else -> login
  async submitPin(participant: Participant) {
    const pid = participant.id as string;
    this.isSubmittingPin.set(true);
    this.authError.set(null);
    try {
      if (!participant.pin) {
        // register new pin
        await this.apiEvents.setParticipantPin(this.eventId(), pid, { pin: this.pin() });
      } else {
        // try login
        const res = await this.apiEvents.loginParticipant(this.eventId(), pid, {
          pin: this.pin(),
        });
        if (!res || !res.success) {
          throw new Error(this.translationManager.translate('event.errors.invalid-pin'));
        }
      }

      // success: mark as logged in and try to refresh resources (best-effort)
      this.loggedInParticipantId.set(pid);

      // resources may provide reload/refetch; call them if available (cast via unknown -> specific shape)
      try {
        (this.participants as unknown as { reload?: () => void }).reload?.();
        (this.expenses as unknown as { reload?: () => void }).reload?.();
        (this.balances as unknown as { reload?: () => void }).reload?.();
        (this.event as unknown as { reload?: () => void }).reload?.();
      } catch {
        // ignore reload errors
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.authError.set(msg || this.translationManager.translate('event.errors.auth-pin'));
    } finally {
      this.isSubmittingPin.set(false);
    }
  }

  logout() {
    this.loggedInParticipantId.set(null);
    this.selectedParticipantId.set(null);
    this.pin.set('');
    this.authError.set(null);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
