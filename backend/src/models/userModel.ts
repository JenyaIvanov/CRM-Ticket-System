export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  role: "admin" | "user";
  profile_picture?: string; // Adding the new profile_picture field
}
