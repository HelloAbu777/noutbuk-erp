'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SupplierProfileModal from '@/components/SupplierProfileModal';
import { Search, Plus, Pencil, Trash2, X, Truck, ShoppingCart } from 'lucide-react';

interface Supplier {
  _id: string; companyName: string; contactPerson: string; phone: string;
  address?: string; totalPurchased: number; totalPaid: number; status: string;
  createdAt: string;
}

const CATS = ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'];

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
          {([['companyName', "Kompaniya nomi *"], ['contactPerson', "Mas'ul shaxs"], ['address', "Manzil"]] as const).map(([k, l]) => (
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Telefon *</label>
            <input 
              type="tel"
              value={form.phone} 
              onChange={e => {
                const value = e.target.value.replace(/[^0-9+]/g, '');
                setForm(f => ({ ...f, phone: value }));
              }}
              placeholder="+998901234567"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" 
            />
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

function PurchaseModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
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

export default function TamirotchilarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Supplier> | null | false>(false);
  const [profileModal, setProfileModal] = useState<Supplier | null>(null);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [loading, setLoading] = useState(true);


  const load = () => {
    setLoading(true);
    fetch('/api/tamirotchilar').then(r => r.json()).then(d => { setSuppliers(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    await fetch(`/api/tamirotchilar/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );


  return (
    <>
      <Header title="Ta'minotchilar" />
      {modal !== false && <Modal supplier={modal} onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />}
      {profileModal && (
        <SupplierProfileModal supplier={profileModal} onClose={() => setProfileModal(null)} />
      )}
      {purchaseModal && (
        <PurchaseModal onClose={() => setPurchaseModal(false)} onSave={() => { setPurchaseModal(false); load(); }} />
      )}
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 lg:mb-6">
            <div className="relative flex-1 sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPurchaseModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl whitespace-nowrap">
                <ShoppingCart size={16} /> Xarid qo'shish
              </button>
              <button onClick={() => setModal({})}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl whitespace-nowrap">
                <Plus size={16} /> Ta'minotchi
              </button>
            </div>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Truck size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Ta'minotchi topilmadi</p>
              </div>
            ) : filtered.map(s => (
              <div key={s._id} className="p-4">
                {/* Info */}
                <div 
                  className="mb-3 cursor-pointer"
                  onClick={() => setProfileModal(s)}
                >
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{s.companyName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {s.contactPerson && <p className="text-xs text-gray-500 truncate">{s.contactPerson}</p>}
                    <p className="text-xs text-gray-400 whitespace-nowrap">{s.phone}</p>
                  </div>
                </div>
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-0">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Jami xarid</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{s.totalPurchased.toLocaleString('uz-UZ')}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">To'langan</p>
                    <p className="text-sm font-semibold text-green-600 whitespace-nowrap">{s.totalPaid.toLocaleString('uz-UZ')}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center justify-around mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setModal(s)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(s._id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>{["Kompaniya", "Mas'ul shaxs", "Telefon", "Manzil", "Jami xarid", "To'langan", "Amallar"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
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
                    <td 
                      className="px-4 py-3 font-medium text-gray-900 dark:text-white cursor-pointer hover:text-purple-500"
                      onClick={() => setProfileModal(s)}
                    >
                      {s.companyName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{s.address || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{s.totalPurchased.toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-green-600 whitespace-nowrap">{s.totalPaid.toLocaleString('uz-UZ')}</td>
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
