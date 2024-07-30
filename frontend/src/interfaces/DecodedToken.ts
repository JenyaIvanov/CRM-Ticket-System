export interface DecodedToken {
  exp: number;
  username: string;
  userId: number;
  [key: string]: any;
}
