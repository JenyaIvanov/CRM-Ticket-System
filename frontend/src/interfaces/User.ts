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
