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
      class="rounded-t-3xl! max-w-md!"
      (closeSheet)="onDrawerClosed()"
    >
      <div class="px-6 pt-2 pb-6 flex flex-col gap-4">
        <ng-container [ngTemplateOutlet]="content()" />
      </div>
    </b-drawer>
  `,
})
export class DynamicDrawer {
  state = inject(State);
  content = computed(() => this.state.dynamicDrawerContent());

  onDrawerClosed(): void {
    if (this.state.expenseToEdit() !== null) {
      this.state.setExpenseToEdit(null);
    }
  }
}
