import { Component, inject, signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

@Component({
  selector: 's-load-event',
  imports: [Field],
  template: `
    <input type="text" [field]="form.eventId" placeholder="Event ID" />
    @if (form.eventId().errors().length > 0 && form.eventId().dirty()) {
      <span>{{ form.eventId().errors()[0].message }}</span>
    }
    <button (click)="submitForm()">Load Event</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
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
