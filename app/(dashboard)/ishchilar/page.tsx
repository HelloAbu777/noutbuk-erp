'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Search, Plus, Pencil, Trash2, X, Users,
  Phone, MapPin, Briefcase, Calendar, CreditCard, FileText, ChevronRight
} from 'lucide-react';

const POSITIONS = ['Sotuvchi', 'Kassa', 'Manager', 'Ombor', 'Yuk tashuvchi', 'Texnik', 'Boshqa'];

interface Worker {
  _id: string;
  name: string;
  phone: string;
  position: string;
  salary?: number;
  address?: string;
  hireDate?: string;
  birthDate?: string;
  passportInfo?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

function WorkerModal({ worker, onClose, onSave }: {
  worker: Partial<Worker> | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!worker?._id;
  const [form, setForm] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    position: worker?.position || 'Sotuvchi',
    salary: worker?.salary?.toString() || '',
    address: worker?.address || '',
    hireDate: worker?.hireDate ? worker.hireDate.slice(0, 10) : '',
    birthDate: worker?.birthDate ? worker.birthDate.slice(0, 10) : '',
    passportInfo: worker?.passportInfo || '',
    notes: worker?.notes || '',
    status: worker?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErr("Ism familiya majburiy"); return; }
    if (!form.phone.trim()) { setErr("Telefon majburiy"); return; }
    setSaving(true); setErr('');
    const payload: any = {
      ...form,
      salary: form.salary ? parseFloat(form.salary) : undefined,
      hireDate: form.hireDate || undefined,
      birthDate: form.birthDate || undefined,
    };
    try {
      const res = await fetch(isEdit ? `/api/ishchilar/${worker!._id}` : '/api/ishchilar', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Ishchini tahrirlash' : 'Yangi ishchi qo\'shish'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Asosiy ma'lumotlar */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Asosiy ma'lumotlar</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ism familiya *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Misol: Aliyev Bobur"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Telefon *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+998 90 000 00 00"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Lavozim</label>
                  <select value={form.position} onChange={e => set('position', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Oylik maosh (so'm)</label>
                  <input type="number" value={form.salary} onChange={e => set('salary', e.target.value)}
                    placeholder="3000000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Holat</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Shaxsiy ma'lumotlar */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Shaxsiy ma'lumotlar</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Manzil</label>
                <input value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Shahar, ko'cha, uy"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tug'ilgan sana</label>
                  <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ishga kirgan sana</label>
                  <input type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Pasport ma'lumotlari</label>
                <input value={form.passportInfo} onChange={e => set('passportInfo', e.target.value)}
                  placeholder="AA 0000000 yoki PINFL"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Izoh</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={2} placeholder="Qo'shimcha ma'lumot..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>
          </div>

          {err && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{err}</p>}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm transition-colors">
            {saving ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Ishchi qo\'shish'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ worker, onClose, onEdit }: {
  worker: Worker;
  onClose: () => void;
  onEdit: () => void;
}) {
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Ishchi ma'lumotlari</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          {/* Avatar & name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {worker.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{worker.name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${worker.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {worker.status === 'active' ? 'Faol' : 'Nofaol'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Row icon={<Briefcase size={15} />} label="Lavozim" value={worker.position || '—'} />
            <Row icon={<Phone size={15} />} label="Telefon" value={worker.phone} />
            <Row icon={<CreditCard size={15} />} label="Oylik maosh"
              value={worker.salary ? `${worker.salary.toLocaleString('uz-UZ')} so'm` : '—'} />
            <Row icon={<MapPin size={15} />} label="Manzil" value={worker.address || '—'} />
            <Row icon={<Calendar size={15} />} label="Tug'ilgan sana" value={fmt(worker.birthDate)} />
            <Row icon={<Calendar size={15} />} label="Ishga kirgan sana" value={fmt(worker.hireDate)} />
            <Row icon={<FileText size={15} />} label="Pasport" value={worker.passportInfo || '—'} />
            {worker.notes && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Izoh</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{worker.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onEdit}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
              <Pencil size={14} /> Tahrirlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 dark:text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function IshchilarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modal, setModal] = useState<Partial<Worker> | null | false>(false);
  const [detail, setDetail] = useState<Worker | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ishchilar');
      const data = await res.json();
      setWorkers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Ishchini o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/ishchilar/${id}`, { method: 'DELETE' });
    setDetail(null);
    load();
  };

  const filtered = workers.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = w.name.toLowerCase().includes(q) || w.phone.includes(q) ||
      (w.position || '').toLowerCase().includes(q);
    const matchPos = posFilter === 'all' || w.position === posFilter;
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchPos && matchStatus;
  });

  const active = workers.filter(w => w.status === 'active').length;
  const totalSalary = workers.filter(w => w.status === 'active').reduce((s, w) => s + (w.salary || 0), 0);

  return (
    <>
      <Header title="Ishchilar" />
      <div className="pt-14 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Jami ishchilar', value: workers.length, color: 'text-gray-900 dark:text-white' },
              { label: 'Faol', value: active, color: 'text-green-600' },
              { label: 'Nofaol', value: workers.length - active, color: 'text-gray-400' },
              { label: 'Jami oylik', value: totalSalary ? `${totalSalary.toLocaleString('uz-UZ')} so'm` : '—', color: 'text-blue-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Ism, telefon yoki lavozim bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              <option value="all">Barcha lavozim</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[['all', 'Barchasi'], ['active', 'Faol'], ['inactive', 'Nofaol']].map(([v, l]) => (
                <button key={v} onClick={() => setStatusFilter(v as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => setModal({})}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap">
              <Plus size={16} /> Ishchi qo'shish
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {['Ism familiya', 'Lavozim', 'Telefon', 'Oylik maosh', 'Ishga kirgan', 'Holat', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={7}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-14 text-center">
                        <Users size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">Ishchi topilmadi</p>
                      </td>
                    </tr>
                  ) : filtered.map(w => (
                    <tr key={w._id}
                      onClick={() => setDetail(w)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {w.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{w.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                          {w.position || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{w.phone}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {w.salary ? `${w.salary.toLocaleString('uz-UZ')} so'm` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {w.hireDate ? new Date(w.hireDate).toLocaleDateString('uz-UZ') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${w.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {w.status === 'active' ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setModal(w)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(w._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={14} className="text-gray-300 ml-1" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {detail && (
        <DetailPanel
          worker={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setModal(detail); setDetail(null); }}
        />
      )}

      {/* Add/Edit modal */}
      {modal !== false && (
        <WorkerModal
          worker={modal}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); load(); }}
        />
      )}
    </>
  );
}
