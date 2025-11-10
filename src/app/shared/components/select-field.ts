import { Component, input, model, output } from '@angular/core';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  Option,
  ConnectedOverlay,
  OverlayOrigin,
} from '@basis-ng/primitives';

@Component({
  selector: 's-select-field',
  imports: [
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    Option,
    ConnectedOverlay,
    OverlayOrigin,
  ],
  template: `
    <b-select [(value)]="value" [displayWith]="displayFn" (valueChange)="valueChanged.emit($event)">
      <button
        b-select-trigger
        bOverlayOrigin
        #trigger="bOverlayOrigin"
        class="b-size-lg b-rounded-full"
      >
        <b-select-value [placeholder]="placeholder()" />
      </button>
      <ng-template
        bConnectedOverlay
        [trigger]="trigger"
        [positions]="['bottom-left', 'bottom-right', 'top-left', 'top-right']"
      >
        <ul b-select-content class="b-size-lg" [multiple]="multiple()">
          @for (option of options(); track option) {
            <li b-option [value]="option.value">{{ option.label }}</li>
          }
        </ul>
      </ng-template>
    </b-select>
  `,
  host: {
    class: 'w-full',
  },
})
export class SelectField {
  value = model<string[]>([]);
  placeholder = input<string>('');
  multiple = input<boolean>(false);
  readonly options = input<{ value: string; label: string }[]>([]);
  displayFn = (value: string[]) => {
    return value
      ? this.options()
          .filter((option) => value.includes(option.value))
          .map((option) => option.label)
          .join(', ')
      : '';
  };
  valueChanged = output<string[]>();
}
