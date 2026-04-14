'use client';
import { useState } from 'react';
import { Phone, CheckCircle, LogOut } from 'lucide-react';

interface TelegramUserAuthProps {
  initialPhone?: string;
  initialName?: string;
  isConnected: boolean;
}

export default function TelegramUserAuth({ initialPhone = '', initialName = '', isConnected }: TelegramUserAuthProps) {
  const [userPhone, setUserPhone] = useState(initialPhone);
  const [userCode, setUserCode] = useState('');
  const [userName, setUserName] = useState(initialName);
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [sessionString, setSessionString] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'connected'>(isConnected ? 'connected' : 'phone');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSendCode = async () => {
    if (!userPhone || userPhone.length < 10) {
      setMsg('❌ To\'g\'ri telefon raqam kiriting (+998901234567)');
      return;
    }
    setSendingCode(true);
    setMsg('');
    try {
      const res = await fetch('/api/telegram-auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneCodeHash(data.phoneCodeHash);
        setSessionString(data.sessionString);
        setStep('code');
        setMsg('✅ Kod yuborildi! Telegramingizni tekshiring');
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch (error) {
      setMsg('❌ Tarmoq xatosi');
    }
    setSendingCode(false);
  };

  const handleVerifyCode = async () => {
    if (!userCode || userCode.length < 5) {
      setMsg('❌ Kodni kiriting');
      return;
    }
    setVerifying(true);
    setMsg('');
    try {
      const res = await fetch('/api/telegram-auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: userPhone,
          code: userCode,
          phoneCodeHash,
          sessionString,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserName(data.userName);
        setStep('connected');
        setMsg('✅ Telegram akkaunt ulandi!');
        setTimeout(() => {
          setMsg('');
          window.location.reload();
        }, 2000);
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch (error) {
      setMsg('❌ Tarmoq xatosi');
    }
    setVerifying(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Telegram Akkaunt</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          step === 'connected'
            ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {step === 'connected' ? '● Ulangan' : '○ Ulanmagan'}
        </span>
      </div>

      {step === 'connected' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500">{userPhone}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Endi mijozlarga sizning nomingizdan avtomatik xabar yuboriladi.
          </p>
        </div>
      ) : step === 'phone' ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Telefon raqamingiz</label>
            <input
              type="tel"
              value={userPhone}
              onChange={e => setUserPhone(e.target.value)}
              placeholder="+998901234567"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Telegram'da ro'yxatdan o'tgan raqam</p>
          </div>
          {msg && (
            <p className={`text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
          <button
            onClick={handleSendCode}
            disabled={sendingCode}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            {sendingCode ? 'Yuborilmoqda...' : 'Kod yuborish'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Telegram'dan kelgan kod</label>
            <input
              type="text"
              value={userCode}
              onChange={e => setUserCode(e.target.value)}
              placeholder="12345"
              maxLength={5}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Telegram'ga yuborilgan 5 raqamli kod</p>
          </div>
          {msg && (
            <p className={`text-xs font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setStep('phone')}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg text-sm"
            >
              Orqaga
            </button>
            <button
              onClick={handleVerifyCode}
              disabled={verifying}
              className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {verifying ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
