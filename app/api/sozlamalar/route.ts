import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { shopName, address, phone, lowStockThreshold, currency } = body;

  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: { shopName, address, phone, lowStockThreshold: Number(lowStockThreshold) || 5, currency },
    });
  } else {
    settings = await prisma.settings.update({
      where: { id: settings.id },
      data: { shopName, address, phone, lowStockThreshold: Number(lowStockThreshold) || 5, currency },
    });
  }
  return NextResponse.json(settings);
}
