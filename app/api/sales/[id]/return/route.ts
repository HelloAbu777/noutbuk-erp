import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!sale) return NextResponse.json({ error: 'Sotuv topilmadi' }, { status: 404 });
  if (sale.status === 'returned') return NextResponse.json({ error: 'Bu sotuv allaqachon qaytarilgan' }, { status: 400 });

  // Mahsulot miqdorini tiklash
  for (const item of sale.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { quantity: { increment: item.quantity } },
    });
  }

  // Nasiya bo'lsa — qarzni kamaytirish va nasiya holatini yangilash
  if (sale.paymentType === 'nasiya' && sale.customerId) {
    await prisma.customer.update({
      where: { id: sale.customerId },
      data: { debt: { decrement: sale.total } },
    });
    const nasiya = await prisma.nasiya.findFirst({ where: { saleId: sale.id } });
    if (nasiya) {
      await prisma.nasiya.update({
        where: { id: nasiya.id },
        data: { status: 'paid', paidAmount: sale.total, remainingAmount: 0 },
      });
    }
  }

  await prisma.sale.update({
    where: { id },
    data: { status: 'returned', returnedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
