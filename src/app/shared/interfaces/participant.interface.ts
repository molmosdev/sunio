export interface Participant {
  id: string;
  event_id: string;
  name: string;
  pin?: string | null;
  created_at: string;
}
