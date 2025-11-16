import { Component, inject, TemplateRef } from '@angular/core';
import { Button } from '@basis-ng/primitives';
import { State } from '../../../../core/services/state';
import { TitleChanger } from './shared/components/title-changer/title-changer';

@Component({
  selector: 's-settings',
  imports: [Button, TitleChanger],
  template: `
    <ng-template #changeNameTpl>
      <s-title-changer />
    </ng-template>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onChangeNameButtonClicked(changeNameTpl)"
    >
      Cambiar nombre al Sunio
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onReloadDataButtonClicked()"
    >
      Recargar datos
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onLogoutButtonClicked()"
    >
      Cerrar sesión
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
