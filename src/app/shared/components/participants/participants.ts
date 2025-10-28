import { Component, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash } from '@ng-icons/lucide';
import { Button } from '@basis-ng/primitives';
import { IParticipant } from '../../interfaces/participant.interface';

@Component({
  selector: 's-participants',
  imports: [NgIcon, Button],
  template: `
    @for (participant of participants(); track participant.name) {
      <div class="flex flex-col gap-1 items-center">
        <div class="relative">
          <div
            (click)="selectParticipant(participant)"
            (blur)="unselectOnOutsideClick() ? selected.set(null) : null"
            tabindex="0"
            class="w-14 h-14 rounded-full flex items-center justify-center text-xl inset-ring-1 inset-ring-ring dark:inset-ring-ring-dark cursor-pointer"
            [class.inset-ring-3]="selected() && selected()!.id === participant.id"
          >
            {{ participant.name.slice(0, 2).toUpperCase() }}
          </div>
          @if (removable() && selected() && selected()!.id === participant.id) {
            <button
              b-button
              class="absolute -top-2 -right-2 b-size-sm b-squared b-variant-secondary b-rounded-full cursor-pointer"
              (mousedown)="$event.preventDefault()"
              (click)="removeParticipant()"
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
  participants = input<IParticipant[]>();
  selected = model<IParticipant | null>(null);
  removable = input<boolean>(false);
  participantRemoved = output<void>();
  participantSelected = output<void>();
  unselectOnOutsideClick = input<boolean>(false);

  selectParticipant(participant: IParticipant) {
    this.selected.set(participant);
    console.log('selected participant:', participant);
    this.participantSelected.emit();
  }

  removeParticipant() {
    this.participantRemoved.emit();
    this.selected.set(null);
  }

  test1() {
    console.log('focused');
  }

  test() {
    console.log('blurred');
  }
}
