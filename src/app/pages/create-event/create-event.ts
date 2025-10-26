import { Component, computed, inject, signal } from '@angular/core';
import { customError, Field, form, required, validate } from '@angular/forms/signals';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  Dialog,
  DialogManager,
  Input,
  InputGroup,
  TranslatePipe,
  TranslationManager,
} from '@basis-ng/primitives';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideTrash, lucideUserRoundPlus } from '@ng-icons/lucide';
import { ApiEvents } from '../../core/services/api-events';

interface NewEvent {
  name: string;
  participants: string[];
}

@Component({
  selector: 's-create-event',
  imports: [
    Field,
    Button,
    Input,
    InputGroup,
    RouterLink,
    NgIcon,
    TranslatePipe,
    Dialog,
    Card,
    CardHeader,
    CardDescription,
    CardContent,
    CardFooter,
  ],
  template: `
    <button b-button routerLink="/home" class="b-variant-outlined b-squared absolute top-4 left-4">
      <ng-icon name="lucideArrowLeft" size="16" color="currentColor" />
    </button>
    <div class="flex gap-2">
      <b-input-group>
        <input
          b-input
          type="text"
          [field]="form.name"
          [placeholder]="'create-event.event-name' | translate"
        />
      </b-input-group>
      <button b-button class="b-variant-outlined b-squared" (click)="openAddParticipantDialog()">
        <ng-icon name="lucideUserRoundPlus" size="16" color="currentColor" />
      </button>
    </div>
    @if (nameError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">
        {{ nameError() }}
      </span>
    }
    @if (form.participants.length > 0) {
      <div class="flex gap-4 mt-2">
        @for (participant of form.participants; track $index) {
          <div class="flex flex-col gap-1 items-center">
            <div class="relative">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm inset-ring-1 inset-ring-ring dark:inset-ring-ring-dark"
              >
                {{ ((participant().value() || '') + '').trim().charAt(0).toUpperCase() }}
              </div>
              <button
                b-button
                class="absolute -top-2 -right-2 b-size-sm b-squared b-variant-secondary b-rounded-full"
                (click)="removeParticipant($index)"
                aria-label="Remove participant"
                title="Remove"
              >
                <ng-icon name="lucideTrash" size="12" color="currentColor" />
              </button>
            </div>
            <span class="text-sm">{{ participant().value() }}</span>
          </div>
        }
      </div>
    }
    @if (participantsError()) {
      <span class="text-sm text-destructive dark:text-destructive-dark">
        {{ participantsError() }}
      </span>
    }

    <button b-button (click)="submitForm()" class="absolute bottom-4 right-4">
      {{ 'create-event.create' | translate }}
    </button>

    <ng-template bDialog="addParticipantDialog">
      <b-card class="max-w-[80vw]">
        <b-card-header>
          <b-card-description>
            {{ 'create-event.add-participant-description' | translate }}
          </b-card-description>
        </b-card-header>
        <b-card-content>
          <b-input-group>
            <input
              b-input
              type="text"
              [field]="addParticipantForm.participantName"
              [placeholder]="'create-event.participant-name' | translate"
            />
          </b-input-group>
          @if (dialogParticipantError()) {
            <span class="text-sm text-destructive dark:text-destructive-dark">
              {{ dialogParticipantError() }}
            </span>
          }
        </b-card-content>
        <b-card-footer>
          <button b-button class="b-variant-outlined" (click)="closeAddParticipantDialog()">
            {{ 'create-event.close' | translate }}
          </button>
          <button b-button (click)="confirmAddParticipant()">
            {{ 'create-event.add' | translate }}
          </button>
        </b-card-footer>
      </b-card>
    </ng-template>
  `,
  host: {
    class: 'flex flex-col gap-4 items-center justify-center h-full',
  },
  providers: [provideIcons({ lucideTrash, lucideArrowLeft, lucideUserRoundPlus })],
})
export class CreateEvent {
  translationManager = inject(TranslationManager);
  dialogManager = inject(DialogManager);
  form = form(signal<NewEvent>({ name: '', participants: [] }), (path) => {
    required(path.name, {
      message: this.translationManager.translate('create-event.errors.name-required'),
    });
    required(path.participants);
    validate(path.participants, (ctx) => {
      const value = ctx.value();
      if (value.length < 2) {
        return customError({
          kind: 'too_few_participants',
          message: this.translationManager.translate('create-event.errors.too-few-participants'),
        });
      }
      if (value.some((participant) => participant.trim() === '')) {
        return customError({
          kind: 'empty_participant',
          message: this.translationManager.translate('create-event.errors.empty-participant'),
        });
      }
      return null;
    });
  });
  apiEvents = inject(ApiEvents);
  router = inject(Router);

  addParticipantForm = form(
    signal<{ participantName: string }>({ participantName: '' }),
    (path) => {
      required(path.participantName, {
        message: this.translationManager.translate('create-event.errors.participant-name-required'),
      });
    },
  );

  dialogParticipantError = computed(() => {
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

  openAddParticipantDialog() {
    this.addParticipantForm.participantName().value.set('');
    this.addParticipantForm.participantName().reset();
    this.dialogManager.openDialog('addParticipantDialog');
  }

  closeAddParticipantDialog() {
    this.dialogManager.closeDialog('addParticipantDialog');
  }

  confirmAddParticipant() {
    const name = (this.addParticipantForm.participantName().value() || '').trim();
    if (!name) {
      this.addParticipantForm.participantName().markAsDirty();
      return;
    }
    const currentParticipants = this.form.participants().value();
    this.form.participants().value.set([...currentParticipants, name]);
    this.form.participants().markAsDirty();
    this.closeAddParticipantDialog();
  }

  removeParticipant(index: number) {
    const currentParticipants = this.form.participants().value();
    this.form.participants().value.set(currentParticipants.filter((_, i) => i !== index));
  }
}
