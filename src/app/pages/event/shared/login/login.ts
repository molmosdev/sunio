import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { customError, Field, form, required } from '@angular/forms/signals';
import {
  TranslatePipe,
  TranslationManager,
  Button,
  Otp,
  OtpDigitDirective,
} from '@basis-ng/primitives';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';
import { SelectField } from '../../../../shared/components/select-field';
import { AddParticipant } from '../add-participant/add-participant';
import { RouterLink } from '@angular/router';

@Component({
  selector: 's-login',
  imports: [
    TranslatePipe,
    Field,
    SelectField,
    Button,
    AddParticipant,
    RouterLink,
    Otp,
    OtpDigitDirective,
  ],
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
        <b-otp
          [field]="pinForm.pin"
          class="b-size-lg"
          (keydown.enter)="submitPin()"
          [dirty]="pinForm.pin().dirty()"
        >
          <input b-otp-digit />
          <input b-otp-digit />
          <input b-otp-digit />
          <input b-otp-digit />
        </b-otp>
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
      <div class="w-full absolute bottom-0 z-10 flex gap-2">
        <button
          b-button
          routerLink="/home"
          class="b-variant-secondary b-size-lg b-rounded-full flex-1"
        >
          Mis sunios
        </button>
        @if (selectedParticipant().length === 0) {
          <button
            b-button
            class="b-variant-primary b-size-lg b-rounded-full flex-1"
            (click)="openAddParticipantDrawer(addParticipantTpl)"
          >
            Únete
          </button>
        }
      </div>
    }
  `,
  host: {
    class: 'flex-1 flex flex-col gap-5 items-center justify-center',
  },
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
