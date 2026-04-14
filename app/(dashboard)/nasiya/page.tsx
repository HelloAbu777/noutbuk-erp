'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, X, CreditCard, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';
import { getDynamicFontSize, formatNumber } from '@/lib/format';

interface Payment { amount: number; date: string; note?: string; }
interface Nasiya {
  _id: string; customerName: string; customerPhone: string;
  totalAmount: number; paidAmount: number; remainingAmount: number;
  dueDate?: string; status: 'open' | 'paid' | 'overdue'; date: string;
  payments: Payment[];
}
interface Stats { total: number; open: number; overdue: number; paid: number; totalAmount: number; remainingAmount: number; }

function AddNasiyaModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [customers, setCustomers] = useState<Array<{ _id: string; name: string; phone: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [form, setForm] = useState({ totalAmount: '', dueDate: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(d => {
        setCustomers(Array.isArray(d) ? d : []);
        setLoadingCustomers(false);
      })
      .catch(() => setLoadingCustomers(false));
  }, []);

  const handleSave = async () => {
    if (!selectedCustomer || !form.totalAmount) {
      setErr("Mijoz va summa kiritilishi shart");
      return;
    }
    const customer = customers.find(c => c._id === selectedCustomer);
    if (!customer) {
      setErr("Mijoz topilmadi");
      return;
    }
    setSaving(true);
    const res = await fetch('/api/nasiya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        customerPhone: customer.phone,
        totalAmount: form.totalAmount,
        dueDate: form.dueDate,
        note: form.note,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error || 'Xatolik');
      setSaving(false);
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Nasiya qo'shish</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mijoz *</label>
            {loadingCustomers ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400">
                Yuklanmoqda...
              </div>
            ) : (
              <select 
                value={selectedCustomer} 
                onChange={e => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">Mijozni tanlang</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jami summa *</label>
            <input type="number" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To'lov muddati</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Izoh</label>
            <textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Bekor qilish
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
              {saving ? 'Saqlanmoqda...' : "Qo'shish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayModal({ nasiya, onClose, onSave }: { nasiya: Nasiya; onClose: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handlePay = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setErr("To'lov miqdori kiriting"); return; }
    if (num > nasiya.remainingAmount) { setErr("Qoldiqdan ko'p bo'lishi mumkin emas"); return; }
    setSaving(true);
    const res = await fetch(`/api/nasiya/${nasiya._id}/tolov`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: num, note }),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">To'lov qabul qilish</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Mijoz:</span><span className="font-medium text-gray-900 dark:text-white">{nasiya.customerName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Jami qarz:</span><span className="font-semibold text-red-500">{nasiya.totalAmount.toLocaleString('uz-UZ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">To'langan:</span><span className="text-green-600">{nasiya.paidAmount.toLocaleString('uz-UZ')}</span></div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1"><span className="text-gray-700 dark:text-gray-300 font-medium">Qoldiq:</span><span className="font-bold text-red-500">{nasiya.remainingAmount.toLocaleString('uz-UZ')}</span></div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To'lov miqdori *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={nasiya.remainingAmount.toLocaleString('uz-UZ')}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Izoh</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setAmount(nasiya.remainingAmount.toString())}
              className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Hammasini to'lash
            </button>
            <button onClick={handlePay} disabled={saving}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
              {saving ? 'Saqlanmoqda...' : "To'lov"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = { open: 'Ochiq', paid: "To'langan", overdue: "Muddati o'tgan" };
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  paid: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  overdue: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

export default function NasiyaPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Nasiya[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [payModal, setPayModal] = useState<Nasiya | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    fetch('/api/nasiya').then(r => r.json()).then(d => {
      setItems(Array.isArray(d.nasiyalar) ? d.nasiyalar : []);
      setStats(d.stats || null);
      setLoading(false);
    });
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const filtered = items.filter(n => {
    const matchFilter = filter === 'all' || n.status === filter;
    const matchSearch = n.customerName.toLowerCase().includes(search.toLowerCase()) || n.customerPhone.includes(search);
    return matchFilter && matchSearch;
  });

  if (status === 'loading') return null;

  return (
    <>
      <Header title="Nasiya" />
      {payModal && <PayModal nasiya={payModal} onClose={() => setPayModal(null)} onSave={() => { setPayModal(null); load(); }} />}
      {showAddModal && <AddNasiyaModal onClose={() => setShowAddModal(false)} onSave={() => { setShowAddModal(false); load(); }} />}
      <div className="pt-14 min-h-screen pb-16 lg:pb-0 bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { label: 'Jami nasiya', value: stats ? stats.totalAmount.toLocaleString('uz-UZ') + " so'm" : '...', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Ochiq qarzlar', value: stats ? stats.open + ' ta' : '...', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: "Muddati o'tgan", value: stats ? stats.overdue + ' ta' : '...', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
              { label: "To'langan", value: stats ? stats.paid + ' ta' : '...', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className={`p-1.5 lg:p-2 rounded-lg ${s.bg} flex-shrink-0`}><s.icon size={16} className={s.color} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{s.label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 overflow-x-auto">
              {([['all', 'Hammasi'], ['open', 'Ochiq'], ['overdue', "Muddati o'tgan"], ['paid', "To'langan"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${filter === v ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki telefon..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg whitespace-nowrap">
              <Plus size={16} /> Nasiya qo'shish
            </button>
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
            )) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center text-gray-400">
                <CreditCard size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nasiya topilmadi</p>
              </div>
            ) : filtered.map(n => (
              <div key={n._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{n.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.customerPhone}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[n.status]}`}>{STATUS_LABELS[n.status]}</span>
                </div>
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Jami</p>
                    <p className={`font-bold text-gray-900 dark:text-white leading-tight mt-0.5 ${getDynamicFontSize(n.totalAmount)}`}>{formatNumber(n.totalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">To'langan</p>
                    <p className={`font-bold text-green-600 leading-tight mt-0.5 ${getDynamicFontSize(n.paidAmount)}`}>{formatNumber(n.paidAmount)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Qoldiq</p>
                    <p className={`font-bold text-red-500 leading-tight mt-0.5 ${getDynamicFontSize(n.remainingAmount)}`}>{formatNumber(n.remainingAmount)}</p>
                  </div>
                </div>
                {/* Action — always same height */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                  {n.status !== 'paid' ? (
                    <button onClick={() => setPayModal(n)}
                      className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors">
                      To'lov qabul qilish
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-1.5">
                      <span className="text-xs text-green-600 font-medium">✅ To'liq to'langan</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>{['Mijoz', 'Telefon', 'Jami', "To'langan", 'Qoldiq', 'Sana', 'Muddat', 'Holat', 'Amallar'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={9}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      <CreditCard size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nasiya topilmadi</p>
                    </td></tr>
                  ) : filtered.map(n => (
                    <tr key={n._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{n.customerName}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{n.customerPhone}</td>
                      <td className={`px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap ${getDynamicFontSize(n.totalAmount)}`}>{formatNumber(n.totalAmount)}</td>
                      <td className={`px-4 py-3 text-green-600 whitespace-nowrap ${getDynamicFontSize(n.paidAmount)}`}>{formatNumber(n.paidAmount)}</td>
                      <td className={`px-4 py-3 font-semibold text-red-500 whitespace-nowrap ${getDynamicFontSize(n.remainingAmount)}`}>{formatNumber(n.remainingAmount)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(n.date).toLocaleDateString('uz-UZ')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{n.dueDate ? new Date(n.dueDate).toLocaleDateString('uz-UZ') : '—'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${STATUS_COLORS[n.status]}`}>{STATUS_LABELS[n.status]}</span></td>
                      <td className="px-4 py-3">
                        {n.status !== 'paid' && (
                          <button onClick={() => setPayModal(n)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg whitespace-nowrap">
                            To'lash
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
