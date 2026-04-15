import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const sales = await prisma.sale.findMany({
    where: { customerId: id, status: 'active' },
    orderBy: { date: 'desc' },
    take: 20,
    include: { items: true },
  });

  return NextResponse.json(sales.map(s => ({ ...s, _id: s.id })));
}
