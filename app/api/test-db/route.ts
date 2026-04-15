import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Faqat admin tekshira oladi' }, { status: 401 });
  }

  try {
    const [products, customers, sales, nasiya, expenses, suppliers, warehouse, workers, users] =
      await Promise.all([
        prisma.product.count(),
        prisma.customer.count(),
        prisma.sale.count(),
        prisma.nasiya.count(),
        prisma.expense.count(),
        prisma.supplier.count(),
        prisma.warehouse.count(),
        prisma.worker.count(),
        prisma.user.count(),
      ]);

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL (Prisma) ishlayapti!',
      tables: { products, customers, sales, nasiya, expenses, suppliers, warehouse, workers, users },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'PostgreSQL ulanish muammosi',
    }, { status: 500 });
  }
}
