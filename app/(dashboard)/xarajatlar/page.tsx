'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Plus, Trash2, X, Receipt } from 'lucide-react';

interface Expense {
  _id: string; title: string; amount: number; category: string;
  note?: string; createdByName: string; date: string;
}

const EXPENSE_CATS = ['Ijara', "Kommunal to'lovlar", "Xodimlar maoshi", 'Transport', 'Reklama', 'Boshqa'];

function AddModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'Ijara', note: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.amount) { setErr("Sarlavha va miqdor majburiy"); return; }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/xarajatlar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) {
        let msg = 'Xatolik yuz berdi';
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        setErr(msg); setSaving(false); return;
      }
      onSave();
    } catch (e: any) {
      setErr(e.message || 'Tarmoq xatosi');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Yangi xarajat</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sarlavha *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Kategoriya</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Miqdor *</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
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

export default function XarajatlarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    fetch('/api/xarajatlar').then(r => r.json()).then(d => { setExpenses(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const remove = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    await fetch(`/api/xarajatlar/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = catFilter === 'all' ? expenses : expenses.filter(e => e.category === catFilter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  if (status === 'loading') return null;

  return (
    <>
      <Header title="Xarajatlar" />
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} />}
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3">
              <p className="text-xs text-gray-500">Jami xarajat</p>
              <p className="font-bold text-lg text-red-500 whitespace-nowrap">{total.toLocaleString('uz-UZ')} so'm</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl whitespace-nowrap">
              <Plus size={16} />
              <span className="hidden sm:inline">Xarajat qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex overflow-x-auto gap-2 pb-1">
            <button onClick={() => setCatFilter('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
              Hammasi
            </button>
            {EXPENSE_CATS.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Receipt size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Xarajat topilmadi</p>
              </div>
            ) : filtered.map(e => (
              <div key={e._id} className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{e.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-xs">{e.category}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(e.date).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  {e.note && <p className="text-xs text-gray-400 mt-1 truncate">{e.note}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-red-500 whitespace-nowrap text-sm">{e.amount.toLocaleString('uz-UZ')}</span>
                  <button onClick={() => remove(e._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{['Sarlavha', 'Kategoriya', 'Miqdor', 'Izoh', 'Sana', "Mas'ul", 'Amallar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Receipt size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Xarajat topilmadi</p>
                  </td></tr>
                ) : filtered.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{e.title}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-xs">{e.category}</span></td>
                    <td className="px-4 py-3 font-semibold text-red-500 whitespace-nowrap">{e.amount.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{e.note || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(e.date).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{e.createdByName}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => remove(e._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"><Trash2 size={14} /></button>
                    </td>
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
