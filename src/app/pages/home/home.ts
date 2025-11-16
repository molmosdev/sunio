import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Button, TranslationManager } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucidePlus } from '@ng-icons/lucide';
import { DatePipe } from '@angular/common';
import { State } from '../../core/services/state';
import { ApiEvents } from '../../core/services/api-events';
import { StartNew } from './components/start-new';
import { Join } from './components/join';

@Component({
  selector: 's-home',
  imports: [Button, NgIcon, DatePipe, StartNew, Join],
  template: `
    <!-- Sunio Options Drawer Template -->
    <ng-template #sunioOptionsTpl>
      <button b-button class="b-size-lg b-variant-primary b-rounded-full" (click)="goToEvent()">
        Entrar al sunio
      </button>
      <button
        b-button
        class="b-size-lg b-variant-destructive b-rounded-full"
        (click)="removeRecentEvent()"
      >
        Eliminar
      </button>
    </ng-template>

    <div class="h-full flex flex-col items-center justify-between">
      <div class="flex flex-col gap-2 w-full max-h-dvh overflow-y-auto py-22">
        @if (isRecentEventsLoading()) {
          <ng-icon
            name="lucideLoader"
            size="23"
            color="currentColor"
            class="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        } @else {
          @for (event of recentEvents(); track event.id) {
            <div
              (click)="onSunioSelected(event.id, sunioOptionsTpl)"
              class="w-full py-3 px-4 rounded-size-lg flex gap-4 cursor-pointer bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-x"
            >
              <div class="flex flex-col gap-0.5">
                <span>{{ event.name }}</span>
                <span class="text-xs opacity-55"> {{ event.last_active | date: 'short' }} </span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Start New Drawer Template -->
      <ng-template #startNewTpl>
        <s-start-new />
      </ng-template>

      <!-- Join Drawer Template -->
      <ng-template #joinTpl>
        <s-join />
      </ng-template>

      <!-- Add Drawer Template -->
      <ng-template #addDrawerTpl>
        <button
          b-button
          class="b-size-lg b-variant-primary b-rounded-full"
          (click)="openStartNewDrawer(startNewTpl)"
        >
          Iniciar nuevo sunio
        </button>
        <button
          b-button
          class="b-size-lg b-variant-secondary b-rounded-full"
          (click)="openJoinDrawer(joinTpl)"
        >
          Tengo un código
        </button>
      </ng-template>

      <button
        b-button
        class="b-squared b-rounded-full b-size-lg fixed bottom-5 z-10"
        (click)="openAddDrawer(addDrawerTpl)"
      >
        <ng-icon name="lucidePlus" size="24" />
      </button>
    </div>
  `,
  host: {
    class: 'flex flex-col h-full w-full relative overflow-hidden',
  },
  providers: [
    provideIcons({
      lucidePlus,
      lucideLoader,
    }),
  ],
})
export class Home {
  private _apiEvents = inject(ApiEvents);
  private _router = inject(Router);
  private _translationManager = inject(TranslationManager);
  private _state = inject(State);

  recentEvents = computed(() => this._state.recentEvents.value());
  isRecentEventsLoading = computed(() => this._state.recentEvents.isLoading());

  addDrawerOpen = signal(false);
  startNewSunio = signal(false);
  loadExistingSunio = signal(false);
  isADrawerOpen = computed(() => {
    return this.addDrawerOpen() || this.startNewSunio() || this.loadExistingSunio();
  });

  goToEvent() {
    this._router.navigateByUrl(`/${this.selectedSunioId()}`);
    this._state.closeDynamicDrawer();
  }

  async removeRecentEvent(): Promise<void> {
    const id = this.selectedSunioId();
    if (!id) return;
    await this._apiEvents.deleteRecentEvent(id);
    this._state.reloadRecentEvents();
    this._state.closeDynamicDrawer();
  }

  openAddDrawer(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }

  openStartNewDrawer(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }

  openJoinDrawer(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }

  selectedSunioId = signal<string | null>(null);

  onSunioSelected(eventId: string, template: TemplateRef<unknown>) {
    this.selectedSunioId.set(eventId);
    this._state.openDynamicDrawer(template);
  }
}
