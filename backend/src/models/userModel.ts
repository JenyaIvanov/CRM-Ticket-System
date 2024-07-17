export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  role: "admin" | "user";
}
