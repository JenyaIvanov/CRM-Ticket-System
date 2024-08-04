export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_picture: string;
}

export interface UserWithTicketCount extends User {
  tickets_count: number;
}

export interface UserWithTickets extends User {
  tickets_count: number;
  tickets: [];
}
