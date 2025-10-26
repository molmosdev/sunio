import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Settlement } from '../../shared/interfaces/balance.interface';
import { Event } from '../../shared/interfaces/event.interface';
import { Expense } from '../../shared/interfaces/expense.interface';
import { Participant } from '../../shared/interfaces/participant.interface';
import { Balance } from '../../shared/types/balance.type';

@Injectable({
  providedIn: 'root',
})
export class ApiEvents {
  private apiUrl = environment.apiUrl + '/events';
  private http = inject(HttpClient);

  createEvent(data: { name: string; participants: string[] }): Promise<{ eventId: string }> {
    return firstValueFrom(this.http.post<{ eventId: string }>(this.apiUrl, data));
  }

  getEvent(eventId: string): Promise<Event> {
    return firstValueFrom(this.http.get<Event>(`${this.apiUrl}/${eventId}`));
  }

  updateEvent(eventId: string, data: { name: string }): Promise<Event> {
    return firstValueFrom(this.http.put<Event>(`${this.apiUrl}/${eventId}`, data));
  }

  getParticipants(eventId: string): Promise<Participant[]> {
    return firstValueFrom(this.http.get<Participant[]>(`${this.apiUrl}/${eventId}/participants`));
  }

  createParticipant(eventId: string, data: { name: string }): Promise<Participant> {
    return firstValueFrom(
      this.http.post<Participant>(`${this.apiUrl}/${eventId}/participants`, data),
    );
  }

  updateParticipant(
    eventId: string,
    participantId: string,
    data: { name: string },
  ): Promise<Participant> {
    return firstValueFrom(
      this.http.put<Participant>(`${this.apiUrl}/${eventId}/participants/${participantId}`, data),
    );
  }

  setParticipantPin(
    eventId: string,
    participantId: string,
    data: { pin: string },
  ): Promise<Participant> {
    return firstValueFrom(
      this.http.post<Participant>(
        `${this.apiUrl}/${eventId}/participants/${participantId}/pin`,
        data,
      ),
    );
  }

  loginParticipant(
    eventId: string,
    participantId: string,
    data: { pin: string },
  ): Promise<{ success: boolean; participantId: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; participantId: string }>(
        `${this.apiUrl}/${eventId}/participants/${participantId}/login`,
        data,
      ),
    );
  }

  deleteParticipant(eventId: string, participantId: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(
        `${this.apiUrl}/${eventId}/participants/${participantId}`,
      ),
    );
  }

  getExpenses(eventId: string): Promise<Expense[]> {
    return firstValueFrom(this.http.get<Expense[]>(`${this.apiUrl}/${eventId}/expenses`));
  }

  createExpense(
    eventId: string,
    data: {
      payer_id: string;
      amount: number;
      consumers: string[];
      description?: string;
    },
  ): Promise<Expense> {
    return firstValueFrom(this.http.post<Expense>(`${this.apiUrl}/${eventId}/expenses`, data));
  }

  updateExpense(
    eventId: string,
    expenseId: string,
    data: {
      amount: number;
      consumers: string[];
      description?: string;
    },
  ): Promise<Expense> {
    return firstValueFrom(
      this.http.put<Expense>(`${this.apiUrl}/${eventId}/expenses/${expenseId}`, data),
    );
  }

  deleteExpense(eventId: string, expenseId: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.apiUrl}/${eventId}/expenses/${expenseId}`),
    );
  }

  getBalances(eventId: string): Promise<{ balances: Balance }> {
    return firstValueFrom(
      this.http.get<{ balances: Balance }>(`${this.apiUrl}/${eventId}/balances`),
    );
  }

  calculateSettlements(eventId: string): Promise<{ balances: Balance; settlements: Settlement[] }> {
    return firstValueFrom(
      this.http.post<{ balances: Balance; settlements: Settlement[] }>(
        `${this.apiUrl}/${eventId}/settle`,
        {},
      ),
    );
  }

  cleanupOldEvents(): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${environment.apiUrl}/events/cleanup`),
    );
  }
}
