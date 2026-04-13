'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Search, Plus, Pencil, Trash2, X, Package, Barcode, Printer,
  LayoutGrid, LayoutList, History, PackagePlus, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';

interface Product {
  _id: string; name: string; category: string;
  buyPrice: number; sellPrice: number; quantity: number;
  barcode?: string; description?: string; status: string;
}
interface WarehouseItem { _id: string; name: string; quantity: number; }
interface Movement { date: string; name: string; type: 'kirim' | 'chiqim'; qty: number; note: string; }

const CATS = ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'];
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400';
const labelCls = 'text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block';

// ─── Barcode Modal ─────────────────────────────────────────────────────────────
function BarcodeModal({ product, onClose, onBarcodeGenerated }: {
  product: Product; onClose: () => void; onBarcodeGenerated: (barcode: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [barcodeValue, setBarcodeValue] = useState(product.barcode || '');
  const [generating, setGenerating] = useState(false);
  const [rendered, setRendered] = useState(false);

  const generateBarcode = async () => {
    setGenerating(true);
    const newCode = Date.now().toString().slice(-10);
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: newCode }),
    });
    if (res.ok) { setBarcodeValue(newCode); onBarcodeGenerated(newCode); }
    setGenerating(false);
  };

  useEffect(() => {
    if (!barcodeValue || !svgRef.current) return;
    import('jsbarcode').then(({ default: JsBarcode }) => {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128', width: 2, height: 60,
          displayValue: true, fontSize: 13, margin: 10,
          background: '#ffffff', lineColor: '#000000',
        });
        setRendered(true);
      } catch {}
    });
  }, [barcodeValue]);

  const handlePrint = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const w = window.open('', '_blank', 'width=400,height=300');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Barkod — ${product.name}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}
      .label{font-size:13px;font-weight:600;margin-bottom:4px;text-align:center;}
      .price{font-size:15px;font-weight:700;margin-top:4px;text-align:center;}
      @media print{body{margin:0;}}</style></head>
      <body><div class="label">${product.name}</div>${svgData}
      <div class="price">${product.sellPrice.toLocaleString('uz-UZ')} so'm</div>
      <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Barcode size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Shtrix kod</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-5">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-4 text-center">{product.name}</p>
          {barcodeValue ? (
            <>
              <div className="flex justify-center bg-white rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                <svg ref={svgRef} />
              </div>
              <p className="text-center text-xs text-gray-400 mt-2 font-mono">{barcodeValue}</p>
              <button onClick={handlePrint} disabled={!rendered}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Printer size={15} /> Chop etish
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <Barcode size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bu mahsulotda shtrix kod yo'q</p>
              <button onClick={generateBarcode} disabled={generating}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                {generating ? 'Yaratilmoqda...' : 'Shtrix kod yaratish'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit / Add Modal ──────────────────────────────────────────────────────────
function Modal({ product, onClose, onSave }: {
  product: Partial<Product> | null; onClose: () => void; onSave: () => void;
}) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name ?? '', category: product?.category ?? 'Noutbuk',
    buyPrice: product?.buyPrice?.toString() ?? '', markup: '',
    sellPrice: product?.sellPrice?.toString() ?? '',
    quantity: product?.quantity?.toString() ?? '',
    barcode: product?.barcode ?? '', description: product?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleMarkup = (v: string) => {
    setForm(f => {
      const buy = parseFloat(f.buyPrice) || 0;
      const pct = parseFloat(v) || 0;
      return { ...f, markup: v, sellPrice: buy > 0 ? Math.round(buy * (1 + pct / 100)).toString() : f.sellPrice };
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErr('Mahsulot nomi kiritilmadi'); return; }
    if (!form.buyPrice) { setErr('Sotib olish narxi kiritilmadi'); return; }
    if (!form.sellPrice) { setErr('Sotuv narxi kiritilmadi'); return; }
    setSaving(true); setErr('');
    const body = {
      name: form.name.trim(), category: form.category,
      buyPrice: parseFloat(form.buyPrice), sellPrice: parseFloat(form.sellPrice),
      quantity: parseInt(form.quantity) || 0,
      barcode: form.barcode.trim() || undefined,
      description: form.description.trim() || undefined, status: 'active',
    };
    const res = await fetch(isEdit ? `/api/products/${product!._id}` : '/api/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || 'Serverda xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-semibold text-gray-900 dark:text-white">{isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div><label className={labelCls}>Mahsulot nomi *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Kategoriya</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Sotib olish narxi *</label>
              <input type="number" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
                onBlur={() => { if (form.markup) handleMarkup(form.markup); }} className={inputCls} /></div>
            <div><label className={labelCls}>Ustama (%)</label>
              <input type="number" value={form.markup} onChange={e => handleMarkup(e.target.value)} placeholder="0" className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Sotuv narxi *</label>
              <input type="number" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Soni</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Barkod</label>
            <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Tavsif</label>
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

// ─── Harakat Tarixi Modal ──────────────────────────────────────────────────────
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

  const filtered = movements.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'hammasi' || m.type === filter;
    return matchSearch && matchFilter;
  });

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

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot nomi..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(['hammasi', 'kirim', 'chiqim'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <History size={36} className="mb-3 opacity-30" />
              <p className="text-sm">Harakat topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  {['Sana', 'Mahsulot', 'Tur', 'Miqdor', 'Izoh'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
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
                        m.type === 'kirim'
                          ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
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

// ─── Ommaviy Kirim Modal ───────────────────────────────────────────────────────
function OmmaviyKirimModal({ products, warehouseMap, onClose, onSaved }: {
  products: Product[];
  warehouseMap: Record<string, number>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdding = Object.values(qtys).reduce((s, v) => s + (parseInt(v) || 0), 0);

  const handleSave = async () => {
    const updates = Object.entries(qtys)
      .filter(([, v]) => parseInt(v) > 0)
      .map(([id, v]) => ({ id, addQty: parseInt(v) }));
    if (updates.length === 0) return;
    setSaving(true);
    await fetch('/api/products/bulk', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    onSaved();
  };

  const wareKey = (name: string) => name.trim().toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <PackagePlus size={17} className="text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Ommaviy kirim</p>
              <p className="text-xs text-gray-400">Do'kondagi mahsulotlarga miqdor qo'shish</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <button onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
              <LayoutList size={15} />
            </button>
            <button onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'table' ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  {['Mahsulot', 'Kategoriya', "Do'konda", 'Omborda', 'Qo\'shish'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(p => {
                  const wQty = warehouseMap[wareKey(p.name)] ?? 0;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                        {p.barcode && <div className="text-xs text-gray-400 font-mono">{p.barcode}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">{p.category}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold text-sm ${p.quantity === 0 ? 'text-red-500' : p.quantity < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold text-sm ${wQty === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'}`}>
                          {wQty}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="0" placeholder="0"
                          value={qtys[p._id] ?? ''}
                          onChange={e => setQtys(prev => ({ ...prev, [p._id]: e.target.value }))}
                          className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-green-400 text-center" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p => {
                const wQty = warehouseMap[wareKey(p.name)] ?? 0;
                const adding = parseInt(qtys[p._id] ?? '') || 0;
                return (
                  <div key={p._id} className={`rounded-xl border transition-colors flex flex-col ${adding > 0 ? 'border-green-400 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight mb-2 h-8 line-clamp-2">{p.name}</p>
                      <span className="inline-block text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded mb-2 self-start">{p.category}</span>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1.5 text-center">
                          <p className="text-gray-400 text-[10px]">Do'kon</p>
                          <p className={`font-bold text-sm ${p.quantity === 0 ? 'text-red-500' : p.quantity < 5 ? 'text-amber-500' : 'text-green-600'}`}>{p.quantity}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1.5 text-center">
                          <p className="text-gray-400 text-[10px]">Ombor</p>
                          <p className={`font-bold text-sm ${wQty === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'}`}>{wQty}</p>
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

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Jami qo'shiladigan:{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">{totalAdding} ta</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleSave} disabled={saving || totalAdding === 0}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-colors">
              {saving ? 'Saqlanmoqda...' : 'Qo\'llash'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TovarlarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState<Partial<Product> | null | false>(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showHarakatTarixi, setShowHarakatTarixi] = useState(false);
  const [showOmmaviyKirim, setShowOmmaviyKirim] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/ombor').then(r => r.json()),
    ]).then(([prods, warehouse]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setWarehouseItems(Array.isArray(warehouse) ? warehouse : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const archive = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const handleBarcodeGenerated = (productId: string, barcode: string) => {
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, barcode } : p));
    if (barcodeProduct?._id === productId) setBarcodeProduct(prev => prev ? { ...prev, barcode } : prev);
  };

  // Ombor → map: name.toLowerCase() → total qty
  const warehouseMap: Record<string, number> = {};
  for (const w of warehouseItems) {
    const key = w.name.trim().toLowerCase();
    warehouseMap[key] = (warehouseMap[key] ?? 0) + w.quantity;
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p._id));
  const someSelected = filtered.some(p => selectedIds.has(p._id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(p => n.delete(p._id)); return n; });
    else setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(p => n.add(p._id)); return n; });
  };
  const toggleOne = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedProducts = products.filter(p => selectedIds.has(p._id));

  const printSelected = () => {
    const rows = selectedProducts.map(p => {
      const wQty = warehouseMap[p.name.trim().toLowerCase()] ?? 0;
      return `<tr><td>${p.name}</td><td>${p.category}</td><td>${p.buyPrice.toLocaleString('uz-UZ')}</td><td>${p.sellPrice.toLocaleString('uz-UZ')}</td><td>${p.quantity}</td><td>${wQty}</td>${p.barcode ? `<td class="mono">${p.barcode}</td>` : '<td>—</td>'}</tr>`;
    }).join('');
    const w = window.open('', '_blank', 'width=900,height=600');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Tovarlar ro'yxati</title>
      <style>body{font-family:sans-serif;font-size:13px;padding:16px;}h2{margin-bottom:12px;font-size:16px;}
      table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left;}
      th{background:#f3f4f6;font-size:11px;text-transform:uppercase;}.mono{font-family:monospace;font-size:11px;}
      @media print{body{padding:0;}}</style></head><body>
      <h2>Tanlangan tovarlar (${selectedProducts.length} ta) — ${new Date().toLocaleDateString('uz-UZ')}</h2>
      <table><thead><tr><th>Nomi</th><th>Kategoriya</th><th>Sotib olish</th><th>Sotuv narxi</th><th>Do'konda</th><th>Omborda</th><th>Barkod</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    w.document.close();
  };

  if (status === 'loading') return null;

  // Action buttons shared between table and card
  const ActionBtns = ({ p }: { p: Product }) => (
    <div className="flex items-center justify-around" onClick={e => e.stopPropagation()}>
      <button onClick={() => setBarcodeProduct(p)} title="Shtrix kod"
        className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 text-gray-400 hover:text-purple-500 transition-colors">
        <Barcode size={14} />
      </button>
      <button onClick={() => setModalProduct(p)} title="Tahrirlash"
        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors">
        <Pencil size={14} />
      </button>
      <button onClick={() => archive(p._id)} title="O'chirish"
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <>
      <Header title="Tovarlar" />

      {modalProduct !== false && (
        <Modal key={modalProduct?._id ?? 'new'} product={modalProduct}
          onClose={() => setModalProduct(false)} onSave={() => { setModalProduct(false); load(); }} />
      )}
      {barcodeProduct && (
        <BarcodeModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)}
          onBarcodeGenerated={(code) => handleBarcodeGenerated(barcodeProduct._id, code)} />
      )}
      {showHarakatTarixi && <HarakatTarixiModal onClose={() => setShowHarakatTarixi(false)} />}
      {showOmmaviyKirim && (
        <OmmaviyKirimModal products={products} warehouseMap={warehouseMap}
          onClose={() => setShowOmmaviyKirim(false)}
          onSaved={() => { setShowOmmaviyKirim(false); load(); }} />
      )}

      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6">

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {/* Search */}
            <div className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400" />
            </div>

            {/* Harakat tarixi */}
            <button onClick={() => setShowHarakatTarixi(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <History size={15} /> Harakat tarixi
            </button>

            {/* Ommaviy kirim */}
            <button onClick={() => setShowOmmaviyKirim(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
              <PackagePlus size={15} /> Ommaviy kirim
            </button>

            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
              <button onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                <LayoutList size={16} />
              </button>
              <button onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Qo'shish */}
            <button onClick={() => setModalProduct(null)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} /> Mahsulot qo'shish
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
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      </th>
                      {['Nomi', 'Kategoriya', 'Sotib olish', 'Sotuv narxi', "Do'konda", 'Omborda', 'Amallar'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={8} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td></tr>
                    )) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                        <Package size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Mahsulot topilmadi</p>
                      </td></tr>
                    ) : filtered.map(p => {
                      const isSelected = selectedIds.has(p._id);
                      const wQty = warehouseMap[p.name.trim().toLowerCase()] ?? 0;
                      return (
                        <tr key={p._id} onClick={() => toggleOne(p._id)}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleOne(p._id)}
                              className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                            {p.barcode && <div className="text-xs text-gray-400 font-mono mt-0.5">{p.barcode}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.buyPrice.toLocaleString('uz-UZ')}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{p.sellPrice.toLocaleString('uz-UZ')}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${p.quantity === 0 ? 'text-red-500' : p.quantity < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                              {p.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${wQty === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'}`}>
                              {wQty}
                            </span>
                          </td>
                          <td className="px-4 py-3"><ActionBtns p={p} /></td>
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
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Package size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Mahsulot topilmadi</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(p => {
                  const isSelected = selectedIds.has(p._id);
                  const wQty = warehouseMap[p.name.trim().toLowerCase()] ?? 0;
                  return (
                    <div key={p._id} onClick={() => toggleOne(p._id)}
                      className={`relative rounded-xl border cursor-pointer transition-all flex flex-col ${
                        isSelected ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 hover:shadow-sm'}`}>
                      {/* Checkbox */}
                      <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(p._id)}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      </div>
                      <div className="p-3 pt-8 flex-1 flex flex-col">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1 h-8">{p.name}</p>
                        <span className="inline-block text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded mb-2 self-start">{p.category}</span>
                        {/* Qty badges */}
                        <div className="flex gap-1.5 mb-2">
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 text-center">
                            <p className="text-xs text-gray-400 leading-tight">Do'kon</p>
                            <p className={`text-sm font-bold truncate ${p.quantity === 0 ? 'text-red-500' : p.quantity < 5 ? 'text-amber-500' : 'text-green-600'}`}>{p.quantity}</p>
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 text-center">
                            <p className="text-xs text-gray-400 leading-tight">Ombor</p>
                            <p className={`text-sm font-bold truncate ${wQty === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'}`}>{wQty}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-0.5 truncate">Sotib: {p.buyPrice.toLocaleString('uz-UZ')}</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{p.sellPrice.toLocaleString('uz-UZ')}</p>
                        {p.barcode && <p className="text-[10px] text-gray-400 font-mono mt-1 truncate h-4">{p.barcode}</p>}
                      </div>
                      <div className="p-3 pt-0 mt-2 border-t border-gray-100 dark:border-gray-700">
                        <ActionBtns p={p} />
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
