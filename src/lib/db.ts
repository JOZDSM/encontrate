import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  pool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith("prisma+")) {
    throw new Error(
      'Configure DATABASE_URL with a postgresql:// connection string (Neon, local Postgres, etc.). Prisma "prisma+..." URLs require the Prisma Postgres dev server.',
    );
  }
  const pool = globalForPrisma.pool ?? new Pool({ connectionString: url });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;
  // @prisma/adapter-pg bundles its own @types/pg; root @types/pg can disagree on minor versions.
  const adapter = new PrismaPg(
    pool as unknown as ConstructorParameters<typeof PrismaPg>[0],
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
