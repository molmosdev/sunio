import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ISettlement } from '../../shared/interfaces/settlement.interface';
import { IEvent } from '../../shared/interfaces/event.interface';
import { Expense } from '../../shared/interfaces/expense.interface';
import { IParticipant } from '../../shared/interfaces/participant.interface';
import { TBalance } from '../../shared/types/balance.type';
import { IRecentEvent } from '../../shared/interfaces/recent-event.interface';
import { Payment } from '../../shared/interfaces/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiEvents {
  private apiUrl = environment.apiUrl + '/events';
  private http = inject(HttpClient);

  getRecentEvents(): Promise<{ recentEvents: IRecentEvent[] }> {
    return firstValueFrom(
      this.http.get<{ recentEvents: IRecentEvent[] }>(`${this.apiUrl}/recent`, {
        withCredentials: true,
      }),
    );
  }

  deleteRecentEvent(eventId: string): Promise<{ recentEvents: IRecentEvent[] }> {
    return firstValueFrom(
      this.http.delete<{ recentEvents: IRecentEvent[] }>(`${this.apiUrl}/recent/${eventId}`, {
        withCredentials: true,
      }),
    );
  }

  createEvent(data: { name: string; participants: string[] }): Promise<{ eventId: string }> {
    return firstValueFrom(this.http.post<{ eventId: string }>(this.apiUrl, data));
  }

  getEvent(eventId: string): Promise<IEvent> {
    return firstValueFrom(
      this.http.get<IEvent>(`${this.apiUrl}/${eventId}`, { withCredentials: true }),
    );
  }

  updateEvent(eventId: string, name: string): Promise<IEvent> {
    return firstValueFrom(this.http.put<IEvent>(`${this.apiUrl}/${eventId}`, { name }));
  }

  getParticipants(eventId: string): Promise<IParticipant[]> {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.apiUrl}/${eventId}/participants`));
  }

  createParticipant(eventId: string, data: { name: string }): Promise<IParticipant> {
    return firstValueFrom(
      this.http.post<IParticipant>(`${this.apiUrl}/${eventId}/participants`, data),
    );
  }

  updateParticipant(
    eventId: string,
    participantId: string,
    data: { name: string },
  ): Promise<IParticipant> {
    return firstValueFrom(
      this.http.put<IParticipant>(`${this.apiUrl}/${eventId}/participants/${participantId}`, data),
    );
  }

  setParticipantPin(
    eventId: string,
    participantId: string,
    data: { pin: string },
  ): Promise<IParticipant> {
    return firstValueFrom(
      this.http.post<IParticipant>(
        `${this.apiUrl}/${eventId}/participants/${participantId}/pin`,
        data,
      ),
    );
  }

  loginParticipant(
    eventId: string,
    participantId: string,
    pin: string,
  ): Promise<{ success: boolean; participantId: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; participantId: string }>(
        `${this.apiUrl}/${eventId}/participants/${participantId}/login`,
        { pin },
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
      payer_id: string;
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

  getBalances(eventId: string): Promise<{ balances: TBalance }> {
    return firstValueFrom(
      this.http.get<{ balances: TBalance }>(`${this.apiUrl}/${eventId}/balances`),
    );
  }

  calculateSettlements(eventId: string): Promise<{ settlements: ISettlement[] }> {
    return firstValueFrom(
      this.http.get<{ settlements: ISettlement[] }>(`${this.apiUrl}/${eventId}/settlements`),
    );
  }

  cleanupOldEvents(): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${environment.apiUrl}/events/cleanup`),
    );
  }

  createPayment(
    eventId: string,
    data: { from_participant: string; to_participant: string; amount: number },
  ): Promise<Payment> {
    return firstValueFrom(this.http.post<Payment>(`${this.apiUrl}/${eventId}/payments`, data));
  }

  getPayments(eventId: string): Promise<Payment[]> {
    return firstValueFrom(this.http.get<Payment[]>(`${this.apiUrl}/${eventId}/payments`));
  }

  deletePayment(eventId: string, paymentId: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(`${this.apiUrl}/${eventId}/payments/${paymentId}`),
    );
  }
}
