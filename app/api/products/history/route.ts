import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Warehouse from '@/models/Warehouse';

// GET /api/products/history — so'nggi 30 kunlik harakat tarixi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const from = new Date(Date.now() - 30 * 86400000);

  const [sales, warehouseSent] = await Promise.all([
    Sale.find({ date: { $gte: from }, status: { $ne: 'returned' } })
      .sort({ date: -1 }).lean(),
    Warehouse.find({ status: 'sent_to_shop', sentAt: { $gte: from } })
      .sort({ sentAt: -1 }).lean(),
  ]);

  const movements: { date: string; name: string; type: 'kirim' | 'chiqim'; qty: number; note: string }[] = [];

  // Sotuvlardan — chiqim
  for (const sale of sales) {
    for (const item of sale.items) {
      movements.push({
        date: sale.date as unknown as string,
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
      date: (w.sentAt ?? w.createdAt) as unknown as string,
      name: w.name,
      type: 'kirim',
      qty: w.quantity,
      note: `Ombordan chiqarildi${w.supplierName ? ` (${w.supplierName})` : ''}`,
    });
  }

  movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(movements.slice(0, 200));
}
