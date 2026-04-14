'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Search, Plus, Trash2, RefreshCw, X, MessageSquare, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

type MessageStatus = 'yuborildi' | 'xato' | 'navbatda';
type MessageType = 'qarz_eslatma' | 'sotuv_tasdiq' | 'qarz_tolandi';

interface Message {
  _id: string; customerName: string; customerPhone: string;
  type: MessageType; messageText: string; status: MessageStatus;
  errorText?: string; createdByName?: string; date: string;
}

interface Stats { total: number; yuborildi: number; xato: number; navbatda: number; }

const TYPE_LABELS: Record<MessageType, string> = {
  qarz_eslatma: 'Qarz eslatmasi',
  sotuv_tasdiq: 'Sotuv tasdigi',
  qarz_tolandi: "Qarz to'landi",
};

const STATUS_LABELS: Record<MessageStatus, string> = {
  yuborildi: 'Yuborildi',
  xato: 'Xato',
  navbatda: 'Navbatda',
};

const STATUS_STYLE: Record<MessageStatus, string> = {
  yuborildi: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  xato: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
  navbatda: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
};

interface Customer { _id: string; name: string; phone: string; telegramChatId?: string; }

function SendModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', type: 'qarz_eslatma' as MessageType, messageText: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []));
  }, []);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = customers.find(x => x._id === e.target.value);
    if (c) {
      setSelectedCustomer(c);
      setForm(f => ({ ...f, customerName: c.name, customerPhone: c.phone }));
    }
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.messageText) {
      setErr("Barcha maydonlar to'ldirilsin"); return;
    }
    setSaving(true);
    const res = await fetch('/api/xabar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, customerId: selectedCustomer?._id }),
    });
    const d = await res.json();
    if (!res.ok) { setErr(d.error || 'Xatolik'); setSaving(false); return; }
    setResult(d.status);
    setTimeout(() => onSave(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Xabar yuborish</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mijoz tanlash</label>
            <select onChange={handleSelectCustomer} defaultValue=""
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              <option value="">Mijoz tanlang...</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.telegramChatId ? '✅ ' : '   '}{c.name} — {c.phone}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <p className={`text-xs mt-1 ${selectedCustomer.telegramChatId ? 'text-green-600' : 'text-amber-500'}`}>
                {selectedCustomer.telegramChatId
                  ? '✅ Telegram ulangan — xabar to\'g\'ridan-to\'g\'ri ketadi'
                  : '⚠️ Telegram ulanmagan — admin chatiga yuboriladi'}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ism *</label>
            <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Telefon *</label>
            <input 
              type="tel"
              value={form.customerPhone} 
              onChange={e => {
                const value = e.target.value.replace(/[^0-9+]/g, '');
                setForm(f => ({ ...f, customerPhone: value }));
              }}
              placeholder="+998901234567"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Xabar turi</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as MessageType }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Xabar matni *</label>
            <textarea rows={3} value={form.messageText} onChange={e => setForm(f => ({ ...f, messageText: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          {result && (
            <p className={`text-xs font-medium ${result === 'yuborildi' ? 'text-green-600' : 'text-amber-500'}`}>
              {result === 'yuborildi' ? '✅ Xabar muvaffaqiyatli yuborildi!' : '⚠️ Bot sozlanmagan — xabar saqlanib qoldi'}
            </p>
          )}
          <button onClick={handleSubmit} disabled={saving || !!result}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
            <Send size={14} />{saving ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function XabarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, yuborildi: 0, xato: 0, navbatda: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && !['admin', 'kassir'].includes(session?.user?.role || '')) router.push('/dashboard');
  }, [status, session, router]);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/xabar');
    const data = await res.json();
    setMessages(data.messages || []);
    setStats(data.stats || { total: 0, yuborildi: 0, xato: 0, navbatda: 0 });
    setLoading(false);
  };

  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/xabar?id=${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = messages.filter(m =>
    m.customerName.toLowerCase().includes(search.toLowerCase()) ||
    m.customerPhone.includes(search)
  );

  return (
    <>
      <Header title="Xabarlar" />
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Jami yuborilgan', value: stats.total, icon: MessageSquare, color: 'text-blue-600' },
              { label: 'Yuborildi', value: stats.yuborildi, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Xato', value: stats.xato, icon: XCircle, color: 'text-red-500' },
              { label: 'Navbatda', value: stats.navbatda, icon: Clock, color: 'text-amber-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={15} className={color} />
                  <p className="text-xs text-gray-500 truncate">{label}</p>
                </div>
                <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mijoz bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={load}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900">
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Yangilash</span>
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium whitespace-nowrap">
                <Plus size={16} />
                <span className="hidden sm:inline">Xabar yuborish</span>
                <span className="sm:hidden">Yuborish</span>
              </button>
            </div>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Yuklanmoqda...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm">Xabar topilmadi</p>
              </div>
            ) : filtered.map(m => (
              <div key={m._id} className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{m.customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.customerPhone}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[m.status]}`}>
                    {STATUS_LABELS[m.status]}
                  </span>
                </div>
                {/* Message preview */}
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{m.messageText}</p>
                {/* Footer: type + time + delete */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {TYPE_LABELS[m.type]}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(m._id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {["Mijoz", "Telefon", "Turi", "Xabar matni", "Holat", "Vaqt", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">Xabar topilmadi</p>
                      </td>
                    </tr>
                  ) : filtered.map(m => (
                    <tr key={m._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.customerName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{m.customerPhone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {TYPE_LABELS[m.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{m.messageText}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLE[m.status]}`}>
                          {STATUS_LABELS[m.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(m.date).toLocaleDateString('uz-UZ')} {new Date(m.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(m._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <SendModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />
      )}
    </>
  );
}
