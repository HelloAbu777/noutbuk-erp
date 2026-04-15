import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

// Create PostgreSQL connection pool
const connectionString = 'postgresql://postgres:12345@localhost:5432/qaqnus?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
