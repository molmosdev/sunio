import { Component, computed, inject, signal } from '@angular/core';
import { customError, Field, form, required } from '@angular/forms/signals';
import {
  Button,
  Input,
  Otp,
  OtpDigitDirective,
  TranslatePipe,
  TranslationManager,
} from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideUserPlus } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-add-participant',
  imports: [Input, Button, Field, NgIcon, Otp, OtpDigitDirective, TranslatePipe],
  template: `
    <input
      b-input
      type="text"
      class="b-size-lg w-full"
      [field]="participantForm.name"
      [placeholder]="'event.add-participant.placeholder' | translate"
    />
    @if (this.participantForm.name().errors().length > 0 && this.participantForm.name().dirty()) {
      <p class="text-sm text-destructive dark:text-destructive-dark">
        {{ this.participantForm.name().errors()[0].message }}
      </p>
    }
    <b-otp [field]="participantForm.pin" class="b-size-lg" [dirty]="participantForm.pin().dirty()">
      <input b-otp-digit type="password" inputmode="numeric" />
      <input b-otp-digit type="password" inputmode="numeric" />
      <input b-otp-digit type="password" inputmode="numeric" />
      <input b-otp-digit type="password" inputmode="numeric" />
    </b-otp>
    @if (this.participantForm.pin().errors().length > 0 && this.participantForm.pin().dirty()) {
      <p class="text-sm text-destructive dark:text-destructive-dark">
        {{ this.participantForm.pin().errors()[0].message }}
      </p>
    }
    <span class="text-sm text-gray-500 text-center">
      {{ 'event.add-participant.hint' | translate }}
    </span>
    <button b-button class="b-size-lg b-variant-primary b-rounded-full" (click)="submitForm()">
      @if (isSubmitting()) {
        <ng-icon name="lucideLoader" size="16" color="currentColor" class="animate-spin" />
      } @else {
        <ng-icon name="lucideUserPlus" size="16" color="currentColor" />
        {{ 'event.add-participant.submitb' | translate }}
      }
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideUserPlus,
    }),
  ],
})
export class AddParticipant {
  private _apiEvents = inject(ApiEvents);
  private _state = inject(State);
  private _translationManager = inject(TranslationManager);

  eventId = computed(() => this._state.eventId());
  isSubmitting = signal(false);

  participantFormDataModel = signal({
    name: '',
    pin: '',
  });

  participantForm = form(this.participantFormDataModel, (path) => {
    required(path.name, {
      message: this._translationManager.translate('event.errors.participant-name-required'),
    });
    required(path.pin, {
      message: this._translationManager.translate('event.errors.pin-required'),
    });
  });

  async submitForm() {
    this.participantForm.name().markAsDirty();
    this.participantForm.pin().markAsDirty();

    const eventId = this.eventId();
    if (!eventId) return;

    if (!this.participantForm().valid()) {
      return;
    }

    try {
      this.isSubmitting.set(true);
      const participant = await this._apiEvents.createParticipant(eventId, {
        name: this.participantForm.name().value(),
        pin: this.participantForm.pin().value(),
      });
      this._state.setLoggedParticipant(participant);
      this._state.reloadParticipants();
      this._state.closeDynamicDrawer();
    } catch {
      const nameField = this.participantForm.name();
      nameField.errors().push(
        customError({
          kind: 'name_taken',
          message: this._translationManager.translate('event.errors.name-taken'),
        }),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
