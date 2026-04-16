'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, CheckCircle, XCircle, Clock, ShoppingBag, X } from 'lucide-react';

interface OrderItem { productId: string; name: string; quantity: number; sellPrice: number; }
interface Order {
  _id: string; yordamchiName: string; customerName: string; customerPhone: string;
  items: OrderItem[]; total: number; status: 'pending' | 'accepted' | 'rejected';
  acceptedByName?: string; rejectedReason?: string; createdAt: string;
}

function RejectModal({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: () => void }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReject = async () => {
    setSaving(true);
    await fetch(`/api/buyurtmalar/${order._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', rejectedReason: reason || "Rad etildi" }),
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Rad etish sababi</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Sabab (ixtiyoriy)"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          <button onClick={handleReject} disabled={saving}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
            {saving ? 'Saqlanmoqda...' : 'Rad etish'}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = { pending: 'Kutilmoqda', accepted: 'Qabul qilindi', rejected: 'Rad etildi' };
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  accepted: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

export default function BuyurtmalarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);


  const load = () => {
    setLoading(true);
    fetch('/api/buyurtmalar').then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const accept = async (id: string) => {
    await fetch(`/api/buyurtmalar/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' }),
    });
    load();
  };

  const filtered = orders.filter(o => {
    const matchFilter = o.status === filter;
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.yordamchiName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });


  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <>
      <Header title="Buyurtmalar" />
      {rejectModal && <RejectModal order={rejectModal} onClose={() => setRejectModal(null)} onSave={() => { setRejectModal(null); load(); }} />}
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Kutilmoqda', count: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: 'Qabul qilindi', count: orders.filter(o => o.status === 'accepted').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
              { label: 'Rad etildi', count: orders.filter(o => o.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${s.bg} flex-shrink-0`}>
                    <s.icon size={16} className={s.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{s.label}</p>
                    <p className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{s.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 self-start">
              {([['pending', 'Kutilmoqda'], ['accepted', 'Tasdiqlangan'], ['rejected', 'Rad etilgan']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${filter === v ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  {l}
                  {v === 'pending' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki yordamchi..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
            )) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-12 text-center text-gray-400">
                <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Buyurtma topilmadi</p>
              </div>
            ) : filtered.map(o => (
              <div key={o._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{o.customerName}</span>
                        <span className="text-gray-400 text-xs">{o.customerPhone}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span>Yordamchi: {o.yordamchiName}</span>
                        <span>{o.items.length} ta mahsulot</span>
                        <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{o.total.toLocaleString('uz-UZ')} so'm</span>
                        <span className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('uz-UZ')}</span>
                      </div>
                      {o.status === 'rejected' && o.rejectedReason && (
                        <p className="text-xs text-red-500 mt-1">Sabab: {o.rejectedReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                      className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                      {expanded === o._id ? 'Yopish' : "Ko'rish"}
                    </button>
                    {o.status === 'pending' && (
                      <>
                        <button onClick={() => accept(o._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg">
                          <CheckCircle size={13} /> Qabul
                        </button>
                        <button onClick={() => setRejectModal(o)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg">
                          <XCircle size={13} /> Rad
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {expanded === o._id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-400">
                        <th className="text-left py-1">Mahsulot</th>
                        <th className="text-center py-1">Soni</th>
                        <th className="text-right py-1 whitespace-nowrap">Narxi</th>
                        <th className="text-right py-1 whitespace-nowrap">Jami</th>
                      </tr></thead>
                      <tbody>{o.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-50 dark:border-gray-800">
                          <td className="py-1.5 text-gray-700 dark:text-gray-300">{item.name}</td>
                          <td className="py-1.5 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="py-1.5 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.sellPrice.toLocaleString('uz-UZ')}</td>
                          <td className="py-1.5 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">{(item.quantity * item.sellPrice).toLocaleString('uz-UZ')}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
