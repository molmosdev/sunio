import { inject, Injectable, resource, signal } from '@angular/core';
import { ApiEvents } from './api-events';

@Injectable({
  providedIn: 'root',
})
export class EventState {
  private _apiEvents = inject(ApiEvents);

  id = signal('');

  data = resource({
    params: () => ({ id: this.id() }),
    loader: async ({ params }) => {
      if (!params?.id) return undefined;
      return await this._apiEvents.getEvent(params.id);
    },
  });

  setId(id: string): void {
    this.id.set(id);
  }
}
