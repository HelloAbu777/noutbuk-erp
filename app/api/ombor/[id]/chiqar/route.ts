import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { quantity } = await req.json();
  
  const item = await prisma.warehouse.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  if (item.status === 'sent_to_shop') {
    return NextResponse.json({ error: "Allaqachon do'konga chiqarilgan" }, { status: 400 });
  }

  const qtyToTransfer = quantity || item.quantity;
  if (qtyToTransfer > item.quantity) {
    return NextResponse.json({ error: 'Yetarli miqdor yo\'q' }, { status: 400 });
  }

  const existing = await prisma.product.findFirst({ where: { name: item.name } });
  
  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        quantity: { increment: qtyToTransfer },
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
      },
    });
  } else {
    await prisma.product.create({
      data: {
        name: item.name,
        category: item.category,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        quantity: qtyToTransfer,
        barcode: item.barcode,
        description: item.description,
        status: 'active',
      },
    });
  }

  if (qtyToTransfer === item.quantity) {
    await prisma.warehouse.update({
      where: { id },
      data: { status: 'sent_to_shop', sentAt: new Date() },
    });
  } else {
    await prisma.warehouse.update({
      where: { id },
      data: { quantity: { decrement: qtyToTransfer } },
    });
  }

  return NextResponse.json({ success: true });
}
