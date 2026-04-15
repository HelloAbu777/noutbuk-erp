import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  if (action === 'accept') {
    await prisma.order.update({ where: { id }, data: { status: 'accepted' } });
  } else if (action === 'reject') {
    await prisma.order.update({ where: { id }, data: { status: 'rejected' } });
  } else {
    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
