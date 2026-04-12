'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, Plus, Pencil, Trash2, X, Truck } from 'lucide-react';

interface Supplier {
  _id: string; companyName: string; contactPerson: string; phone: string;
  address?: string; totalPurchased: number; totalPaid: number; status: string;
}

function Modal({ supplier, onClose, onSave }: { supplier: Partial<Supplier> | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!supplier?._id;
  const [form, setForm] = useState({
    companyName: supplier?.companyName || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.companyName || !form.phone) { setErr("Kompaniya va telefon majburiy"); return; }
    setSaving(true);
    const url = isEdit ? `/api/tamirotchilar/${supplier!._id}` : '/api/tamirotchilar';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{isEdit ? 'Tahrirlash' : "Yangi ta'minotchi"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          {([['companyName', "Kompaniya nomi *"], ['contactPerson', "Mas'ul shaxs"], ['phone', "Telefon *"], ['address', "Manzil"]] as const).map(([k, l]) => (
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          ))}
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

export default function TamirotchilarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Supplier> | null | false>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    fetch('/api/tamirotchilar').then(r => r.json()).then(d => { setSuppliers(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const remove = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    await fetch(`/api/tamirotchilar/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  if (status === 'loading') return null;

  return (
    <>
      <Header title="Ta'minotchilar" />
      {modal !== false && <Modal supplier={modal} onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />}
      <div className="pt-14 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <button onClick={() => setModal({})}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg">
              <Plus size={16} /> Qo'shish
            </button>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{["Kompaniya", "Mas'ul shaxs", "Telefon", "Manzil", "Jami xarid", "To'langan", "Amallar"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Truck size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Ta'minotchi topilmadi</p>
                  </td></tr>
                ) : filtered.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.companyName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.address || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.totalPurchased.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-green-600">{s.totalPaid.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(s)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500"><Pencil size={14} /></button>
                        <button onClick={() => remove(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"><Trash2 size={14} /></button>
                      </div>
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
