import { Component, computed, input } from '@angular/core';
import { ISettlement } from '../../../../shared/interfaces/settlement.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { CurrencyPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';

@Component({
  selector: 's-settlements',
  imports: [CurrencyPipe, NgIcon],
  template: `
    @for (s of data(); track s.from + '-' + s.to) {
      <div class="flex flex-col items-center gap-1">
        {{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
        <div class="flex gap-1 items-center">
          {{ participantMap()[s.from] }}
          <ng-icon name="lucideArrowRight" size="16" color="currentColor" />
          {{ participantMap()[s.to] }}:
        </div>
      </div>
    }
  `,
  providers: [provideIcons({ lucideArrowRight })],
  host: {
    class: 'flex flex-col gap-4 items-center justify-center',
  },
})
export class Settlements {
  data = input<ISettlement[]>();
  participants = input<IParticipant[]>();
  participantMap = computed(() => {
    const map: Record<string, string> = {};
    for (const p of this.participants() || []) {
      map[p.id] = p.name;
    }
    return map;
  });
}
