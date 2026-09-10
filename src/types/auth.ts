import type { Role } from "../generated/prisma/client.js";

export interface JwtPayload {
  userId: number;
  role: Role;
}
