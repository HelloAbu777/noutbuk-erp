import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [products, sales, customers, nasiya, expenses, purchases, suppliers, warehouse, settings] =
    await Promise.all([
      prisma.product.findMany(),
      prisma.sale.findMany({ include: { items: true } }),
      prisma.customer.findMany(),
      prisma.nasiya.findMany(),
      prisma.expense.findMany(),
      prisma.purchase.findMany(),
      prisma.supplier.findMany(),
      prisma.warehouse.findMany(),
      prisma.settings.findFirst(),
    ]);

  const data = {
    products, sales, customers, nasiya, expenses,
    purchases, suppliers, warehouse, settings,
    exportDate: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="erp-zaxira-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Zaxirani tiklash PostgreSQL da to'g'ridan-to'g'ri ishlamaydi (ID konflikti)
  // Faqat eksport qo'llab-quvvatlanadi
  return NextResponse.json({ error: "Zaxirani tiklash hozircha qo'llab-quvvatlanmaydi" }, { status: 501 });
}
