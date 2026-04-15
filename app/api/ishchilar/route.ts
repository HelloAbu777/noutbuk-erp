import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workers = await prisma.worker.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(workers.map(w => ({ ...w, _id: w.id })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, phone, position, salary, status } = body;

  const worker = await prisma.worker.create({
    data: { name, phone, position, salary: Number(salary), status: status || 'active' },
  });
  return NextResponse.json({ ...worker, _id: worker.id }, { status: 201 });
}
