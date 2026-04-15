import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const [sales, weekSales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: sevenDaysAgo } },
      include: { items: true },
    }),
    prisma.sale.findMany({
      where: { date: { gte: weekStart } },
      include: { items: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: weekStart } },
    }),
  ]);

  const sotuv = sales.reduce((sum, s) => sum + s.total, 0);
  const daromad = sales.reduce((sum, s) => sum + (s.total - s.totalCost), 0);
  const xarajatlar = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sofFoyda = daromad - xarajatlar;

  // 7 kunlik grafik
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const dayAmount = sales
      .filter((s) => {
        const d = new Date(s.date);
        return d >= day && d < nextDay;
      })
      .reduce((sum, s) => sum + s.total, 0);

    chartData.push({
      date: day.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
      amount: dayAmount,
    });
  }

  // Top 10 mahsulot (bu hafta)
  const productMap: Record<
    string,
    { name: string; quantity: number; sellPrice: number; total: number }
  > = {};

  weekSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productMap[item.productName]) {
        productMap[item.productName] = {
          name: item.productName,
          quantity: 0,
          sellPrice: item.sellPrice,
          total: 0,
        };
      }
      productMap[item.productName].quantity += item.quantity;
      productMap[item.productName].total += item.quantity * item.sellPrice;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return NextResponse.json({
    sotuv,
    daromad,
    xarajatlar,
    sofFoyda,
    chartData,
    topProducts,
  });
}
