import { Component, inject, TemplateRef } from '@angular/core';
import { Button } from '@basis-ng/primitives';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucidePencilLine, lucideRefreshCcw } from '@ng-icons/lucide';
import { State } from '../../../../core/services/state';
import { TitleChanger } from './shared/components/title-changer/title-changer';

@Component({
  selector: 's-settings',
  imports: [Button, NgIcon, TitleChanger],
  template: `
    <ng-template #changeNameTpl>
      <s-title-changer />
    </ng-template>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onChangeNameButtonClicked(changeNameTpl)"
    >
      <ng-icon name="lucidePencilLine" size="18" color="currentColor" />
      Cambiar nombre al Sunio
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onReloadDataButtonClicked()"
    >
      <ng-icon name="lucideRefreshCcw" size="18" color="currentColor" />
      Recargar datos
    </button>
    <button
      b-button
      class="b-size-lg b-variant-secondary b-rounded-full"
      (click)="onLogoutButtonClicked()"
    >
      <ng-icon name="lucideLogOut" size="18" color="currentColor" />
      Cerrar sesión
    </button>
  `,
  providers: [
    provideIcons({
      lucidePencilLine,
      lucideRefreshCcw,
      lucideLogOut,
    }),
  ],
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
