import { Component, input, output, signal } from '@angular/core';
import { Participant } from '../../interfaces/participant.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash } from '@ng-icons/lucide';
import { Button } from '@basis-ng/primitives';

@Component({
  selector: 's-participants',
  imports: [NgIcon, Button],
  template: `
    @for (participant of participants(); track participant.name) {
      <div class="flex flex-col gap-1 items-center" (click)="selectParticipant(participant)">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm inset-ring-1 inset-ring-ring dark:inset-ring-ring-dark"
            [class.inset-ring-3]="
              selectedParticipant() && selectedParticipant()!.id === participant.id
            "
          >
            {{ participant.name.charAt(0).toUpperCase() }}
          </div>
          @if (removable()) {
            <button
              b-button
              class="absolute -top-2 -right-2 b-size-sm b-squared b-variant-secondary b-rounded-full"
              (click)="participantRemoved.emit(participant)"
            >
              <ng-icon name="lucideTrash" size="12" color="currentColor" />
            </button>
          }
        </div>
        <span class="text-sm text-center">{{ participant.name }}</span>
      </div>
    }
  `,
  host: {
    class: 'flex gap-4 mt-2',
  },
  providers: [provideIcons({ lucideTrash })],
})
export class Participants {
  participants = input<Participant[]>();
  selectable = input<boolean>();
  removable = input<boolean>(false);
  participantRemoved = output<Participant>();
  participantSelected = output<Participant>();
  selectedParticipant = signal<Participant | null>(null);

  selectParticipant(participant: Participant) {
    this.participantSelected.emit(participant);
    this.selectedParticipant.set(participant);
  }
}
