import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button, Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCirclePlus,
  lucideCloudDownload,
  lucideLoader,
  lucideTrash,
} from '@ng-icons/lucide';
import { DatePipe, NgClass } from '@angular/common';
import { form, required, Field } from '@angular/forms/signals';
import { State } from '../../core/services/state';
import { ApiEvents } from '../../core/services/api-events';

@Component({
  selector: 's-home',
  imports: [RouterLink, Button, Field, TranslatePipe, NgIcon, DatePipe, InputGroup, Input, NgClass],
  template: `
    <div class="flex flex-1 flex-col items-center w-full h-full max-h-full relative">
      @if (isRecentEventsLoading()) {
        <ng-icon
          name="lucideLoader"
          size="23"
          color="currentColor"
          class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      } @else {
        <div
          class="flex-1 max-h-[calc(100vh-9.5rem)] w-full overflow-y-auto flex flex-col gap-3 pb-7"
          [ngClass]="{ 'max-h-[calc(100vh-10.5rem)]': eventIdError() }"
        >
          @for (event of recentEvents(); track event.id) {
            <div
              routerLink="/{{ event.id }}"
              class="w-full py-3 px-4 rounded-lg flex gap-4 cursor-pointer bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-x"
            >
              <div class="flex flex-col gap-0.5">
                <span>{{ event.name }}</span>
                <span class="text-xs opacity-55"> {{ event.last_active | date: 'short' }} </span>
              </div>
              <div class="flex-1 gap-2 flex justify-end items-center">
                <button
                  b-button
                  class="b-variant-ghost b-squared"
                  (click)="removeRecentEvent(event.id); $event.stopPropagation()"
                >
                  <ng-icon name="lucideTrash" size="16" />
                </button>
              </div>
            </div>
          }
        </div>
        <div
          class="flex flex-col gap-4 w-full bg-background dark:bg-background-dark absolute bottom-0 transition-colors duration-150"
        >
          <b-input-group class="w-full">
            <input
              b-input
              type="text"
              [field]="form.eventId"
              [placeholder]="'load-event.event-code' | translate"
            />
            <button b-button class="b-size-sm b-squared" (click)="submitForm()">
              <ng-icon name="lucideCloudDownload" size="16" color="currentColor" />
            </button>
          </b-input-group>
          @if (eventIdError()) {
            <span class="text-sm text-destructive dark:text-destructive-dark">{{
              eventIdError()
            }}</span>
          }
          <button b-button routerLink="/create-event" class="w-full">
            <ng-icon name="lucideCirclePlus" size="16" />
            {{ 'home.create-event' | translate }}
          </button>
        </div>
      }
    </div>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full max-h-full',
  },
  providers: [
    provideIcons({
      lucideCirclePlus,
      lucideCloudDownload,
      lucideLoader,
      lucideArrowRight,
      lucideTrash,
    }),
  ],
})
export class Home implements OnInit {
  private _apiEvents = inject(ApiEvents);
  private _router = inject(Router);
  private _translationManager = inject(TranslationManager);
  private _state = inject(State);

  recentEvents = computed(() => this._state.recentEvents.value());
  isRecentEventsLoading = computed(() => this._state.recentEvents.isLoading());

  ngOnInit(): void {
    this._state.inDebt.set(false);
  }

  async removeRecentEvent(eventId: string): Promise<void> {
    await this._apiEvents.deleteRecentEvent(eventId);
    this._state.reloadRecentEvents();
  }

  form = form(signal<{ eventId: string }>({ eventId: '' }), (path) => {
    required(path.eventId, {
      message: this._translationManager.translate('load-event.errors.code-required'),
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

    this._router.navigate(['/', this.form.eventId().value()]);
  }
}
