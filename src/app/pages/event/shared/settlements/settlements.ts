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
    @for (s of data(); track s.from + '-' + s.to) {
      <div class="flex flex-col items-center gap-0.5">
        {{ participantMap()[s.from] }} {{ mustText() }} {{ participantMap()[s.to] }}
        <strong>{{ s.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</strong>
      </div>
    }
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
