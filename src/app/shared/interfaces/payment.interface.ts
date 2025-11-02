export interface Payment {
  id: string;
  event_id: string;
  from_participant: string;
  to_participant: string;
  amount: number;
  created_at: string;
}
