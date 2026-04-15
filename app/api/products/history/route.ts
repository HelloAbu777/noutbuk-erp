import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/products/history — so'nggi 30 kunlik harakat tarixi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const from = new Date(Date.now() - 30 * 86400000);

  const [sales, warehouseSent] = await Promise.all([
    prisma.sale.findMany({
      where: {
        date: { gte: from },
        status: { not: 'returned' },
      },
      include: { items: true },
      orderBy: { date: 'desc' },
    }),
    prisma.warehouse.findMany({
      where: {
        status: 'sent_to_shop',
        sentAt: { gte: from },
      },
      orderBy: { sentAt: 'desc' },
    }),
  ]);

  const movements: { date: string; name: string; type: 'kirim' | 'chiqim'; qty: number; note: string }[] = [];

  // Sotuvlardan — chiqim
  for (const sale of sales) {
    for (const item of sale.items) {
      movements.push({
        date: sale.date.toISOString(),
        name: item.productName,
        type: 'chiqim',
        qty: item.quantity,
        note: `Sotuv (${item.sellPrice.toLocaleString('uz-UZ')} so'm)`,
      });
    }
  }

  // Ombordan do'konga — kirim
  for (const w of warehouseSent) {
    movements.push({
      date: (w.sentAt ?? w.createdAt).toISOString(),
      name: w.name,
      type: 'kirim',
      qty: w.quantity,
      note: `Ombordan chiqarildi${w.supplierName ? ` (${w.supplierName})` : ''}`,
    });
  }

  movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(movements.slice(0, 200));
}
