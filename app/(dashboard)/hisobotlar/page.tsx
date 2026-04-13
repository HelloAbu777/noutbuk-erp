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
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Range tabs */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 self-start">
              {[['bugun', 'Bugun'], ['hafta', '1 Hafta'], ['oy', '1 Oy'], ['custom', 'Maxsus']].map(([v, l]) => (
                <button key={v} onClick={() => setRange(v as Range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
            {range === 'custom' && (
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                <span className="text-gray-400 text-sm">—</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                <button onClick={handleCustomSearch}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium whitespace-nowrap">
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
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                {STAT_CARDS.map(({ key, title, color, icon: Icon }) => {
                  const val = stats[key as keyof typeof stats] as number;
                  const isSof = key === 'sofFoyda';
                  const bg = isSof ? sofFoydaBg : `bg-${color}-50 dark:bg-${color}-500/10 text-${color}-500 dark:text-${color}-400`;
                  const textColor = isSof ? sofFoydaColor : `text-${color}-600 dark:text-${color}-400`;
                  return (
                    <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">{title}</span>
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <p className={`text-base sm:text-xl font-bold ${textColor} leading-tight`}>{fmt(val)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 sm:mb-5">Sotuv grafigi</h2>
                <HisobotChart data={stats.chartData} />
              </div>

              {/* Top products */}
              {stats.topProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 10 mahsulot</h2>
                  </div>

                  {/* Mobile: card list */}
                  <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.qty} ta</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap flex-shrink-0">
                          {fmt(p.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          {["№", "Mahsulot nomi", "Soni", "Jami summa"].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topProducts.map((p, i) => (
                          <tr key={p.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{p.qty} ta</td>
                            <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">{fmt(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Nasiya stats */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={18} className="text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nasiya holati</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: 'Jami nasiya', value: stats.nasiyaStats.total, color: 'text-gray-900 dark:text-white' },
                    { label: "To'langan", value: stats.nasiyaStats.paid, color: 'text-green-600' },
                    { label: 'Ochiq', value: stats.nasiyaStats.open, color: 'text-amber-500' },
                    { label: "Muddati o'tgan", value: stats.nasiyaStats.overdue, color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl py-3 px-2">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
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
