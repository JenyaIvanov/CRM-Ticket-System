export interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  date_created: string;
  created_by: string;
  assigned_to: string;
  description: string;
}

export interface TicketWithCommentsCount extends Ticket {
  comments_count: number;
}
