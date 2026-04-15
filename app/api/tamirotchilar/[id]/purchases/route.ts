import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const purchases = await prisma.purchase.findMany({
    where: { supplierId: id },
    orderBy: { date: 'desc' },
    take: 20,
  });

  return NextResponse.json(purchases.map(p => ({ ...p, _id: p.id })));
}
