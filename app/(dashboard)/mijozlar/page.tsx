'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, Plus, Users, X, Pencil, Trash2, Send } from 'lucide-react';

interface Customer {
  _id: string; name: string; phone: string; address?: string;
  debt: number; telegramChatId?: string; createdAt: string;
}

function Modal({ customer, onClose, onSave }: {
  customer: Partial<Customer> | null; onClose: () => void; onSave: () => void;
}) {
  const isEdit = !!customer?._id;
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    telegramChatId: customer?.telegramChatId || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setErr('Ism va telefon majburiy'); return; }
    setSaving(true);
    const url = isEdit ? `/api/customers/${customer!._id}` : '/api/customers';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{isEdit ? 'Tahrirlash' : 'Yangi mijoz'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          {([
            ['name', 'Ism familiya *', 'text'],
            ['phone', 'Telefon *', 'text'],
            ['address', 'Manzil', 'text'],
          ] as const).map(([k, l]) => (
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Telegram Chat ID
              <span className="ml-1 text-gray-400 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              value={form.telegramChatId}
              onChange={e => setForm(f => ({ ...f, telegramChatId: e.target.value }))}
              placeholder="masalan: 123456789"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Mijoz @userinfobot ga yozsa Chat ID sini oladi
            </p>
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

function SendMsgModal({ customer, onClose, onSent }: {
  customer: Customer; onClose: () => void; onSent: () => void;
}) {
  const TYPE_LABELS = {
    qarz_eslatma: 'Qarz eslatmasi',
    sotuv_tasdiq: 'Sotuv tasdigi',
    qarz_tolandi: "Qarz to'landi",
  };
  const [type, setType] = useState<keyof typeof TYPE_LABELS>('qarz_eslatma');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<'yuborildi' | 'xato' | null>(null);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch('/api/xabar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        type,
        messageText: text,
      }),
    });
    const d = await res.json();
    setResult(d.status === 'yuborildi' ? 'yuborildi' : 'xato');
    setSending(false);
    setTimeout(() => { onSent(); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Xabar yuborish</h3>
            <p className="text-xs text-gray-500 mt-0.5">{customer.name} — {customer.phone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          {!customer.telegramChatId && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                ⚠️ Bu mijozda Telegram Chat ID ulangan emas. Xabar admin chatiga yuboriladi.
              </p>
            </div>
          )}
          {customer.telegramChatId && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-700 dark:text-green-400">
                ✅ Telegram ulangan — xabar mijozning o'z Telegramiga ketadi
              </p>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Xabar turi</label>
            <select value={type} onChange={e => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Xabar matni</label>
            <textarea rows={3} value={text} onChange={e => setText(e.target.value)}
              placeholder="Xabar matnini kiriting..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          {result && (
            <p className={`text-xs font-medium ${result === 'yuborildi' ? 'text-green-600' : 'text-red-500'}`}>
              {result === 'yuborildi' ? '✅ Xabar muvaffaqiyatli yuborildi!' : '❌ Xabar yuborilmadi. Token/Chat ID ni tekshiring.'}
            </p>
          )}
          <button onClick={handleSend} disabled={sending || !text.trim()}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
            <Send size={14} />{sending ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MijozlarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Customer> | null | false>(false);
  const [sendModal, setSendModal] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const load = () => {
    fetch('/api/customers').then(r => r.json()).then(d => {
      setCustomers(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  };
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  if (status === 'loading') return null;

  return (
    <>
      <Header title="Mijozlar" />
      {modal !== false && (
        <Modal customer={modal} onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />
      )}
      {sendModal && (
        <SendMsgModal customer={sendModal} onClose={() => setSendModal(null)} onSent={load} />
      )}
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 lg:mb-6">
            <div className="relative flex-1 sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki telefon..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <button onClick={() => setModal({})}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl whitespace-nowrap">
              <Plus size={16} /> Mijoz qo'shish
            </button>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Mijoz topilmadi</p>
              </div>
            ) : filtered.map(c => (
              <div key={c._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
                    {c.address && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.address}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {c.telegramChatId
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-medium">✅ TG</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-400">TG —</span>
                    }
                    {c.debt > 0
                      ? <span className="text-xs font-semibold text-red-500 whitespace-nowrap">{c.debt.toLocaleString('uz-UZ')} so'm</span>
                      : <span className="text-xs text-green-600">✅ 0</span>
                    }
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <button onClick={() => setSendModal(c)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500">
                    <Send size={14} />
                  </button>
                  <button onClick={() => setModal(c)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>{['Ism familiya', 'Telefon', 'Manzil', 'Telegram', 'Qarz', 'Amallar'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6}><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-4 my-3" /></td></tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <Users size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Mijoz topilmadi</p>
                    </td></tr>
                  ) : filtered.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{c.phone}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{c.address || '—'}</td>
                      <td className="px-4 py-3">
                        {c.telegramChatId
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-medium">✅ Ulangan</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-400">— Ulanmagan</span>
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.debt > 0
                          ? <span className="text-red-500 font-semibold">🔴 {c.debt.toLocaleString('uz-UZ')}</span>
                          : <span className="text-green-600 text-xs">✅ 0</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSendModal(c)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500"
                            title="Xabar yuborish">
                            <Send size={14} />
                          </button>
                          <button onClick={() => setModal(c)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                            title="Tahrirlash">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(c._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                            title="O'chirish">
                            <Trash2 size={14} />
                          </button>
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
    </>
  );
}
