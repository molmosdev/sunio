import { Component, inject, TemplateRef } from '@angular/core';
import { Button, TranslatePipe } from '@basis-ng/primitives';
import { State } from '../../../../core/services/state';
import { TitleChanger } from './shared/components/title-changer/title-changer';

@Component({
  selector: 's-settings',
  imports: [Button, TitleChanger, TranslatePipe],
  template: `
    <ng-template #changeNameTpl>
      <s-title-changer />
    </ng-template>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onChangeNameButtonClicked(changeNameTpl)"
    >
      {{ 'event.settings.change-name' | translate }}
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onReloadDataButtonClicked()"
    >
      {{ 'event.settings.reload' | translate }}
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onLogoutButtonClicked()"
    >
      {{ 'event.logout' | translate }}
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
})
export class Settings {
  private _state = inject(State);

  onChangeNameButtonClicked(template: TemplateRef<unknown>) {
    this._state.openDynamicDrawer(template);
  }

  onReloadDataButtonClicked() {
    this._state.reloadAll();
    this._state.closeDynamicDrawer();
  }

  onLogoutButtonClicked() {
    this._state.setLoggedParticipant(null);
    this._state.closeDynamicDrawer();
  }
}
