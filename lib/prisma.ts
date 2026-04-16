import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:12345@localhost:5432/qaqnus?schema=public';

// Pool'ni global saqlash — hot reload va serverless uchun
if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 3 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

const adapter = new PrismaPg(global.pgPool);

const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
