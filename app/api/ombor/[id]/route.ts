import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  
  const item = await prisma.warehouse.update({
    where: { id },
    data: body,
  }).catch(() => null);
  
  if (!item) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  const transformed = { ...item, _id: item.id };
  return NextResponse.json(transformed);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.warehouse.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
