import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import Nasiya from '@/models/Nasiya';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || new Date(Date.now() - 7 * 86400000).toISOString();
  const to = searchParams.get('to') || new Date().toISOString();

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  await connectDB();

  const [sales, expenses, nasiyaList] = await Promise.all([
    Sale.find({ date: { $gte: fromDate, $lte: toDate } }).lean(),
    Expense.find({ date: { $gte: fromDate, $lte: toDate } }).lean(),
    Nasiya.find().lean(),
  ]);

  const sotuv = sales.reduce((s, x) => s + x.total, 0);
  const daromad = sales.reduce((s, x) => s + (x.total - x.totalCost), 0);
  const xarajatlar = expenses.reduce((s, x) => s + x.amount, 0);
  const sofFoyda = daromad - xarajatlar;

  // Daily chart data — lokal sana ishlatiladi (toISOString UTC shift muammosini oldini olish uchun)
  const localKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const chartData: { date: string; amount: number }[] = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0); // lokal yarim tun

  while (cursor <= toDate) {
    const nextDay = new Date(cursor);
    nextDay.setDate(cursor.getDate() + 1);

    const dayAmount = sales
      .filter((s) => {
        const d = new Date(s.date);
        return d >= cursor && d < nextDay;
      })
      .reduce((sum, s) => sum + s.total, 0);

    chartData.push({
      date: new Date(localKey(cursor) + 'T12:00:00').toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
      amount: dayAmount,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // Top 10 products
  const prodMap: Record<string, { name: string; qty: number; total: number }> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item: any) => {
      if (!prodMap[item.productName]) {
        prodMap[item.productName] = { name: item.productName, qty: 0, total: 0 };
      }
      prodMap[item.productName].qty += item.quantity;
      prodMap[item.productName].total += item.quantity * item.sellPrice;
    });
  });
  const topProducts = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Nasiya summary
  const nasiyaStats = {
    total: nasiyaList.length,
    paid: nasiyaList.filter((n) => n.status === 'paid').length,
    open: nasiyaList.filter((n) => n.status === 'open').length,
    overdue: nasiyaList.filter((n) => n.status === 'overdue').length,
  };

  return NextResponse.json({ sotuv, daromad, xarajatlar, sofFoyda, chartData, topProducts, nasiyaStats });
}
