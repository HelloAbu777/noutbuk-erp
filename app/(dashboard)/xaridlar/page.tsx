'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, Plus, X, ShoppingCart } from 'lucide-react';

interface Supplier { _id: string; companyName: string; }
interface Purchase {
  _id: string; supplierName: string; productName: string; category: string;
  quantity: number; buyPrice: number; sellPrice: number; totalAmount: number;
  paidAmount: number; note?: string; createdByName: string; date: string;
}

const CATS = ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'];

function AddModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    supplierId: '', supplierName: '', productName: '', category: 'Noutbuk',
    quantity: '', buyPrice: '', sellPrice: '', paidAmount: '', note: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/tamirotchilar').then(r => r.json()).then(d => setSuppliers(Array.isArray(d) ? d : []));
  }, []);

  const handleSubmit = async () => {
    if (!form.productName || !form.buyPrice || !form.sellPrice || !form.quantity) {
      setErr("Majburiy maydonlar to'ldirilmadi"); return;
    }
    setSaving(true);
    const body = {
      supplierId: form.supplierId || undefined,
      supplierName: form.supplierName || (suppliers.find(s => s._id === form.supplierId)?.companyName || 'Noma\'lum'),
      productName: form.productName,
      category: form.category,
      quantity: parseInt(form.quantity),
      buyPrice: parseFloat(form.buyPrice),
      sellPrice: parseFloat(form.sellPrice),
      paidAmount: parseFloat(form.paidAmount) || 0,
      note: form.note,
    };
    const res = await fetch('/api/xaridlar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Yangi xarid</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ta'minotchi</label>
            <select value={form.supplierId} onChange={e => {
              const s = suppliers.find(s => s._id === e.target.value);
              setForm(f => ({ ...f, supplierId: e.target.value, supplierName: s?.companyName || '' }));
            }} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              <option value="">— Tanlang —</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
            </select>
          </div>
          {!form.supplierId && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ta'minotchi ismi (qo'lda)</label>
              <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mahsulot nomi *</label>
            <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Kategoriya</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([['quantity', 'Soni *'], ['buyPrice', 'Sotib olish *'], ['sellPrice', 'Sotuv narxi *']] as const).map(([k, l]) => (
              <div key={k}>
                <label className="text-xs text-gray-500 mb-1 block">{l}</label>
                <input type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To'langan summa</label>
            <input type="number" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Izoh</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function XaridlarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    fetch(`/api/xaridlar?${params}`).then(r => r.json()).then(d => { setPurchases(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const filtered = purchases.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((s, p) => s + p.totalAmount, 0);

  if (status === 'loading') return null;

  return (
    <>
      <Header title="Xaridlar" />
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} />}
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              <button onClick={load}
                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap">
                Filter
              </button>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl whitespace-nowrap">
                <Plus size={16} />
                <span className="hidden sm:inline">Yangi xarid</span>
                <span className="sm:hidden">Qo'shish</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          {filtered.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-wrap gap-4 text-sm">
              <div><span className="text-gray-500">Jami xaridlar: </span><span className="font-semibold text-gray-900 dark:text-white">{filtered.length} ta</span></div>
              <div><span className="text-gray-500">Jami summa: </span><span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{totalAmount.toLocaleString('uz-UZ')} so'm</span></div>
            </div>
          )}

          {/* Mobile: card list */}
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingCart size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Xarid topilmadi</p>
              </div>
            ) : filtered.map(p => (
              <div key={p._id} className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{p.supplierName}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">{p.category}</span>
                </div>
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-2 text-center">
                    <p className="text-xs text-gray-400">Soni</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{p.quantity}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-2 text-center">
                    <p className="text-xs text-gray-400">Jami</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap mt-0.5">{p.totalAmount.toLocaleString('uz-UZ')}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-2 text-center">
                    <p className="text-xs text-gray-400">To'langan</p>
                    <p className="text-xs font-semibold text-green-600 whitespace-nowrap mt-0.5">{p.paidAmount.toLocaleString('uz-UZ')}</p>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(p.date).toLocaleDateString('uz-UZ')}</span>
                  <span className="text-xs text-gray-400 truncate ml-2">{p.createdByName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{["Mahsulot", "Ta'minotchi", "Kategoriya", "Soni", "Narxi", "Jami", "To'langan", "Sana", "Mas'ul"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={9}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <ShoppingCart size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Xarid topilmadi</p>
                  </td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.productName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.supplierName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">{p.category}</span></td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{p.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{p.buyPrice.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{p.totalAmount.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-green-600 whitespace-nowrap">{p.paidAmount.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(p.date).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{p.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
