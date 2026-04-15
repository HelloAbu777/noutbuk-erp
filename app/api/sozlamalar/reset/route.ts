import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await Promise.all([
      prisma.saleItem.deleteMany({}),
      prisma.paymentRecord.deleteMany({}),
      prisma.orderItem.deleteMany({}),
    ]);

    await Promise.all([
      prisma.sale.deleteMany({}),
      prisma.purchase.deleteMany({}),
      prisma.expense.deleteMany({}),
      prisma.nasiya.deleteMany({}),
      prisma.order.deleteMany({}),
      prisma.message.deleteMany({}),
      prisma.warehouse.deleteMany({}),
      prisma.product.updateMany({ data: { quantity: 0 } }),
      prisma.customer.updateMany({ data: { debt: 0 } }),
    ]);

    return NextResponse.json({ success: true, message: "Barcha kirim-chiqim ma'lumotlari tozalandi" });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
