import { Component, computed, inject, signal } from '@angular/core';
import { customError, Field, form, required, validate } from '@angular/forms/signals';
import { Button, Input, InputGroup, TranslatePipe, TranslationManager } from '@basis-ng/primitives';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideRocket, lucideTrash, lucideUserRoundPlus } from '@ng-icons/lucide';
import { ApiEvents } from '../../core/services/api-events';
import { Participants } from '../../shared/components/participants/participants';
import { IParticipant } from '../../shared/interfaces/participant.interface';

interface NewEvent {
  name: string;
  participants: IParticipant[];
}

@Component({
  selector: 's-create-event',
  imports: [Field, Button, Input, InputGroup, RouterLink, NgIcon, TranslatePipe, Participants],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    <b-input-group class="w-full max-w-xs">
      <input
        b-input
        type="text"
        [field]="form.name"
        [placeholder]="'create-event.event-name' | translate"
      />
    </b-input-group>

    <!-- Inline add-participant input group -->
    <b-input-group class="w-full max-w-xs">
      <input
        b-input
        type="text"
        [field]="addParticipantForm.participantName"
        [placeholder]="'create-event.participant-name' | translate"
        (keydown.enter)="confirmAddParticipant()"
      />
      <button
        b-button
        class="b-size-sm b-squared b-variant-outlined"
        (click)="confirmAddParticipant()"
      >
        <ng-icon name="lucideUserRoundPlus" size="14" color="currentColor" />
      </button>
    </b-input-group>
    @if (addParticipantError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">{{
        addParticipantError()
      }}</span>
    }
    @if (nameError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">
        {{ nameError() }}
      </span>
    }
    @if (form.participants.length > 0) {
      <s-participants
        [participants]="form.participants().value()"
        [(selected)]="selectedParticipant"
        (participantRemoved)="onparticipantRemoved()"
        [removable]="true"
        [unselectOnOutsideClick]="true"
        [multiple]="false"
      />
    }
    @if (participantsError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">
        {{ participantsError() }}
      </span>
    }

    <button b-button (click)="submitForm()" class="w-full max-w-xs b-variant-outlined">
      <ng-icon name="lucideRocket" size="16" color="currentColor" />
      {{ 'create-event.create' | translate }}
    </button>
  `,
  host: {
    class: 'flex flex-col gap-3 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideTrash, lucideArrowLeft, lucideUserRoundPlus, lucideRocket })],
})
export class CreateEvent {
  private _apiEvents = inject(ApiEvents);
  private _router = inject(Router);
  private _translationManager = inject(TranslationManager);

  form = form(signal<NewEvent>({ name: '', participants: [] }), (path) => {
    required(path.name, {
      message: this._translationManager.translate('create-event.errors.name-required'),
    });
    required(path.participants);
    validate(path.participants, (ctx) => {
      const value = ctx.value();
      if (value.length < 2) {
        return customError({
          kind: 'too_few_participants',
          message: this._translationManager.translate('create-event.errors.too-few-participants'),
        });
      }
      if (value.some((participant) => (participant.name || '').trim() === '')) {
        return customError({
          kind: 'empty_participant',
          message: this._translationManager.translate('create-event.errors.empty-participant'),
        });
      }
      return null;
    });
  });

  addParticipantForm = form(
    signal<{ participantName: string }>({ participantName: '' }),
    (path) => {
      required(path.participantName, {
        message: this._translationManager.translate(
          'create-event.errors.participant-name-required',
        ),
      });
      validate(path.participantName, (ctx) => {
        const name = (ctx.value() || '').trim();
        if (!name) return null;
        const normalized = name.toLowerCase();
        const participants = this.form.participants().value();
        if (participants.some((p) => (p.name || '').trim().toLowerCase() === normalized)) {
          return customError({
            kind: 'duplicate_participant',
            message: this._translationManager.translate(
              'create-event.errors.duplicate-participant',
            ),
          });
        }
        return null;
      });
    },
  );

  addParticipantError = computed(() => {
    const field = this.addParticipantForm.participantName();
    return field.dirty() && field.errors().length > 0 ? field.errors()[0].message : null;
  });

  nameError = computed(() => {
    return this.form.name().dirty() && this.form.name().errors().length > 0
      ? this.form.name().errors()[0].message
      : null;
  });

  participantsError = computed(() => {
    return this.form.participants().dirty() && this.form.participants().errors().length > 0
      ? this.form.participants().errors()[0].message
      : null;
  });

  selectedParticipant = signal<IParticipant[]>([]);

  onparticipantRemoved() {
    const selected = this.selectedParticipant();
    if (!selected.length) return;
    const currentParticipants = this.form.participants().value();
    const idsToRemove = new Set(selected.map((p) => p.id));
    this.form.participants().value.set(currentParticipants.filter((p) => !idsToRemove.has(p.id)));
    this.selectedParticipant.set([]);
  }

  async submitForm() {
    this.form.name().markAsDirty();
    this.form.participants().markAsDirty();

    if (!this.form().valid()) {
      return;
    }

    const dataRaw = this.form().value();
    const data: { name: string; participants: string[] } = {
      name: dataRaw.name,
      participants: (dataRaw.participants || []).map((p) => p.name),
    };
    const response = await this._apiEvents.createEvent(data);
    this._router.navigate(['/', response.eventId]);
  }

  confirmAddParticipant() {
    this.addParticipantForm.participantName().markAsDirty();
    if (!this.addParticipantForm().valid()) {
      return;
    }
    const name = (this.addParticipantForm.participantName().value() || '').trim();
    const currentParticipants = this.form.participants().value();
    const newParticipant: IParticipant = {
      id: Math.random().toString(36).substring(2),
      event_id: '',
      name,
      pin: null,
      created_at: new Date().toISOString(),
    };
    this.form.participants().value.set([...currentParticipants, newParticipant]);
    this.form.participants().markAsDirty();
    this.addParticipantForm.participantName().value.set('');
    this.addParticipantForm.participantName().reset();
  }

  participantRemoved(index: number) {
    const currentParticipants = this.form.participants().value();
    this.form.participants().value.set(currentParticipants.filter((_, i) => i !== index));
  }
}
