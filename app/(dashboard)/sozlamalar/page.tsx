'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Store, Send, Users, User, Database,
  Plus, Pencil, Trash2, X, Eye, EyeOff, Download, Upload,
  CheckCircle
} from 'lucide-react';

type Tab = 'dokon' | 'telegram' | 'foydalanuvchilar' | 'profil' | 'zaxira';

// ─── Do'kon sozlamalari ───────────────────────────────────────────────────────
function DokonTab() {
  const [form, setForm] = useState({ shopName: '', address: '', phone: '', checkText: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/sozlamalar').then(r => r.json()).then(d => {
      setForm({ shopName: d.shopName || '', address: d.address || '', phone: d.phone || '', checkText: d.checkText || '' });
      setCategories(d.categories || []);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/sozlamalar', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, categories }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCat = () => {
    const t = newCat.trim();
    if (t && !categories.includes(t)) { setCategories(c => [...c, t]); setNewCat(''); }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Do'kon ma'lumotlari</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {([["shopName", "Do'kon nomi"], ["address", "Manzil"], ["phone", "Telefon"], ["checkText", "Chek matni"]] as const).map(([k, l]) => (
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
          {saved ? <><CheckCircle size={14} />Saqlandi</> : saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Kategoriyalar</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(c => (
            <span key={c} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              {c}
              <button onClick={() => setCategories(prev => prev.filter(x => x !== c))} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCat()}
            placeholder="Yangi kategoriya..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
          <button onClick={addCat} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Telegram sozlamalari ─────────────────────────────────────────────────────
function TelegramTab() {
  const [form, setForm] = useState({ telegramBotToken: '', telegramChatId: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    fetch('/api/sozlamalar').then(r => r.json()).then(d => {
      setForm({
        telegramBotToken: d.telegramBotToken || '',
        telegramChatId: d.telegramChatId || '',
      });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/sozlamalar', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!form.telegramBotToken || !form.telegramChatId) {
      setTestMsg('❌ Token va Chat ID kiriting'); return;
    }
    setTesting(true); setTestMsg('');
    const res = await fetch('/api/telegram/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: form.telegramBotToken, chatId: form.telegramChatId }),
    });
    const d = await res.json();
    setTestMsg(d.ok ? '✅ Xabar muvaffaqiyatli yuborildi!' : `❌ Xato: ${d.error}`);
    setTesting(false);
  };

  const connected = !!(form.telegramBotToken && form.telegramChatId);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 p-4">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Qanday sozlash kerak?</p>
        <ol className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
          <li>1. Telegramda <b>@BotFather</b> ga yozing → /newbot → Bot token oling</li>
          <li>2. O'sha botga /start yozing</li>
          <li>3. <b>@userinfobot</b> ga /start yozing → Chat ID ni oling</li>
          <li>4. Token va Chat ID ni quyida kiriting → Saqlash</li>
        </ol>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Bot sozlamalari</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            connected
              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {connected ? '● Ulangan' : '○ Ulanmagan'}
          </span>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Bot Token</label>
          <input
            type="password"
            value={form.telegramBotToken}
            onChange={e => setForm(f => ({ ...f, telegramBotToken: e.target.value }))}
            placeholder="123456789:AAF..."
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">@BotFather dan olasiz</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Sizning Chat ID ingiz</label>
          <input
            value={form.telegramChatId}
            onChange={e => setForm(f => ({ ...f, telegramChatId: e.target.value }))}
            placeholder="123456789"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">@userinfobot dan olasiz</p>
        </div>

        {testMsg && (
          <p className={`text-xs font-medium ${testMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
            {testMsg}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-1">
            {saved ? <><CheckCircle size={13} /> Saqlandi</> : saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button onClick={handleTest} disabled={testing || !connected}
            className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg text-sm disabled:opacity-40">
            {testing ? 'Yuborilmoqda...' : 'Test xabar'}
          </button>
        </div>
      </div>

      {connected && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Avtomatik yuboriladi:</p>
          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><span className="text-green-500">●</span> Mijozga nasiya yozilganda</div>
            <div className="flex items-center gap-2"><span className="text-green-500">●</span> Nasiya to'lovi qilinganda</div>
            <div className="flex items-center gap-2"><span className="text-green-500">●</span> Xabar bo'limidan qo'lda yuborilganda</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Foydalanuvchilar ─────────────────────────────────────────────────────────
interface AppUser { _id: string; name: string; login: string; role: string; phone?: string; status: string; }

function UserModal({ user, onClose, onSave }: { user: Partial<AppUser> | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!user?._id;
  const [form, setForm] = useState({ name: user?.name || '', login: user?.login || '', phone: user?.phone || '', role: user?.role || 'kassir', password: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.login) { setErr("Ism va login majburiy"); return; }
    if (!isEdit && !form.password) { setErr("Parol majburiy"); return; }
    setSaving(true);
    const body: any = { name: form.name, login: form.login, phone: form.phone, role: form.role };
    if (form.password) body.password = form.password;
    const url = isEdit ? `/api/users/${user!._id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{isEdit ? 'Tahrirlash' : 'Yangi ishchi'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          {([["name", "Ism familiya *", "text"], ["login", "Login *", "text"], ["phone", "Telefon", "text"]] as const).map(([k, l, t]) => (
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rol</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400">
              <option value="admin">Admin</option>
              <option value="kassir">Kassir</option>
              <option value="yordamchi">Yordamchi</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{isEdit ? 'Yangi parol (ixtiyoriy)' : 'Parol *'}</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
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

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', kassir: 'Kassir', yordamchi: 'Yordamchi' };
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  kassir: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  yordamchi: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
};

function FoydalanuvchilarTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [modal, setModal] = useState<Partial<AppUser> | null | false>(false);
  const { data: session } = useSession();

  const load = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    load();
  };

  const active = users.filter(u => u.status === 'active');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium">
          <Plus size={16} />Ishchi qo'shish
        </button>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {active.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Foydalanuvchi topilmadi</div>
        ) : active.map(u => (
          <div key={u._id} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{u.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                <span className="text-xs text-gray-400 font-mono truncate">{u.login}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setModal(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <Pencil size={14} />
              </button>
              {u._id !== session?.user?.id && (
                <button onClick={() => handleDeactivate(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {["Ism familiya", "Login", "Telefon", "Rol", "Holat", "Amallar"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(u => (
              <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.login}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">Faol</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Pencil size={14} /></button>
                    {u._id !== session?.user?.id && (
                      <button onClick={() => handleDeactivate(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== false && (
        <UserModal user={modal} onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />
      )}
    </div>
  );
}

// ─── Profil ───────────────────────────────────────────────────────────────────
function ProfilTab() {
  const { data: session } = useSession();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setErr(''); setMsg('');
    if (!currentPass || !newPass || !confirmPass) { setErr("Barcha maydonlar to'ldirilsin"); return; }
    if (newPass !== confirmPass) { setErr("Yangi parollar mos emas"); return; }
    if (newPass.length < 4) { setErr("Parol kamida 4 ta belgi bo'lishi kerak"); return; }
    setSaving(true);
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPass, password: newPass }),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Xatolik'); setSaving(false); return; }
    setSaving(false); setMsg("Parol muvaffaqiyatli yangilandi");
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Profil ma'lumotlari</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{session?.user?.name}</p>
            <p className="text-sm text-gray-500">{ROLE_LABELS[session?.user?.role || ''] || session?.user?.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Parolni yangilash</h3>
        <div className="space-y-3">
          {[["Joriy parol", currentPass, setCurrentPass], ["Yangi parol", newPass, setNewPass], ["Tasdiqlash", confirmPass, setConfirmPass]].map(([label, val, setter], i) => (
            <div key={i}>
              <label className="text-xs text-gray-500 mb-1 block">{label as string}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={val as string}
                  onChange={e => (setter as Function)(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400" />
                {i === 0 && (
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {err && <p className="text-xs text-red-500">{err}</p>}
          {msg && <p className="text-xs text-green-600">{msg}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm">
            {saving ? 'Saqlanmoqda...' : 'Parolni yangilash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Zaxira ───────────────────────────────────────────────────────────────────
function ZaxiraTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    const res = await fetch('/api/sozlamalar/zaxira');
    if (!res.ok) { setMsg('Eksport muvaffaqiyatsiz'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-zaxira-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Zaxira yuklandi');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const res = await fetch('/api/sozlamalar/zaxira', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setMsg(res.ok ? "Ma'lumotlar tiklandi" : 'Tiklash muvaffaqiyatsiz');
    } catch {
      setMsg("JSON fayl xato");
    }
    setImporting(false);
    setTimeout(() => setMsg(''), 4000);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleReset = async () => {
    if (!confirm("⚠️ DIQQAT! Barcha kirim-chiqim ma'lumotlari o'chiriladi. Davom etasizmi?")) return;
    if (!confirm("Bu amalni qaytarib bo'lmaydi! Tasdiqlaysizmi?")) return;
    
    setResetting(true);
    try {
      const res = await fetch('/api/sozlamalar/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Barcha ma'lumotlar tozalandi");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMsg(`❌ Xato: ${data.error}`);
      }
    } catch (error) {
      setMsg('❌ Tarmoq xatosi');
    }
    setResetting(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleSeedDemo = async () => {
    if (!confirm("Demo ma'lumotlar qo'shilsinmi? (10 ta mahsulot, 5 ta mijoz, 3 ta sotuv va boshqalar)")) return;
    
    setSeeding(true);
    try {
      const res = await fetch('/api/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ Demo ma'lumotlar qo'shildi! (${data.stats.products} mahsulot, ${data.stats.customers} mijoz, ${data.stats.sales} sotuv)`);
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setMsg(`❌ Xato: ${data.error}`);
      }
    } catch (error) {
      setMsg('❌ Tarmoq xatosi');
    }
    setSeeding(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleTestDB = async () => {
    setTesting(true);
    setMsg('🔍 Database tekshirilmoqda...');
    try {
      const res = await fetch('/api/test-db');
      const data = await res.json();
      if (res.ok) {
        const total = Object.values(data.collections).reduce((a: number, b: any) => a + b, 0);
        setMsg(`✅ Database ishlayapti! ${data.totalCollections} ta kolleksiya, ${total} ta yozuv`);
      } else {
        setMsg(`❌ Database xatosi: ${data.error}`);
      }
    } catch (error) {
      setMsg('❌ Tarmoq xatosi - server javob bermadi');
    }
    setTesting(false);
    setTimeout(() => setMsg(''), 5000);
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">🔍 Database tekshirish</h3>
        <p className="text-xs text-green-600 dark:text-green-400 mb-4">
          MongoDB ulanishi va ma'lumotlar bazasi holatini tekshiring.
        </p>
        <button onClick={handleTestDB} disabled={testing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
          <Database size={16} />
          {testing ? "Tekshirilmoqda..." : "Database holatini tekshirish"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Zaxira nusxa</h3>
        <p className="text-xs text-gray-500 mb-4">Barcha ma'lumotlarni JSON formatida yuklab oling yoki tiklang.</p>
        {msg && (
          <div className={`mb-3 px-3 py-2 border rounded-lg text-xs ${
            msg.startsWith('✅') || msg.includes('yuklandi') || msg.includes('tiklandi') || msg.includes('ishlayapti')
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : msg.startsWith('🔍')
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {msg}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download size={16} />JSON yuklab olish
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">
            <Upload size={16} />{importing ? 'Tiklanmoqda...' : 'JSON yuklash (tiklash)'}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">📦 Demo ma'lumotlar</h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
          Tizimni sinab ko'rish uchun demo ma'lumotlar qo'shing (10 mahsulot, 5 mijoz, 3 sotuv va boshqalar).
        </p>
        <button onClick={handleSeedDemo} disabled={seeding}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
          <Database size={16} />
          {seeding ? "Qo'shilmoqda..." : "Demo ma'lumotlar qo'shish"}
        </button>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Xavfli zona</h3>
        <p className="text-xs text-red-600 dark:text-red-400 mb-4">
          Barcha kirim-chiqim ma'lumotlarini o'chirish. Bu amalni qaytarib bo'lmaydi!
        </p>
        <button onClick={handleReset} disabled={resetting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
          <Database size={16} />
          {resetting ? "O'chirilmoqda..." : "Barcha ma'lumotlarni 0 ga qaytarish"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dokon', label: "Do'kon", icon: Store },
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'foydalanuvchilar', label: 'Foydalanuvchilar', icon: Users },
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'zaxira', label: 'Zaxira', icon: Database },
];

export default function SozlamalarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dokon');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  return (
    <>
      <Header title="Sozlamalar" />
      <div className="pt-14 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-4 lg:p-6">
          {/* Tabs — scrollable on mobile */}
          <div className="overflow-x-auto mb-4 lg:mb-6">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-max min-w-full sm:w-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${tab === id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'dokon' && <DokonTab />}
          {tab === 'telegram' && <TelegramTab />}
          {tab === 'foydalanuvchilar' && <FoydalanuvchilarTab />}
          {tab === 'profil' && <ProfilTab />}
          {tab === 'zaxira' && <ZaxiraTab />}
        </div>
      </div>
    </>
  );
}
