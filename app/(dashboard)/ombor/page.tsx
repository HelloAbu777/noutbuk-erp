'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Search, Plus, ArrowRight, Warehouse, X, Pencil, Trash2,
  LayoutGrid, LayoutList, History, PackagePlus,
  ArrowDownCircle, ArrowUpCircle, Printer,
} from 'lucide-react';

interface WItem {
  _id: string; name: string; category: string;
  quantity: number; buyPrice: number; sellPrice: number;
  barcode?: string; description?: string; supplierName?: string;
  status: string; createdAt: string;
}
interface StoreProduct { _id: string; name: string; quantity: number; }
interface Movement { date: string; name: string; type: 'kirim' | 'chiqim'; qty: number; note: string; }

const CATS = ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'];
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400';

// ─── Qo'shish / Tahrirlash Modali ─────────────────────────────────────────────
function ItemModal({ item, onClose, onSave }: {
  item: Partial<WItem> | null; onClose: () => void; onSave: () => void;
}) {
  const isEdit = !!item?._id;
  const [form, setForm] = useState({
    name: item?.name ?? '', category: item?.category ?? 'Noutbuk',
    quantity: item?.quantity?.toString() ?? '',
    buyPrice: item?.buyPrice?.toString() ?? '',
    sellPrice: item?.sellPrice?.toString() ?? '',
    barcode: item?.barcode ?? '', description: item?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.buyPrice || !form.sellPrice || !form.quantity) {
      setErr("Majburiy maydonlar to'ldirilmadi"); return;
    }
    setSaving(true); setErr('');
    const body = {
      name: form.name.trim(), category: form.category,
      quantity: parseInt(form.quantity), buyPrice: parseFloat(form.buyPrice),
      sellPrice: parseFloat(form.sellPrice),
      barcode: form.barcode.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    const res = await fetch(isEdit ? `/api/ombor/${item!._id}` : '/api/ombor', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-semibold text-gray-900 dark:text-white">{isEdit ? 'Tahrirlash' : "Omborga qo'shish"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Mahsulot nomi *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
          <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Kategoriya</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div className="grid grid-cols-3 gap-3">
            {[['quantity', 'Soni *'], ['buyPrice', 'Sotib olish *'], ['sellPrice', 'Sotuv narxi *']].map(([k, l]) => (
              <div key={k}><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{l}</label>
                <input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} /></div>
            ))}
          </div>
          <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Barkod</label>
            <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className={inputCls} /></div>
          <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tavsif</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></div>
          {err && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{err}</p>}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Harakat Tarixi Modali ─────────────────────────────────────────────────────
function HarakatTarixiModal({ onClose }: { onClose: () => void }) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'hammasi' | 'kirim' | 'chiqim'>('hammasi');

  useEffect(() => {
    fetch('/api/products/history')
      .then(r => r.json())
      .then(d => { setMovements(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = movements.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'hammasi' || m.type === filter)
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History size={17} className="text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Harakat tarixi</p>
              <p className="text-xs text-gray-400">So'nggi 30 kun</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot nomi..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(['hammasi', 'kirim', 'chiqim'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <History size={36} className="mb-3 opacity-30" /><p className="text-sm">Harakat topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>{['Sana', 'Mahsulot', 'Tur', 'Miqdor', 'Izoh'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}{' '}
                      {new Date(m.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{m.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        m.type === 'kirim' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {m.type === 'kirim' ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                        {m.type === 'kirim' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-semibold ${m.type === 'kirim' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {m.type === 'kirim' ? '+' : '−'}{m.qty}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ommaviy Kirim Modali ──────────────────────────────────────────────────────
function OmmaviyKirimModal({ items, onClose, onSaved }: {
  items: WItem[]; onClose: () => void; onSaved: () => void;
}) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalAdding = Object.values(qtys).reduce((s, v) => s + (parseInt(v) || 0), 0);

  const handleSave = async () => {
    const updates = Object.entries(qtys).filter(([, v]) => parseInt(v) > 0);
    if (updates.length === 0) return;
    setSaving(true);
    for (const [id, v] of updates) {
      const item = items.find(i => i._id === id);
      if (!item) continue;
      await fetch(`/api/ombor/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: item.quantity + parseInt(v) }),
      });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <PackagePlus size={17} className="text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Ommaviy kirim</p>
              <p className="text-xs text-gray-400">Ombordagi mahsulotlarga miqdor qo'shish</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}><LayoutList size={15} /></button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}><LayoutGrid size={15} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'table' ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>{['Mahsulot', 'Kategoriya', 'Omborda', "Do'konga chiqarilgan", "Qo'shish"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                      {p.barcode && <div className="text-xs text-gray-400 font-mono">{p.barcode}</div>}
                    </td>
                    <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">{p.category}</span></td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">{p.quantity}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === 'sent_to_shop' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                        {p.status === 'sent_to_shop' ? 'Ha' : 'Yo\'q'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" min="0" placeholder="0"
                        value={qtys[p._id] ?? ''}
                        onChange={e => setQtys(prev => ({ ...prev, [p._id]: e.target.value }))}
                        className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:border-green-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p => {
                const adding = parseInt(qtys[p._id] ?? '') || 0;
                return (
                  <div key={p._id} className={`rounded-xl border transition-colors flex flex-col ${adding > 0 ? 'border-green-400 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight mb-2 h-8 line-clamp-2">{p.name}</p>
                      <span className="inline-block text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded mb-2 self-start">{p.category}</span>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1.5 text-center">
                          <p className="text-gray-400 text-[10px]">Ombor</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{p.quantity}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1.5 text-center">
                          <p className="text-gray-400 text-[10px]">Chiqarilgan</p>
                          <p className={`text-sm font-bold ${p.status === 'sent_to_shop' ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {p.status === 'sent_to_shop' ? 'Ha' : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pt-0">
                      <input type="number" min="0" placeholder="+0"
                        value={qtys[p._id] ?? ''}
                        onChange={e => setQtys(prev => ({ ...prev, [p._id]: e.target.value }))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:border-green-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Jami qo'shiladigan: <span className="font-semibold text-green-600 dark:text-green-400">{totalAdding} ta</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Bekor qilish</button>
            <button onClick={handleSave} disabled={saving || totalAdding === 0}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg">
              {saving ? 'Saqlanmoqda...' : "Qo'llash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OmborPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WItem[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<Partial<WItem> | null | false>(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showHarakatTarixi, setShowHarakatTarixi] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/ombor').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([warehouse, products]) => {
      setItems(Array.isArray(warehouse) ? warehouse : []);
      setStoreProducts(Array.isArray(products) ? products : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const sendToShop = async (id: string) => {
    setSending(id);
    await fetch(`/api/ombor/${id}/chiqar`, { method: 'PUT' });
    setSending(null);
    load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    await fetch(`/api/ombor/${id}`, { method: 'DELETE' });
    load();
  };

  // Do'kondagi miqdor: name → qty map
  const storeMap: Record<string, number> = {};
  for (const p of storeProducts) storeMap[p.name.trim().toLowerCase()] = p.quantity;

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i._id));
  const someSelected = filtered.some(i => selectedIds.has(i._id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(i => n.delete(i._id)); return n; });
    else setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(i => n.add(i._id)); return n; });
  };
  const toggleOne = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedItems = items.filter(i => selectedIds.has(i._id));

  const printSelected = () => {
    const rows = selectedItems.map(i => {
      const sQty = storeMap[i.name.trim().toLowerCase()] ?? 0;
      return `<tr><td>${i.name}</td><td>${i.category}</td><td>${i.quantity}</td><td>${sQty}</td><td>${i.buyPrice.toLocaleString('uz-UZ')}</td><td>${i.sellPrice.toLocaleString('uz-UZ')}</td><td>${i.supplierName || '—'}</td></tr>`;
    }).join('');
    const w = window.open('', '_blank', 'width=900,height=600');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ombor ro'yxati</title>
      <style>body{font-family:sans-serif;font-size:13px;padding:16px;}h2{margin-bottom:12px;font-size:16px;}
      table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left;}
      th{background:#f3f4f6;font-size:11px;text-transform:uppercase;}@media print{body{padding:0;}}</style></head><body>
      <h2>Ombor ro'yxati (${selectedItems.length} ta) — ${new Date().toLocaleDateString('uz-UZ')}</h2>
      <table><thead><tr><th>Nomi</th><th>Kategoriya</th><th>Omborda</th><th>Do'konda</th><th>Sotib olish</th><th>Sotuv narxi</th><th>Ta'minotchi</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    w.document.close();
  };

  if (status === 'loading') return null;

  const ActionBtns = ({ item }: { item: WItem }) => (
    <div className="flex items-center justify-around" onClick={e => e.stopPropagation()}>
      {item.status === 'in_warehouse' && (
        <button onClick={() => sendToShop(item._id)} disabled={sending === item._id}
          title="Do'konga chiqarish"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-medium rounded-lg transition-colors">
          {sending === item._id ? '...' : <><ArrowRight size={12} /> Do'konga</>}
        </button>
      )}
      <button onClick={() => setModalItem(item)} title="Tahrirlash"
        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors">
        <Pencil size={14} />
      </button>
      <button onClick={() => deleteItem(item._id)} title="O'chirish"
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <>
      <Header title="Ombor" />

      {modalItem !== false && (
        <ItemModal key={modalItem?._id ?? 'new'} item={modalItem}
          onClose={() => setModalItem(false)} onSave={() => { setModalItem(false); load(); }} />
      )}
      {showHarakatTarixi && <HarakatTarixiModal onClose={() => setShowHarakatTarixi(false)} />}

      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6">

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400" />
            </div>
            
            <button onClick={() => setShowHarakatTarixi(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              <History size={15} /> Harakat tarixi
            </button>

            <div className="flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}><LayoutList size={16} /></button>
              <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}><LayoutGrid size={16} /></button>
            </div>

            <button onClick={() => setModalItem(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap">
              <Plus size={16} /> Yangi mahsulot
            </button>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={allSelected}
                          ref={el => { if (el) el.indeterminate = someSelected; }}
                          onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      </th>
                      {['Nomi', 'Kategoriya', 'Omborda', "Do'konda", 'Sotib olish', 'Sotuv narxi', "Ta'minotchi", 'Holat', 'Amallar'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={10} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>
                    )) : filtered.length === 0 ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                        <Warehouse size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Ombor bo'sh</p>
                      </td></tr>
                    ) : filtered.map(item => {
                      const isSelected = selectedIds.has(item._id);
                      const sQty = storeMap[item.name.trim().toLowerCase()] ?? 0;
                      return (
                        <tr key={item._id} onClick={() => toggleOne(item._id)}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(item._id)}
                              className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                            {item.barcode && <div className="text-xs text-gray-400 font-mono mt-0.5">{item.barcode}</div>}
                          </td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">{item.category}</span></td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${sQty === 0 ? 'text-gray-300 dark:text-gray-600' : sQty < 5 ? 'text-amber-500' : 'text-green-600 dark:text-green-400'}`}>{sQty}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.buyPrice.toLocaleString('uz-UZ')}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.sellPrice.toLocaleString('uz-UZ')}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{item.supplierName || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.status === 'sent_to_shop' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                              {item.status === 'sent_to_shop' ? 'Chiqarilgan' : 'Omborda'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><ActionBtns item={item} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD VIEW */}
          {viewMode === 'card' && (
            loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-52 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Warehouse size={48} className="mb-3 opacity-30" /><p className="text-sm">Ombor bo'sh</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(item => {
                  const isSelected = selectedIds.has(item._id);
                  const sQty = storeMap[item.name.trim().toLowerCase()] ?? 0;
                  const qtyStr = item.quantity.toString();
                  const sQtyStr = sQty.toString();
                  const buyPriceStr = item.buyPrice.toLocaleString('uz-UZ');
                  const sellPriceStr = item.sellPrice.toLocaleString('uz-UZ');
                  return (
                    <div key={item._id} onClick={() => toggleOne(item._id)}
                      className={`relative rounded-xl border cursor-pointer transition-all flex flex-col ${isSelected ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 hover:shadow-sm'}`}>
                      <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(item._id)}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      </div>
                      {/* Status badge */}
                      <span className={`absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded ${item.status === 'sent_to_shop' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                        {item.status === 'sent_to_shop' ? 'Chiqarilgan' : 'Omborda'}
                      </span>
                      <div className="p-3 pt-8 flex-1 flex flex-col">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 h-8">{item.name}</p>
                        <span className="inline-block text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded mb-2 self-start">{item.category}</span>
                        <div className="flex gap-1.5 mb-2">
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 text-center overflow-hidden">
                            <p className="text-xs text-gray-400 leading-tight">Ombor</p>
                            <p className={`font-bold text-gray-900 dark:text-white truncate ${qtyStr.length > 8 ? 'text-[10px]' : qtyStr.length > 5 ? 'text-xs' : 'text-sm'}`}>{item.quantity}</p>
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 text-center overflow-hidden">
                            <p className="text-xs text-gray-400 leading-tight">Do'kon</p>
                            <p className={`font-bold truncate ${sQtyStr.length > 8 ? 'text-[10px]' : sQtyStr.length > 5 ? 'text-xs' : 'text-sm'} ${sQty === 0 ? 'text-gray-300 dark:text-gray-600' : sQty < 5 ? 'text-amber-500' : 'text-green-600 dark:text-green-400'}`}>{sQty}</p>
                          </div>
                        </div>
                        <p className={`text-gray-400 mb-0.5 truncate ${buyPriceStr.length > 15 ? 'text-[10px]' : 'text-xs'}`}>Sotib: {buyPriceStr}</p>
                        <p className={`font-bold text-gray-900 dark:text-white truncate ${sellPriceStr.length > 15 ? 'text-[10px]' : sellPriceStr.length > 10 ? 'text-xs' : 'text-sm'}`}>{sellPriceStr}</p>
                        {item.supplierName && <p className="text-[10px] text-gray-400 mt-0.5 truncate h-4">{item.supplierName}</p>}
                      </div>
                      <div className="p-3 pt-0 mt-2 border-t border-gray-100 dark:border-gray-700">
                        <ActionBtns item={item} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Pastdagi floating bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 dark:bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-700">
          <span className="text-sm font-medium">{selectedIds.size} ta tanlandi</span>
          <div className="w-px h-4 bg-gray-600" />
          <button onClick={printSelected}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            <Printer size={15} /> Chop etish
          </button>
          <div className="w-px h-4 bg-gray-600" />
          <button onClick={() => setSelectedIds(new Set())}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <X size={14} /> Tozalash
          </button>
        </div>
      )}
    </>
  );
}
