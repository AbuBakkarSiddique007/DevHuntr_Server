import type { Role } from "../../generated/prisma/enums";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}
