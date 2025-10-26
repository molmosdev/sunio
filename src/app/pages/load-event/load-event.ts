import { Component, inject, signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { Button, Input, InputGroup } from '@basis-ng/primitives';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCloudDownload } from '@ng-icons/lucide';

@Component({
  selector: 's-load-event',
  imports: [Field, Input, Button, InputGroup, NgIcon, RouterLink],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    <b-input-group>
      <input b-input type="text" [field]="form.eventId" placeholder="Event code" />
      <button b-button class="b-size-sm b-squared b-variant-outlined" (click)="submitForm()">
        <ng-icon name="lucideCloudDownload" size="16" color="currentColor" />
      </button>
    </b-input-group>
    @if (form.eventId().errors().length > 0 && form.eventId().dirty()) {
      <span class="text-destructive dark:text-destructive-dark">{{
        form.eventId().errors()[0].message
      }}</span>
    }
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideArrowLeft, lucideCloudDownload })],
})
export class LoadEvent {
  form = form(signal<{ eventId: string }>({ eventId: '' }), (path) => {
    required(path.eventId, { message: 'Event ID is required' });
  });
  router = inject(Router);

  submitForm() {
    this.form.eventId().markAsDirty();

    if (!this.form().valid()) {
      return;
    }

    this.router.navigate(['/', this.form.eventId().value()]);
  }
}
