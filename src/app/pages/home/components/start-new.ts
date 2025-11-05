import { Component, computed, inject, signal } from '@angular/core';
import { Button, Input, InputGroup, TranslationManager } from '@basis-ng/primitives';
import { ApiEvents } from '../../../core/services/api-events';
import { Field, form, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCopy, lucideLoader } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { RouterLink } from '@angular/router';
import { QrCodeComponent } from 'ng-qrcode';

@Component({
  selector: 's-start-new',
  imports: [
    Input,
    Button,
    NgIcon,
    FormsModule,
    CdkCopyToClipboard,
    Field,
    RouterLink,
    QrCodeComponent,
    InputGroup,
  ],
  template: `
    @if (eventCode()) {
      <div class="flex flex-col items-center gap-2">
        <ng-icon name="lucideCheckCircle" size="64" color="#22c55e" />
        <h3 class="text-lg font-semibold text-center">¡Tu sunio está listo para usar!</h3>
        <span class="text-sm text-gray-500 text-center">
          Comparte el enlace con quien quieras para empezar a gestionar gastos juntos.
        </span>
      </div>
      <div
        class="bg-background-dark flex w-full justify-center p-2 rounded-md inset-ring-1 inset-ring-primary/30"
      >
        <qr-code
          [value]="eventUrl()"
          [size]="180"
          errorCorrectionLevel="M"
          darkColor="#00000000"
          lightColor="#FFFFFF"
          class="rounded-size-lg overflow-hidden"
        />
      </div>
      <span class="text-xs text-gray-400 text-center">
        O escanea este código QR para unirte fácilmente
      </span>
      <b-input-group class="w-full">
        <input b-input type="text" class="b-size-lg" [ngModel]="eventUrl()" [disabled]="true" />
        <button b-button class="b-variant-secondary b-size-md" [cdkCopyToClipboard]="eventUrl()">
          <ng-icon name="lucideCopy" size="20" color="currentColor" />
        </button>
      </b-input-group>
      <button b-button class="b-size-lg b-variant-secondary" (click)="shareOnWhatsApp()">
        Compartir en WhatsApp
      </button>
      <button b-button class="b-size-lg b-variant-primary" [routerLink]="'/' + eventCode()">
        Ir a mi sunio
      </button>
    } @else {
      <input
        b-input
        type="text"
        [field]="newEvent.name"
        placeholder="Nombre del sunio"
        class="w-full b-size-lg"
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
      <button b-button class="b-size-lg b-variant-primary" (click)="submitForm()">
        @if (creatingEvent()) {
          <ng-icon name="lucideLoader" size="16" color="currentColor" class="animate-spin" />
        } @else {
          Inicia tu sunio
        }
      </button>
    }
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [
    provideIcons({
      lucideLoader,
      lucideCheckCircle,
      lucideCopy,
    }),
  ],
})
export class StartNew {
  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject(TranslationManager);

  creatingEvent = signal(false);
  eventCode = signal('');
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
}
