import { Injectable, signal } from '@angular/core';
import { IParticipant } from '../../shared/interfaces/participant.interface';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  loggedParticipant = signal<IParticipant | null>(null);

  setLoggedParticipant(participant: IParticipant | null): void {
    this.loggedParticipant.set(participant);
  }
}
