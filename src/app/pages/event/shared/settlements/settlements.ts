import { Component, computed, inject, input } from '@angular/core';
import { ISettlement } from '../../../../shared/interfaces/settlement.interface';
import { IParticipant } from '../../../../shared/interfaces/participant.interface';
import { CurrencyPipe } from '@angular/common';
import { TranslationManager } from '@basis-ng/primitives';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';

@Component({
  selector: 's-settlements',
  imports: [CurrencyPipe],
  template: `
    <div class="flex flex-col gap-3 w-full">
      @for (s of data(); track s.from + '-' + s.to) {
        <div
          class="w-full py-3 px-4 rounded-lg flex justify-between gap-4 bg-primary/5 dark:bg-primary-dark/5 inset-ring-1 inset-ring-primary/10 dark:inset-ring-primary-dark/10 shadow-xs"
        >
          <div class="flex flex-col gap-0.5">
            <span>
              {{ participantMap()[s.from] }}
              {{ mustText() }}
              <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
              {{ participantMap()[s.to] }}
            </span>
          </div>
        </div>
      }
    </div>
  `,
  providers: [provideIcons({ lucideArrowRight })],
  host: {
    class: 'flex flex-col gap-2 items-center justify-center',
  },
})
export class Settlements {
  data = input<ISettlement[]>();
  participants = input<IParticipant[]>();
  private _translationManager = inject<TranslationManager>(TranslationManager);
  participantMap = computed(() => {
    const map: Record<string, string> = {};
    for (const p of this.participants() || []) {
      map[p.id] = p.name;
    }
    return map;
  });

  mustText() {
    return this._translationManager.translate('event.settlements.must');
  }
}
