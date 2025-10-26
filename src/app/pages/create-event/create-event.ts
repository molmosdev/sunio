import { Component, inject, signal } from '@angular/core';
import { customError, Field, form, required, validate } from '@angular/forms/signals';
import { Button, Input, InputGroup } from '@basis-ng/primitives';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideTrash } from '@ng-icons/lucide';
import { ApiEvents } from '../../core/services/api-events';

interface NewEvent {
  name: string;
  participants: string[];
}

@Component({
  selector: 's-create-event',
  imports: [Field, Button, Input, InputGroup, RouterLink, NgIcon],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>

    <b-input-group>
      <input b-input type="text" [field]="form.name" placeholder="Event Name" />
    </b-input-group>
    @if (form.name().errors().length > 0 && form.name().dirty()) {
      <span class="text-destructive dark:text-destructive-dark">
        {{ form.name().errors()[0].message }}
      </span>
    }

    @for (participant of form.participants; track $index) {
      <b-input-group>
        <input b-input type="text" [field]="participant" placeholder="Participant Name" />
        <button
          b-button
          class="b-size-sm b-squared b-variant-outlined"
          (click)="removeParticipant($index)"
        >
          <ng-icon name="lucideTrash" size="13" color="currentColor" />
        </button>
      </b-input-group>
    }

    <button b-button class="b-variant-outlined" (click)="addParticipant()">Add Participant</button>

    @if (form.participants().errors().length > 0 && form.participants().dirty()) {
      <span class="text-destructive dark:text-destructive-dark">
        {{ form.participants().errors()[0].message }}
      </span>
    }

    <button b-button (click)="submitForm()">Create Event</button>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideTrash, lucideArrowLeft })],
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
