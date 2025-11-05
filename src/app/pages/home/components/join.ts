import { Component, computed, inject, signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Button, Input, TranslationManager } from '@basis-ng/primitives';
import { State } from '../../../core/services/state';

@Component({
  selector: 's-join',
  imports: [Input, Button, Field],
  template: `
    <h2 class="text-xl font-semibold">Únete a un sunio</h2>
    <input
      b-input
      placeholder="Introduce el código del sunio"
      class="w-full b-size-lg"
      [field]="eventToJoin.eventId"
    />
    <span class="text-sm text-gray-500"
      >Pide el código a quien creó el sunio para unirte y empezar a compartir gastos.</span
    >
    @if (eventIdError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">{{ eventIdError() }}</span>
    }
    <button b-button class="b-size-lg b-variant-primary" (click)="submitForm()">Unirse</button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
})
export class Join {
  private _router = inject(Router);
  private _translationManager = inject(TranslationManager);
  private _state = inject(State);

  eventToJoin = form(signal<{ eventId: string }>({ eventId: '' }), (path) => {
    required(path.eventId, {
      message: this._translationManager.translate('load-event.errors.code-required'),
    });
  });

  eventIdError = computed(() => {
    return this.eventToJoin.eventId().dirty() && this.eventToJoin.eventId().errors().length > 0
      ? this.eventToJoin.eventId().errors()[0].message
      : null;
  });

  submitForm() {
    this.eventToJoin.eventId().markAsDirty();

    if (!this.eventToJoin().valid()) {
      return;
    }
    this._router.navigate(['/', this.eventToJoin.eventId().value()]);
    this._state.closeDynamicDrawer();
  }
}
