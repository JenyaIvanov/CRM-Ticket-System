export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created_by: number;
  assigned_to?: number;
  date_created?: Date;
}
