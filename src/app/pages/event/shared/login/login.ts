import { Component, inject, input, model, signal } from '@angular/core';
import { customError, Field, form, required } from '@angular/forms/signals';
import { Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideForward } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { Participants } from '../../../../shared/components/participants/participants';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';

@Component({
  selector: 's-login',
  imports: [NgIcon, Input, InputGroup, Participants, TranslatePipe, Field],
  template: `
    <div class="flex flex-col gap-1 items-center">
      <div class="font-medium text-center">{{ 'event.login.who-are-you' | translate }}</div>
      <s-participants
        [participants]="participants()"
        [(selected)]="selectedParticipant"
        (participantSelected)="pinDataModel.set({ pin: '' })"
      />
    </div>
    @if (selectedParticipant().length === 1) {
      <b-input-group>
        <input
          b-input
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          placeholder="PIN"
          [field]="pinForm.pin"
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
    class: 'flex flex-col gap-6 items-center justify-center',
  },
  providers: [provideIcons({ lucideForward })],
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
