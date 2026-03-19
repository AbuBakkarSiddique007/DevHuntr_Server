import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { envVars } from "../config/env";

const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };