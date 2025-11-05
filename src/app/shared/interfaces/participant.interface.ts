export interface IParticipant {
  id: string;
  event_id: string;
  name: string;
  pin?: string | null;
  created_at: string;
  is_admin?: boolean;
  pin_reset_requested?: boolean;
}
