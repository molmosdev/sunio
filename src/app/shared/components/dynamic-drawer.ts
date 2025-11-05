import { Component, computed, inject } from '@angular/core';
import { State } from '../../core/services/state';
import { NgTemplateOutlet } from '@angular/common';
import { Drawer } from '@basis-ng/primitives';

@Component({
  selector: 's-dynamic-drawer',
  imports: [NgTemplateOutlet, Drawer],
  template: `
    @if (state.isDynamicDrawerOpen()) {
      <div class="fixed inset-0 bg-black/30 dark:bg-black/50 z-20"></div>
    }
    <b-drawer
      [(isOpen)]="state.isDynamicDrawerOpen"
      [style.height]="'auto'"
      class="absolute! rounded-t-size-lg!"
    >
      <div class="px-6 pb-6 flex flex-col gap-4">
        <ng-container [ngTemplateOutlet]="content()" />
      </div>
    </b-drawer>
  `,
  host: { class: 'fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-md' },
})
export class DynamicDrawer {
  state = inject(State);
  content = computed(() => this.state.dynamicDrawerContent());
}
