import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { IEvent } from '../../../../shared/interfaces/event.interface';
import { Button, Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { customError, Field, form, required } from '@angular/forms/signals';
import { ApiEvents } from '../../../../core/services/api-events';

@Component({
  selector: 's-title',
  imports: [Button, NgIcon, InputGroup, Input, Field, TranslatePipe],
  template: `
    <div class="flex gap-2 items-center">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        {{ event()?.name }}
      </h2>
      @if (editable() && !editing()) {
        <button
          b-button
          class="b-variant-secondary b-squared b-size-sm"
          (click)="editing.set(true)"
        >
          <ng-icon name="lucidePencil" size="13" color="currentColor" />
        </button>
      }
    </div>
    @if (editing()) {
      <b-input-group>
        <input
          b-input
          type="text"
          [field]="form.name"
          [placeholder]="'event.event-name' | translate"
          (keydown.enter)="submitEditEvent()"
        />
        <button b-button (click)="submitEditEvent()" class="b-variant-outlined b-squared b-size-sm">
          <ng-icon name="lucideSave" size="14" color="currentColor" />
        </button>
        <button b-button class="b-variant-outlined  b-squared b-size-sm" (click)="cancelEdit()">
          <ng-icon name="lucideX" size="15" color="currentColor" />
        </button>
      </b-input-group>
      @if (error()) {
        <p class="text-sm text-destructive dark:text-destructive-dark">
          {{ error() }}
        </p>
      }
    }
  `,
  host: {
    class: 'flex flex-col gap-4 justify-center items-center',
  },
  providers: [provideIcons({ lucidePencil })],
})
export class Title {
  event = input<IEvent>();
  formDataModel = linkedSignal(() => ({ name: this.event() ? this.event()!.name : '' }));
  editable = input(false);
  editing = signal(false);
  reload = output<void>();

  private _apiEvents = inject(ApiEvents);
  private _translationManager = inject(TranslationManager);

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

  async submitEditEvent() {
    this.form.name().markAsDirty();

    if (this.form().valid()) {
      const event = this.event();

      if (!event) {
        return;
      }

      try {
        await this._apiEvents.updateEvent(event.id, this.form.name().value().trim());
        this.reload.emit();
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
      this.editing.set(false);
    }
  }

  cancelEdit() {
    this.editing.set(false);
    this.form().reset();
  }
}
