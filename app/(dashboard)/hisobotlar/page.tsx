'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { TrendingUp, DollarSign, Receipt, PiggyBank, CreditCard } from 'lucide-react';

const HisobotChart = dynamic(() => import('@/components/HisobotChart'), { ssr: false });

interface Stats {
  sotuv: number; daromad: number; xarajatlar: number; sofFoyda: number;
  chartData: { date: string; amount: number }[];
  topProducts: { name: string; qty: number; total: number }[];
  nasiyaStats: { total: number; paid: number; open: number; overdue: number };
}

type Range = 'bugun' | 'hafta' | 'oy' | 'custom';

function fmt(n: number) { return new Intl.NumberFormat('uz-UZ').format(n) + " so'm"; }

const STAT_CARDS = [
  { key: 'sotuv', title: 'Jami sotuv', color: 'blue', icon: TrendingUp },
  { key: 'daromad', title: 'Daromad', color: 'green', icon: DollarSign },
  { key: 'xarajatlar', title: 'Xarajatlar', color: 'red', icon: Receipt },
  { key: 'sofFoyda', title: 'Sof foyda', color: 'auto', icon: PiggyBank },
] as const;

export default function HisobotlarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [range, setRange] = useState<Range>('hafta');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const load = async () => {
    setLoading(true);
    const now = new Date();

    let from: Date;
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);

    if (range === 'bugun') {
      from = new Date(now); from.setHours(0, 0, 0, 0);
    } else if (range === 'hafta') {
      from = new Date(now); from.setDate(now.getDate() - 6); from.setHours(0, 0, 0, 0);
    } else if (range === 'oy') {
      from = new Date(now); from.setDate(now.getDate() - 29); from.setHours(0, 0, 0, 0);
    } else {
      if (!customFrom || !customTo) { setLoading(false); return; }
      from = new Date(customFrom);
      to.setTime(new Date(customTo).getTime());
      to.setHours(23, 59, 59, 999);
    }

    const res = await fetch(`/api/hisobotlar?from=${from.toISOString()}&to=${to.toISOString()}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => { if (status === 'authenticated') load(); }, [range, status]);

  const handleCustomSearch = () => { if (customFrom && customTo) load(); };

  const sofFoydaColor = stats && stats.sofFoyda >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  const sofFoydaBg = stats && stats.sofFoyda >= 0 ? 'bg-green-50 dark:bg-green-500/10 text-green-500 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400';

  return (
    <>
      <Header title="Hisobotlar" />
      <div className="pt-14 min-h-screen">
        <div className="p-6">
          {/* Range tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start">
              {[['bugun', 'Bugun'], ['hafta', '1 Hafta'], ['oy', '1 Oy'], ['custom', 'Maxsus']].map(([v, l]) => (
                <button key={v} onClick={() => setRange(v as Range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
            {range === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                <span className="text-gray-400 text-sm">—</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                <button onClick={handleCustomSearch}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Ko'rish
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">Yuklanmoqda...</div>
          ) : stats ? (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {STAT_CARDS.map(({ key, title, color, icon: Icon }) => {
                  const val = stats[key as keyof typeof stats] as number;
                  const isSof = key === 'sofFoyda';
                  const bg = isSof ? sofFoydaBg : `bg-${color}-50 dark:bg-${color}-500/10 text-${color}-500 dark:text-${color}-400`;
                  const textColor = isSof ? sofFoydaColor : `text-${color}-600 dark:text-${color}-400`;
                  return (
                    <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                          <Icon size={18} />
                        </div>
                      </div>
                      <p className={`text-xl font-bold ${textColor}`}>{fmt(val)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Sotuv grafigi</h2>
                <HisobotChart data={stats.chartData} />
              </div>

              {/* Top products */}
              {stats.topProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 10 mahsulot</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          {["№", "Mahsulot nomi", "Soni", "Jami summa"].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topProducts.map((p, i) => (
                          <tr key={p.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.qty} ta</td>
                            <td className="px-4 py-3 font-medium text-blue-600">{fmt(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Nasiya stats */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={18} className="text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nasiya holati</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Jami nasiya', value: stats.nasiyaStats.total, color: 'text-gray-900 dark:text-white' },
                    { label: "To'langan", value: stats.nasiyaStats.paid, color: 'text-green-600' },
                    { label: 'Ochiq', value: stats.nasiyaStats.open, color: 'text-amber-500' },
                    { label: "Muddati o'tgan", value: stats.nasiyaStats.overdue, color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
