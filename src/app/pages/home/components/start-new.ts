import { Component, computed, inject, signal } from '@angular/core';
import { Button, Input, InputGroup, TranslationManager } from '@basis-ng/primitives';
import { ApiEvents } from '../../../core/services/api-events';
import { Field, form, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCheckCircle, lucideCopy, lucideLoader } from '@ng-icons/lucide';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { RouterLink } from '@angular/router';
import { State } from '../../../core/services/state';

@Component({
  selector: 's-start-new',
  imports: [Input, Button, NgIcon, CdkCopyToClipboard, Field, RouterLink, InputGroup],
  template: `
    @if (eventCode()) {
      <div class="flex flex-col items-center gap-2">
        <ng-icon name="lucideCheckCircle" size="64" color="#22c55e" />
        <h3 class="text-lg font-semibold text-center">¡Tu sunio está listo para usar!</h3>
        <span class="text-sm text-gray-500 text-center">
          Comparte el enlace con quien quieras para empezar a gestionar gastos juntos.
        </span>
      </div>
      <b-input-group class="w-full b-rounded-full">
        <input b-input type="text" class="b-size-lg" [value]="eventUrl()" [disabled]="true" />
        <button
          b-button
          class="b-variant-secondary b-size-md b-rounded-full"
          (click)="copied.set(true)"
          [cdkCopyToClipboard]="eventUrl()"
        >
          <ng-icon
            [name]="copied() ? 'lucideCheck' : 'lucideCopy'"
            size="16"
            color="currentColor"
          />
        </button>
      </b-input-group>
      <button
        b-button
        class="b-size-lg b-variant-secondary  b-rounded-full"
        (click)="shareOnWhatsApp()"
      >
        Compartir en WhatsApp
      </button>
      <button
        b-button
        class="b-size-lg b-variant-primary  b-rounded-full"
        [routerLink]="'/' + eventCode()"
        (click)="onGoToMySunioButtonClick()"
      >
        Ir a mi sunio
      </button>
    } @else {
      <input
        b-input
        type="text"
        [field]="newEvent.name"
        placeholder="Nombre del sunio"
        class="w-full b-size-lg b-rounded-full"
      />
      @if (nameError()) {
        <p class="text-sm text-destructive dark:text-destructive-dark">
          {{ nameError() }}
        </p>
      }
      <span class="text-sm text-gray-500">
        Ponle un nombre a tu sunio para identificarlo fácilmente. Por ejemplo: "Viaje a Madrid" o
        "Piso compartido".
      </span>
      <button b-button class="b-size-lg b-variant-primary b-rounded-full" (click)="submitForm()">
        @if (creatingEvent()) {
          <ng-icon name="lucideLoader" size="16" color="currentColor" class="animate-spin" />
        } @else {
          Inicia tu sunio
        }
      </button>
    }
  `,
  host: {
    class: 'flex flex-col gap-4 pt-2',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideCheckCircle,
      lucideCopy,
      lucideCheck,
    }),
  ],
})
export class StartNew {
  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject(TranslationManager);

  creatingEvent = signal(false);
  eventCode = signal('');
  copied = signal(false);
  eventUrl = computed(() => 'https://sunio.app/' + this.eventCode());

  newEvent = form(signal({ name: '' }), (path) => {
    required(path.name, {
      message: this._translationManager.translate('create-event.errors.name-required'),
    });
  });

  nameError = computed(() => {
    return this.newEvent.name().dirty() && this.newEvent.name().errors().length > 0
      ? this.newEvent.name().errors()[0].message
      : null;
  });

  async submitForm() {
    this.newEvent.name().markAsDirty();

    if (!this.newEvent().valid()) {
      return;
    }

    this.creatingEvent.set(true);
    const response = await this._apiEvents.createEvent({ name: this.newEvent.name().value() });
    this.eventCode.set(response.eventId);
    this.creatingEvent.set(false);
  }

  shareOnWhatsApp() {
    window.open('https://wa.me/?text=' + this.eventUrl(), '_blank');
  }

  private _state = inject(State);

  onGoToMySunioButtonClick() {
    this._state.closeDynamicDrawer();
  }
}
