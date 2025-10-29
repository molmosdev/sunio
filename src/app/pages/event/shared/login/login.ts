import { Component, inject, input, model, signal } from '@angular/core';
import { ApiEvents } from '../../../../core/services/api-events';
import { customError, Field, form, required } from '@angular/forms/signals';
import { Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { NgIcon } from '@ng-icons/core';
import { Participants } from '../../../../shared/components/participants/participants';

@Component({
  selector: 's-login',
  imports: [NgIcon, Input, InputGroup, Participants, TranslatePipe, Field],
  template: `
    <s-participants
      [participants]="participants()"
      [(selected)]="selectedParticipant"
      (participantSelected)="pinDataModel.set({ pin: '' })"
    />
    @if (selectedParticipant().length === 1) {
      <b-input-group>
        <input
          b-input
          type="password"
          [field]="pinForm.pin"
          maxLength="4"
          [placeholder]="
            !selectedParticipant()[0]?.pin
              ? ('event.participants.pin.setup' | translate)
              : ('event.participants.pin.prompt' | translate)
          "
          (keydown.enter)="submitPin()"
        />
        <button
          b-button
          class="b-size-sm b-squared b-variant-outlined"
          (click)="submitPin()"
          [disabled]="isSubmittingPin()"
        >
          <ng-icon name="lucideForward" size="13" color="currentColor" />
        </button>
      </b-input-group>
      @if (pinForm.pin().errors().length > 0 && pinForm.pin().dirty()) {
        <p class="text-sm text-destructive dark:text-destructive-dark">
          {{ pinForm.pin().errors()[0].message }}
        </p>
      }
    }
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center',
  },
})
export class Login {
  eventId = input.required<string>();
  participants = input.required<IParticipant[]>();
  loggedParticipant = model<IParticipant | null>(null);

  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject(TranslationManager);

  selectedParticipant = signal<IParticipant[]>([]);
  isSubmittingPin = signal(false);

  pinDataModel = signal<{ pin: string }>({ pin: '' });

  pinForm = form(this.pinDataModel, (path) => {
    required(path.pin, {
      message: this._translationManager.translate('event.errors.pin-required'),
    });
  });

  async submitPin() {
    const selected = this.selectedParticipant();
    if (selected.length !== 1) {
      return;
    }
    const participant = selected[0];
    if (this.pinForm().valid()) {
      try {
        this.isSubmittingPin.set(true);
        if (!participant.pin) {
          const res = await this._apiEvents.setParticipantPin(this.eventId(), participant.id, {
            pin: this.pinForm.pin().value(),
          });
          console.log('Set PIN response:', res);
        } else {
          const res = await this._apiEvents.loginParticipant(
            this.eventId(),
            participant.id,
            this.pinForm.pin().value(),
          );
          console.log('Login response:', res);
        }
        this.loggedParticipant.set(participant);
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
}
