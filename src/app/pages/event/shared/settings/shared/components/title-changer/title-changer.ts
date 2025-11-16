import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Button, Input, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { customError, Field, form, required } from '@angular/forms/signals';
import { State } from '../../../../../../../core/services/state';
import { ApiEvents } from '../../../../../../../core/services/api-events';

@Component({
  selector: 's-title-changer',
  imports: [Button, Input, Field, TranslatePipe],
  template: `
    <input
      b-input
      type="text"
      [field]="form.name"
      [placeholder]="'event.event-name' | translate"
      (keydown.enter)="onSaveButtonClicked()"
      class="b-size-lg"
    />
    @if (error()) {
      <p class="text-sm text-destructive dark:text-destructive-dark">
        {{ error() }}
      </p>
    }
    <button
      b-button
      class="b-variant-primary b-size-lg b-rounded-full"
      (click)="onSaveButtonClicked()"
    >
      Guardar cambios
    </button>
    <button
      b-button
      class="b-variant-secondary b-size-lg b-rounded-full"
      (click)="onCancelButtonClicked()"
    >
      Cancelar
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
})
export class TitleChanger {
  private _state = inject(State);
  private _translationManager = inject(TranslationManager);
  private _apiEvents = inject(ApiEvents);

  event = computed(() => this._state.event.value());
  formDataModel = linkedSignal(() => ({ name: this.event() ? this.event()!.name : '' }));
  form = form(this.formDataModel, (path) => {
    required(path.name, {
      message: this._translationManager.translate('event.errors.event-name-required'),
    });
  });
  error = computed(() => {
    return this.form.name().dirty() && this.form.name().errors().length > 0
      ? this.form.name().errors()[0].message
      : null;
  });

  async onSaveButtonClicked() {
    this.form.name().markAsDirty();
    if (this.form().valid()) {
      const event = this.event();
      if (!event) {
        return;
      }
      try {
        await this._apiEvents.updateEvent(event.id, this.form.name().value().trim());
      } catch {
        this.form
          .name()
          .errors()
          .push(
            customError({
              message: this._translationManager.translate('event.errors.update-event'),
            }),
          );
      }
      this._state.reloadEvent();
      this._state.closeDynamicDrawer();
    }
  }

  onCancelButtonClicked() {
    this._state.closeDynamicDrawer();
  }
}
