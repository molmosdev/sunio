import { Component, inject, signal } from '@angular/core';
import { customError, Field, form, required, validate } from '@angular/forms/signals';
import { ApiEvents } from '../../core/services/api-events';
import { Router } from '@angular/router';

interface NewEvent {
  name: string;
  participants: string[];
}

@Component({
  selector: 's-create-event',
  imports: [Field],
  template: `
    <input type="text" [field]="form.name" placeholder="Event Name" />
    @if (form.name().errors().length > 0 && form.name().dirty()) {
      <span>{{ form.name().errors()[0].message }}</span>
    }
    @for (participant of form.participants; track $index) {
      <div>
        <input type="text" [field]="participant" placeholder="Participant Name" />
        <button (click)="removeParticipant($index)">Remove</button>
      </div>
    }
    <button (click)="addParticipant()">Add Participant</button>
    @if (form.participants().errors().length > 0 && form.participants().dirty()) {
      <span>{{ form.participants().errors()[0].message }}</span>
    }
    <button (click)="submitForm()">Create Event</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
})
export class CreateEvent {
  form = form(signal<NewEvent>({ name: '', participants: [] }), (path) => {
    required(path.name, { message: 'Event name is required' });
    required(path.participants);
    validate(path.participants, (ctx) => {
      const value = ctx.value();
      if (value.length < 2) {
        return customError({
          kind: 'too_few_participants',
          message: 'At least 2 participants are required',
        });
      }
      if (value.some((participant) => participant.trim() === '')) {
        return customError({
          kind: 'empty_participant',
          message: 'All participants must have a name',
        });
      }
      return null;
    });
  });
  apiEvents = inject(ApiEvents);
  router = inject(Router);

  async submitForm() {
    this.form.name().markAsDirty();
    this.form.participants().markAsDirty();

    if (!this.form().valid()) {
      return;
    }

    const data: NewEvent = this.form().value();
    const response = await this.apiEvents.createEvent(data);
    this.router.navigate(['/', response.eventId]);
  }

  addParticipant() {
    const currentParticipants = this.form.participants().value();
    this.form.participants().value.set([...currentParticipants, '']);
  }

  removeParticipant(index: number) {
    const currentParticipants = this.form.participants().value();
    this.form.participants().value.set(currentParticipants.filter((_, i) => i !== index));
  }
}
