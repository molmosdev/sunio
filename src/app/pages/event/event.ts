import { DecimalPipe } from '@angular/common';
import { Component, inject, resource, signal, computed } from '@angular/core';
import { Field, form, required, validate, customError } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiEvents } from '../../core/services/api-events';
import { Participant } from '../../shared/interfaces/participant.interface';
import { Expense } from '../../shared/interfaces/expense.interface';
import { Settlement } from '../../shared/interfaces/balance.interface';

@Component({
  selector: 's-event',
  imports: [Field, DecimalPipe],
  template: `
    @if (
      event.isLoading() || participants.isLoading() || expenses.isLoading() || balances.isLoading()
    ) {
      <p>Cargando evento...</p>
    } @else if (event.error()) {
      <div>
        <h2>Error: Evento no encontrado</h2>
        <p>El evento "{{ eventId() }}" no existe.</p>
        <button (click)="goHome()">Volver al inicio</button>
      </div>
    } @else {
      <div>
        @if (!editingEventName()) {
          <h2>
            {{ event.value()?.name }}
            <button (click)="startEditEvent()">Editar</button>
          </h2>
        } @else {
          <div>
            <input type="text" [field]="editEventForm.name" />
            <button (click)="submitEditEvent()">Guardar</button>
            <button (click)="cancelEditEvent()">Cancelar</button>
            @if (editEventError()) {
              <p style="color:red">{{ editEventError() }}</p>
            }
          </div>
        }

        @if (!loggedInParticipantId()) {
          <h3>Participantes</h3>
          @if (participants.error()) {
            <p>Error cargando participantes</p>
          } @else {
            @for (participant of participants.value(); track participant.id) {
              <div>
                <span>{{ participant.name }}</span>
                <button (click)="selectParticipant(participant)">Seleccionar</button>
                <button (click)="startEditParticipant(participant)">Editar</button>
                <button (click)="deleteParticipantConfirm(participant)">Borrar</button>

                @if (selectedParticipantId() === participant.id) {
                  <div>
                    @if (!participant.pin) {
                      <p>Este participante no tiene PIN. Regístralo:</p>
                    } @else {
                      <p>Introduce tu PIN:</p>
                    }
                    <input
                      type="password"
                      [value]="pin()"
                      (input)="pin.set($any($event.target).value)"
                      maxLength="4"
                    />
                    <button (click)="submitPin(participant)" [disabled]="isSubmittingPin()">
                      Enviar
                    </button>
                    @if (authError()) {
                      <p style="color: red">{{ authError() }}</p>
                    }
                  </div>
                }

                @if (participantEditId() === participant.id) {
                  <div>
                    <input type="text" [field]="editParticipantForm.name" />
                    <button (click)="submitEditParticipant()">Guardar</button>
                    <button (click)="participantEditId.set(null)">Cancelar</button>
                    @if (editParticipantError()) {
                      <p style="color:red">{{ editParticipantError() }}</p>
                    }
                  </div>
                }
              </div>
            }
          }
        } @else {
          <div>
            <button (click)="logout()">Cerrar sesión</button>
          </div>
        }

        @if (loggedInParticipantId()) {
          <h3>Gastos</h3>
          @if (expenses.error()) {
            <p>Error cargando gastos</p>
          } @else {
            <div>
              <h4>Crear gasto</h4>
              <div>
                <label>Payer</label>
                <select [field]="newExpenseForm.payer_id">
                  <option value="">-- Selecciona --</option>
                  @for (p of participants.value(); track p.id) {
                    <option value="{{ p.id }}">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label>Monto</label>
                <input type="number" [field]="newExpenseForm.amount" />
              </div>
              <div>
                <label>Consumidores</label>
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
                <label>Descripción</label>
                <input type="text" [field]="newExpenseForm.description" />
              </div>
              <div>
                <button (click)="createExpense()">Crear</button>
                @if (newExpenseError()) {
                  <p style="color:red">{{ newExpenseError() }}</p>
                }
              </div>

              <h4>Lista de gastos</h4>
              @for (e of expenses.value(); track e.id) {
                <div>
                  @if (editingExpenseId() === e.id) {
                    <div>
                      <label>Payer</label>
                      <select [field]="editExpenseForm.payer_id">
                        @for (p of participants.value(); track p.id) {
                          <option value="{{ p.id }}">{{ p.name }}</option>
                        }
                      </select>
                      <label>Monto</label>
                      <input type="number" [field]="editExpenseForm.amount" />
                      <label>Consumidores</label>
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
                      <label>Descripción</label>
                      <input type="text" [field]="editExpenseForm.description" />
                      <div>
                        <button (click)="submitEditExpense()">Guardar</button>
                        <button (click)="cancelEditExpense()">Cancelar</button>
                        @if (editExpenseError()) {
                          <p style="color:red">{{ editExpenseError() }}</p>
                        }
                      </div>
                    </div>
                  } @else {
                    <p>
                      <strong>{{ getParticipantName(e.payer_id) }}</strong> - {{ e.amount }} -
                      {{ e.description }}
                      <button (click)="startEditExpense(e)">Editar</button>
                      <button (click)="deleteExpense(e)">Borrar</button>
                    </p>
                  }
                </div>
              }
            </div>
          }

          <h3>Balances</h3>
          <button (click)="calculateSettlements()" [disabled]="isCalculatingSettlements()">
            Calcular liquidaciones
          </button>
          @if (balances.error()) {
            <p>Error cargando balances</p>
          } @else {
            @for (item of balancesWithNames(); track item.id) {
              <p>{{ item.name }}: {{ item.balance | number: '1.2-2' }}</p>
            }
            @if (settlements()) {
              <h4>Liquidaciones</h4>
              @for (s of settlements(); track s.from + '-' + s.to) {
                <p>
                  {{ getParticipantName(s.from) }} → {{ getParticipantName(s.to) }}:
                  {{ s.amount | number: '1.2-2' }}
                </p>
              }
            } @else if (settlementsError()) {
              <p style="color:red">{{ settlementsError() }}</p>
            }
          }
        } @else {
          <p>Selecciona un participante y autentícate para ver los gastos y balances.</p>
        }
      </div>
    }
  `,
  styles: ``,
})
export class Event {
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
      required(path.payer_id, { message: 'Payer is required' });
      validate(path.amount, (ctx) => {
        const v = ctx.value();
        if (!v || v <= 0) {
          return customError({ kind: 'invalid_amount', message: 'Amount must be > 0' });
        }
        return null;
      });
      validate(path.consumers, (ctx) => {
        const v = ctx.value();
        if (!v || v.length === 0) {
          return customError({ kind: 'no_consumers', message: 'Select at least one consumer' });
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
      required(path.payer_id);
      validate(path.amount, (ctx) => {
        const v = ctx.value();
        if (!v || v <= 0)
          return customError({ kind: 'invalid_amount', message: 'Amount must be > 0' });
        return null;
      });
      validate(path.consumers, (ctx) => {
        const v = ctx.value();
        if (!v || v.length === 0)
          return customError({ kind: 'no_consumers', message: 'Select at least one consumer' });
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
    required(path.name, { message: 'Participant name is required' });
  });

  editParticipantForm = form(signal<{ name: string }>({ name: '' }), (path) => {
    required(path.name, { message: 'Participant name is required' });
  });

  // Edit event name
  editingEventName = signal(false);
  editEventName = signal('');
  editEventError = signal<string | null>(null);
  editEventForm = form(signal<{ name: string }>({ name: '' }), (path) => {
    required(path.name, { message: 'Event name is required' });
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
      this.settlementsError.set(msg || 'Error calculando liquidaciones');
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
      this.newParticipantError.set('Por favor corrige los campos');
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
      this.newParticipantError.set(msg || 'Error creando participante');
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
      this.editParticipantError.set('Por favor corrige los campos');
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
      this.editParticipantError.set(msg || 'Error editando participante');
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
      this.newParticipantError.set(msg || 'Error borrando participante');
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
      this.editEventError.set('Por favor corrige los campos');
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
      this.editEventError.set(msg || 'Error actualizando evento');
    }
  }

  async createExpense() {
    this.newExpenseForm.payer_id().markAsDirty();
    this.newExpenseForm.amount().markAsDirty();
    this.newExpenseForm.consumers().markAsDirty();
    if (!this.newExpenseForm().valid()) {
      this.newExpenseError.set('Por favor corrige los campos');
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
      this.newExpenseError.set(msg || 'Error creando gasto');
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
      this.editExpenseError.set('Corrige los campos');
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
      this.editExpenseError.set(msg || 'Error actualizando gasto');
    }
  }

  async deleteExpense(e: Expense) {
    try {
      await this.apiEvents.deleteExpense(this.eventId(), e.id);
      this.reloadData();
    } catch (err: unknown) {
      // attach to newExpenseError for simplicity
      const msg = err instanceof Error ? err.message : String(err);
      this.newExpenseError.set(msg || 'Error borrando gasto');
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
          throw new Error('PIN inválido');
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
      this.authError.set(msg || 'Error al verificar PIN');
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
