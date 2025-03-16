import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      level: number;
      xp: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    level: number;
    xp: number;
    password?: string;
  }
} 