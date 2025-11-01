import { Component, inject, resource, signal, computed } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { Button, Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { Router, RouterLink } from '@angular/router';
import { ApiEvents } from '../../core/services/api-events';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCloudDownload, lucideTrash } from '@ng-icons/lucide';

@Component({
  selector: 's-load-event',
  imports: [Field, Input, Button, InputGroup, NgIcon, RouterLink, TranslatePipe],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    <b-input-group class="w-full max-w-xs">
      <input
        b-input
        type="text"
        [field]="form.eventId"
        [placeholder]="'load-event.event-code' | translate"
      />
      <button b-button class="b-size-sm b-squared b-variant-outlined" (click)="submitForm()">
        <ng-icon name="lucideCloudDownload" size="16" color="currentColor" />
      </button>
    </b-input-group>
    @if (eventIdError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">{{ eventIdError() }}</span>
    }
    @if (recentEvents.hasValue() && recentEvents.value().length !== 0) {
      @for (recentEvent of recentEvents.value(); track recentEvent.id) {
        <div class="flex gap-2 w-full max-w-xs">
          <button b-button class="b-variant-secondary flex-1" (click)="goToEvent(recentEvent.id)">
            {{ recentEvent.name }}
          </button>
          <button
            b-button
            class="b-variant-secondary b-squared"
            (click)="removeRecentEvent(recentEvent.id)"
          >
            <ng-icon name="lucideTrash" size="16" />
          </button>
        </div>
      }
    }
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideArrowLeft, lucideCloudDownload, lucideTrash })],
})
export class LoadEvent {
  router = inject(Router);
  translationManager = inject(TranslationManager);
  private _apiEvents = inject(ApiEvents);
  recentEvents = resource({
    loader: async () => (await this._apiEvents.getRecentEvents()).recentEvents,
  });
  goToEvent(eventId: string) {
    this.router.navigate(['/', eventId]);
  }

  removeRecentEvent(eventId: string) {
    this._apiEvents.deleteRecentEvent(eventId).then(() => {
      this.recentEvents.reload();
    });
  }
  form = form(signal<{ eventId: string }>({ eventId: '' }), (path) => {
    required(path.eventId, {
      message: this.translationManager.translate('load-event.errors.code-required'),
    });
  });

  eventIdError = computed(() => {
    return this.form.eventId().dirty() && this.form.eventId().errors().length > 0
      ? this.form.eventId().errors()[0].message
      : null;
  });

  submitForm() {
    this.form.eventId().markAsDirty();

    if (!this.form().valid()) {
      return;
    }

    this.router.navigate(['/', this.form.eventId().value()]);
  }
}
