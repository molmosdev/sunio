export interface Expense {
  id: string;
  event_id: string;
  payer_id: string;
  amount: number;
  consumers: string[];
  description?: string | null;
  created_at: string;
}
