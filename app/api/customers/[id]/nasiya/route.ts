import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const nasiyas = await prisma.nasiya.findMany({
    where: { customerId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { payments: true },
  });

  return NextResponse.json(nasiyas.map(n => ({ ...n, _id: n.id })));
}
