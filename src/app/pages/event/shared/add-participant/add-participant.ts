import { Component, computed, inject, signal } from '@angular/core';
import { customError, Field, form, required } from '@angular/forms/signals';
import { Button, Input, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideUserPlus } from '@ng-icons/lucide';
import { ApiEvents } from '../../../../core/services/api-events';
import { State } from '../../../../core/services/state';

@Component({
  selector: 's-add-participant',
  imports: [Input, Button, Field, NgIcon],
  template: `
    <input
      b-input
      type="text"
      class="b-size-lg w-full"
      [field]="participantForm.name"
      placeholder="Tu nombre"
    />
    @if (this.participantForm.name().errors().length > 0 && this.participantForm.name().dirty()) {
      <p class="text-sm text-destructive dark:text-destructive-dark">
        {{ this.participantForm.name().errors()[0].message }}
      </p>
    }
    <input
      b-input
      type="password"
      inputmode="numeric"
      class="b-size-lg w-full"
      [field]="participantForm.pin"
      placeholder="Crea un PIN"
    />
    @if (this.participantForm.pin().errors().length > 0 && this.participantForm.pin().dirty()) {
      <p class="text-sm text-destructive dark:text-destructive-dark">
        {{ this.participantForm.pin().errors()[0].message }}
      </p>
    }
    <span class="text-sm text-gray-500">
      Introduce tu nombre y crea un PIN para unirte al sunio y empezar a compartir gastos.
    </span>
    <button b-button class="b-size-lg b-variant-primary b-rounded-full" (click)="submitForm()">
      @if (isSubmitting()) {
        <ng-icon name="lucideLoader" size="16" color="currentColor" class="animate-spin" />
      } @else {
        <ng-icon name="lucideUserPlus" size="16" color="currentColor" />
        Unirse
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
          message: 'Este nombre ya está en uso. Por favor, elige otro.',
        }),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
