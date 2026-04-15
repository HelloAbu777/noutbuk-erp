import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  
  const product = await prisma.product.update({
    where: { id },
    data: body,
  }).catch(() => null);
  
  if (!product) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  const transformed = { ...product, _id: product.id };
  return NextResponse.json(transformed);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  // Permanently delete from database instead of archiving
  const product = await prisma.product.delete({
    where: { id },
  }).catch(() => null);
  
  if (!product) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  
  return NextResponse.json({ success: true });
}
