export interface Comment {
  id?: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  date_created?: Date;
}
