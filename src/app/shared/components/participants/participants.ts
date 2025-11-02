import { Component, input, model, output, computed } from '@angular/core';
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
            (blur)="unselectOnOutsideClick() ? selected.set([]) : null"
            tabindex="0"
            class="w-14 h-14 rounded-full flex items-center justify-center text-xl bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-xs cursor-pointer"
            [class.bg-ring]="selectedMap()[participant.id]"
            [class.dark:bg-ring-dark]="selectedMap()[participant.id]"
          >
            {{ participant.name.slice(0, 2).toUpperCase() }}
          </div>
          @if (removable() && selectedMap()[participant.id]) {
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
    class: 'flex gap-4 mt-2 justify-center flex-wrap w-full max-w-md',
  },
  providers: [provideIcons({ lucideTrash })],
})
export class Participants {
  selectedMap = computed<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of this.selected()) {
      map[p.id] = true;
    }
    return map;
  });
  participants = input<IParticipant[]>();
  selected = model<IParticipant[]>([]);
  removable = input<boolean>(false);
  participantRemoved = output<void>();
  participantSelected = output<void>();
  unselectOnOutsideClick = input<boolean>(false);
  multiple = input<boolean>(false);

  selectParticipant(participant: IParticipant) {
    if (this.multiple()) {
      const current = this.selected();
      const idx = current.findIndex((p) => p.id === participant.id);
      if (idx === -1) {
        // No está seleccionado, lo añadimos
        this.selected.set([...current, participant]);
      } else {
        // Ya está seleccionado, lo quitamos
        this.selected.set(current.filter((p) => p.id !== participant.id));
      }
    } else {
      // Selección simple: solo uno seleccionado
      const current = this.selected();
      if (current.length === 1 && current[0].id === participant.id) {
        this.selected.set([]);
      } else {
        this.selected.set([participant]);
      }
    }
    this.participantSelected.emit();
  }

  removeParticipant() {
    this.participantRemoved.emit();
    this.selected.set([]);
  }
}
