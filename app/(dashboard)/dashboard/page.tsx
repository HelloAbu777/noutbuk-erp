import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import Header from '@/components/Header';
import StatsCard from '@/components/dashboard/StatsCard';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import { TrendingUp, DollarSign, Receipt, PiggyBank } from 'lucide-react';

async function getDashboardData() {
  await connectDB();

  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const [sales, weekSales, expenses] = await Promise.all([
    Sale.find({ date: { $gte: sevenDaysAgo } }).lean(),
    Sale.find({ date: { $gte: weekStart } }).lean(),
    Expense.find({ date: { $gte: weekStart } }).lean(),
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
      date: day.toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric',
      }),
      amount: dayAmount,
    });
  }

  // Top 10 mahsulot
  const productMap: Record<
    string,
    { name: string; quantity: number; sellPrice: number; total: number }
  > = {};

  weekSales.forEach((sale) => {
    sale.items.forEach((item: any) => {
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

  return { sotuv, daromad, xarajatlar, sofFoyda, chartData, topProducts };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { sotuv, daromad, xarajatlar, sofFoyda, chartData, topProducts } =
    await getDashboardData();

  return (
    <>
      <Header title="Bosh sahifa" />
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-6">
          {/* Stats kartochkalari */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Sotuv (so'nggi 7 kun)"
              value={sotuv}
              color="blue"
              icon={<TrendingUp size={18} />}
            />
            <StatsCard
              title="Daromad"
              value={daromad}
              color="green"
              icon={<DollarSign size={18} />}
            />
            <StatsCard
              title="Xarajatlar (bu hafta)"
              value={xarajatlar}
              color="red"
              icon={<Receipt size={18} />}
            />
            <StatsCard
              title="Sof foyda"
              value={sofFoyda}
              color={sofFoyda >= 0 ? 'green' : 'red'}
              icon={<PiggyBank size={18} />}
            />
          </div>

          {/* Grafik */}
          <div className="mb-6">
            <SalesChart data={chartData} />
          </div>

          {/* Top mahsulotlar */}
          <TopProducts products={topProducts} />
        </div>
      </div>
    </>
  );
}
