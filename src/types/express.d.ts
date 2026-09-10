import type { Role } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: Role;
    }
  }
}

export {};
