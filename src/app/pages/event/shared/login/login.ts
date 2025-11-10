import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { customError, Field, form, required } from '@angular/forms/signals';
import { Input, TranslatePipe, TranslationManager, Button } from '@basis-ng/primitives';
import { provideIcons } from '@ng-icons/core';
import { lucideForward, lucideUserPlus } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';
import { SelectField } from '../../../../shared/components/select-field';
import { AddParticipant } from '../add-participant/add-participant';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 's-login',
  imports: [Input, TranslatePipe, Field, SelectField, Button, AddParticipant, NgIcon],
  template: `
    <ng-template #addParticipantTpl>
      <s-add-participant />
    </ng-template>
    @if (participants()?.length === 0) {
      <p class="text-center">Este sunio aún no tiene participantes registrados.</p>
      <button
        b-button
        class="b-size-lg w-full b-rounded-full"
        (click)="openAddParticipantDrawer(addParticipantTpl)"
      >
        Únete al sunio
      </button>
    } @else {
      <s-select-field
        [options]="participantOptions()!"
        [placeholder]="'event.login.who-are-you' | translate"
        [(value)]="selectedParticipantIds"
        (valueChange)="pinDataModel.set({ pin: '' })"
      />
      @if (selectedParticipant().length === 1) {
        <input
          b-input
          type="password"
          inputmode="numeric"
          placeholder="PIN"
          class="b-size-lg w-full b-rounded-full"
          [field]="pinForm.pin"
          [placeholder]="
            !selectedParticipant()[0]?.pin
              ? ('event.participants.pin.setup' | translate)
              : ('event.participants.pin.prompt' | translate)
          "
          (keydown.enter)="submitPin()"
        />
        @if (pinForm.pin().errors().length > 0 && pinForm.pin().dirty()) {
          <p class="text-sm text-destructive dark:text-destructive-dark">
            {{ pinForm.pin().errors()[0].message }}
          </p>
        }
        @if (pinForm.pin().errors().length === 0 && pinForm.pin().dirty()) {
          <button
            b-button
            class="b-size-lg w-full b-rounded-full"
            (click)="submitPin()"
            [disabled]="isSubmittingPin()"
          >
            Acceder
          </button>
        }
      }
      @if (selectedParticipant().length === 0) {
        <button
          b-button
          class="b-variant-secondary b-size-lg b-rounded-full w-full"
          (click)="openAddParticipantDrawer(addParticipantTpl)"
        >
          <ng-icon name="lucideUserPlus" size="17" color="currentColor" />
          Únete
        </button>
      }
    }
  `,
  host: {
    class: 'flex-1 flex flex-col gap-4 items-center justify-center',
  },
  providers: [provideIcons({ lucideForward, lucideUserPlus })],
})
export class Login {
  private _state = inject(State);
  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject(TranslationManager);

  eventId = computed(() => this._state.eventId());
  loggedParticipant = computed(() => this._state.loggedParticipant());
  participants = computed(() => this._state.participants.value());
  participantOptions = computed(() => {
    const participants = this.participants();
    if (!participants) return [];
    const mappedParticipants = participants.map((p) => ({
      value: p.id,
      label: p.name,
    }));
    return this.selectedParticipant().length === 0
      ? mappedParticipants
      : [{ value: '', label: '' }, ...mappedParticipants];
  });
  selectedParticipantIds = signal<string[]>([]);

  selectedParticipant = computed(() => {
    const ids = this.selectedParticipantIds();
    return this.participants()?.filter((p) => ids.includes(p.id)) || [];
  });
  isSubmittingPin = signal(false);
  pinDataModel = signal<{ pin: string }>({ pin: '' });

  pinForm = form(this.pinDataModel, (path) => {
    required(path.pin, {
      message: this._translationManager.translate('event.errors.pin-required'),
    });
  });

  async submitPin() {
    const selected = this.selectedParticipant();
    const eventId = this.eventId();
    if (selected.length !== 1 || !eventId) {
      return;
    }
    const participant = selected[0];
    if (this.pinForm().valid()) {
      try {
        this.isSubmittingPin.set(true);
        if (!participant.pin) {
          await this._apiEvents.setParticipantPin(eventId, participant.id, {
            pin: this.pinForm.pin().value(),
          });
        } else {
          await this._apiEvents.loginParticipant(
            eventId,
            participant.id,
            this.pinForm.pin().value(),
          );
        }
        this._state.setLoggedParticipant(participant);
      } catch {
        this.pinForm
          .pin()
          .errors()
          .push(
            customError({
              kind: 'auth_failed',
              message: this._translationManager.translate('event.errors.invalid-pin'),
            }),
          );
      } finally {
        this.isSubmittingPin.set(false);
      }
    }
  }

  openAddParticipantDrawer(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }
}
