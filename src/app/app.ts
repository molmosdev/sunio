import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 's-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  host: {
    class: 'h-dvh flex flex-col p-6',
  },
})
export class App {}
