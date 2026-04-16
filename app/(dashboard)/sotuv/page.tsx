'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faCreditCard,
  faHandHoldingDollar,
  faShuffle,
} from '@fortawesome/free-solid-svg-icons';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  CheckCircle,
  Users,
  AlertCircle,
  ScanLine,
  PauseCircle,
  PlayCircle,
  Clock,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  barcode?: string;
  description?: string;
  image?: string;
}

interface CartItem {
  productId: string;
  productName: string;
  sellPrice: number;
  quantity: number;
  stock: number;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  debt: number;
}

type PaymentType = 'naqt' | 'karta' | 'nasiya' | 'aralash';

interface HeldOrder {
  id: string;
  note: string;
  heldAt: string;
  items: CartItem[];
  paymentType: PaymentType;
  selectedCustomer: Customer | null;
  naqtAmount: string;
  kartaAmount: string;
}

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('uz-UZ') + " so'm";
}
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Hozirgina';
  if (diff < 60) return `${diff} daqiqa oldin`;
  return `${Math.floor(diff / 60)} soat oldin`;
}

// ─── Barcode Scanner Modal ────────────────────────────────
function ScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const [errMsg, setErrMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState('');
  const detectedRef = useRef('');

  useEffect(() => {
    let stopped = false;
    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        setScanning(true);
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result) => {
            if (stopped || !result) return;
            const code = result.getText();
            if (detectedRef.current === code) return;
            detectedRef.current = code;
            setLastDetected(code);
            onDetected(code);
            setTimeout(() => { detectedRef.current = ''; }, 1500);
          }
        );
        readerRef.current._controls = controls;
      } catch (e: any) {
        if (!stopped) {
          setErrMsg(
            e?.message?.includes('Permission')
              ? 'Kamera ruxsati berilmadi. Brauzer sozlamalarida ruxsat bering.'
              : "Kamera ochilmadi: " + (e?.message || "Noma'lum xato")
          );
          setScanning(false);
        }
      }
    }
    startScanner();
    return () => {
      stopped = true;
      try { readerRef.current?._controls?.stop(); } catch {}
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-blue-500" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Barkod skanerlash</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {scanning && !errMsg && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-52 h-36">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br" />
                <div className="absolute left-0 right-0 h-0.5 bg-blue-400/80 animate-scan" />
              </div>
            </div>
          )}
          {errMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 p-6 text-center">
              <p className="text-sm text-red-400">{errMsg}</p>
            </div>
          )}
          {!scanning && !errMsg && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Kamera yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3">
          {lastDetected ? (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Aniqlandi!</p>
                <p className="text-xs text-gray-500 font-mono">{lastDetected}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400">Barkodni kameraga tutib turing</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Customer Modal ───────────────────────────────────────
function CustomerModal({
  onSelect,
  onClose,
}: {
  onSelect: (c: Customer) => void;
  onClose: () => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Mijoz tanlash
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ism yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">{search ? 'Topilmadi' : "Ro'yxat bo'sh"}</div>
          ) : (
            filtered.map((c) => (
              <button key={c._id} onClick={() => onSelect(c)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</p>
                </div>
                {c.debt > 0 && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    Qarz: {fmt(c.debt)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Held Orders Panel ────────────────────────────────────
function HeldOrdersPanel({
  orders,
  onRestore,
  onDelete,
  onClose,
}: {
  orders: HeldOrder[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Ochratlar ({orders.length})
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Ochratda buyurtma yo'q</p>
            </div>
          ) : (
            orders.map((order) => {
              const total = order.items.reduce((s, i) => s + i.sellPrice * i.quantity, 0);
              const labels: Record<PaymentType, string> = {
                naqt: 'Naqt', karta: 'Karta', nasiya: 'Nasiya', aralash: 'Aralash',
              };
              return (
                <div key={order.id}
                  className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.note || 'Noma\'lum mijoz'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {timeAgo(order.heldAt)} · {order.items.length} mahsulot · {labels[order.paymentType]}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {total.toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  {/* Item list */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-0.5">
                    {order.items.slice(0, 3).map((item) => (
                      <p key={item.productId}>• {item.productName} × {item.quantity}</p>
                    ))}
                    {order.items.length > 3 && (
                      <p>• ... va yana {order.items.length - 3} ta</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => onRestore(order.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                      <PlayCircle size={13} /> Tiklash
                    </button>
                    <button onClick={() => onDelete(order.id)}
                      className="px-3 py-1.5 text-xs border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Receipt Modal (Chek) ─────────────────────────────────
function SuccessModal({
  total,
  paymentType,
  naqtAmount,
  kartaAmount,
  items,
  customer,
  shopInfo,
  onClose,
}: {
  total: number;
  paymentType: PaymentType;
  naqtAmount?: number;
  kartaAmount?: number;
  items: CartItem[];
  customer: Customer | null;
  shopInfo: { shopName: string; address: string; phone: string; checkText: string };
  onClose: () => void;
}) {
  const labels: Record<PaymentType, string> = {
    naqt: 'Naqt pul', karta: 'Plastik karta', nasiya: 'Nasiya', aralash: 'Aralash',
  };
  const now = new Date();
  const sana = now.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const vaqt = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Sotuv yakunlandi</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Receipt — print target */}
        <div className="overflow-y-auto flex-1">
          <div id="chek-print" className="p-5 font-mono text-xs text-gray-900 dark:text-white">
            {/* Shop info */}
            <div className="text-center mb-3">
              <p className="font-bold text-base">{shopInfo.shopName}</p>
              {shopInfo.address && <p className="text-gray-500 dark:text-gray-400">{shopInfo.address}</p>}
              {shopInfo.phone && <p className="text-gray-500 dark:text-gray-400">{shopInfo.phone}</p>}
            </div>

            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />

            {/* Date/time + customer */}
            <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
              <span>Sana: {sana}</span>
              <span>Vaqt: {vaqt}</span>
            </div>
            {customer && (
              <p className="text-gray-600 dark:text-gray-400 mb-1">Mijoz: {customer.name}</p>
            )}

            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />

            {/* Items */}
            <div className="space-y-1.5 mb-2">
              {items.map((item) => (
                <div key={item.productId}>
                  <div className="flex justify-between">
                    <span className="flex-1 truncate mr-2">{item.productName}</span>
                    <span className="whitespace-nowrap">{item.sellPrice.toLocaleString('uz-UZ')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 pl-2">
                    <span>× {item.quantity}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {(item.sellPrice * item.quantity).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />

            {/* Total */}
            <div className="flex justify-between font-bold text-sm mb-1">
              <span>JAMI:</span>
              <span className="text-blue-600 dark:text-blue-400">{total.toLocaleString('uz-UZ')} so'm</span>
            </div>

            {/* Payment */}
            <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
              <span>To'lov:</span>
              <span>{labels[paymentType]}</span>
            </div>
            {paymentType === 'aralash' && (
              <div className="text-gray-500 dark:text-gray-400 pl-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Naqt:</span><span>{(naqtAmount ?? 0).toLocaleString('uz-UZ')} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Karta:</span><span>{(kartaAmount ?? 0).toLocaleString('uz-UZ')} so'm</span>
                </div>
              </div>
            )}

            {shopInfo.checkText && (
              <>
                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                <p className="text-center text-gray-500 dark:text-gray-400">{shopInfo.checkText}</p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button onClick={handlePrint}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Chop etish
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition-colors">
            Yangi sotuv
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Qaytarish Panel ──────────────────────────────────────
interface TodaySale {
  _id: string;
  items: { productName: string; quantity: number; sellPrice: number }[];
  total: number;
  paymentType: PaymentType;
  naqtAmount?: number;
  kartaAmount?: number;
  customerName?: string;
  date: string;
  status: 'active' | 'returned';
}

function QaytarishPanel({
  shopInfo,
  onClose,
}: {
  shopInfo: { shopName: string; address: string; phone: string; checkText: string };
  onClose: () => void;
}) {
  const [sales, setSales] = useState<TodaySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [printSale, setPrintSale] = useState<TodaySale | null>(null);

  const payLabels: Record<PaymentType, string> = {
    naqt: 'Naqt', karta: 'Karta', nasiya: 'Nasiya', aralash: 'Aralash',
  };

  useEffect(() => {
    fetch('/api/sales?today=true')
      .then((r) => r.json())
      .then((d) => { setSales(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleReturn = async (id: string) => {
    setReturning(id);
    const res = await fetch(`/api/sales/${id}/return`, { method: 'POST' });
    if (res.ok) {
      setSales((prev) => prev.map((s) => s._id === id ? { ...s, status: 'returned' } : s));
    }
    setReturning(null);
    setConfirmId(null);
  };

  const handlePrint = (sale: TodaySale) => {
    setPrintSale(sale);
    setTimeout(() => { window.print(); }, 150);
  };

  const now = new Date();
  const todayLabel = now.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Print target */}
      {printSale && (
        <div id="chek-print" style={{ display: 'none' }} className="p-4 font-mono text-xs text-black bg-white">
          <div className="text-center mb-2">
            <p className="font-bold text-base">{shopInfo.shopName}</p>
            {shopInfo.address && <p>{shopInfo.address}</p>}
            {shopInfo.phone && <p>{shopInfo.phone}</p>}
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <div className="flex justify-between">
            <span>Sana: {new Date(printSale.date).toLocaleDateString('uz-UZ')}</span>
            <span>Vaqt: {new Date(printSale.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {printSale.customerName && <p>Mijoz: {printSale.customerName}</p>}
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          {printSale.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span>{item.productName}</span>
                <span>{item.sellPrice.toLocaleString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between pl-2 text-gray-600">
                <span>× {item.quantity}</span>
                <span>{(item.sellPrice * item.quantity).toLocaleString('uz-UZ')}</span>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <div className="flex justify-between font-bold">
            <span>JAMI:</span><span>{printSale.total.toLocaleString('uz-UZ')} so'm</span>
          </div>
          <div className="flex justify-between">
            <span>To'lov:</span><span>{payLabels[printSale.paymentType]}</span>
          </div>
          {shopInfo.checkText && (
            <>
              <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
              <p className="text-center">{shopInfo.checkText}</p>
            </>
          )}
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <RotateCcw size={17} className="text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Qaytarish</p>
                <p className="text-xs text-gray-400">{todayLabel}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <RotateCcw size={36} className="mb-3 opacity-30" />
                <p className="text-sm">Bugun sotuvlar yo'q</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {sales.map((sale) => {
                  const isExpanded = expanded === sale._id;
                  const isReturned = sale.status === 'returned';
                  const saleTime = new Date(sale.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                  const itemSummary = sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ');

                  return (
                    <div key={sale._id}
                      className={`rounded-xl border transition-colors ${isReturned ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>

                      {/* Card header */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-gray-400">{saleTime}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                isReturned
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                  : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              }`}>
                                {isReturned ? 'Qaytarilgan' : payLabels[sale.paymentType]}
                              </span>
                              {sale.customerName && (
                                <span className="text-xs text-gray-400 truncate">{sale.customerName}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{itemSummary}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {sale.total.toLocaleString('uz-UZ')}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpanded(isExpanded ? null : sale._id)}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            Tarkib
                          </button>
                          <button
                            onClick={() => handlePrint(sale)}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                            <Printer size={13} /> Chek
                          </button>
                          {!isReturned && (
                            confirmId === sale._id ? (
                              <div className="flex items-center gap-1 ml-auto">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Ishonchingiz komilmi?</span>
                                <button
                                  onClick={() => handleReturn(sale._id)}
                                  disabled={returning === sale._id}
                                  className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50">
                                  {returning === sale._id ? '...' : 'Ha'}
                                </button>
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                  Yo'q
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmId(sale._id)}
                                className="ml-auto flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                                <RotateCcw size={13} /> Qaytarish
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Expanded items */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 space-y-1">
                          {sale.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-gray-700 dark:text-gray-300">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                              <span className="text-gray-900 dark:text-white font-medium">{(item.sellPrice * item.quantity).toLocaleString('uz-UZ')}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-bold border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
                            <span className="text-gray-700 dark:text-gray-300">Jami</span>
                            <span className="text-blue-600 dark:text-blue-400">{sale.total.toLocaleString('uz-UZ')} so'm</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────
const OCHRAT_KEY = 'ochrat_orders';

export default function SotuvPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>('naqt');
  const [naqtAmount, setNaqtAmount] = useState('');
  const [kartaAmount, setKartaAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  const [scannerMsg, setScannerMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    total: number; paymentType: PaymentType; naqtAmount?: number; kartaAmount?: number;
    items: CartItem[]; customer: Customer | null;
  } | null>(null);
  const [shopInfo, setShopInfo] = useState({ shopName: "Noutbuk Do'kon", address: '', phone: '', checkText: "Xaridingiz uchun rahmat!" });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

  const productsRef = useRef<Product[]>([]);
  useEffect(() => { productsRef.current = products; }, [products]);

  useEffect(() => {
  }, [status, router]);

  // Load held orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OCHRAT_KEY);
      if (stored) setHeldOrders(JSON.parse(stored));
    } catch {}
  }, []);

  const saveHeldOrders = (orders: HeldOrder[]) => {
    setHeldOrders(orders);
    localStorage.setItem(OCHRAT_KEY, JSON.stringify(orders));
  };

  const loadProducts = useCallback((force = false) => {
    if (!force) {
      try {
        const raw = sessionStorage.getItem('erp_products');
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          if (Date.now() - ts < 90000 && Array.isArray(data) && data.length > 0) {
            setProducts(data);
            setLoadingProducts(false);
            return;
          }
        }
      } catch {}
    }
    setLoadingProducts(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          try { sessionStorage.setItem('erp_products', JSON.stringify({ data, ts: Date.now() })); } catch {}
        }
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      loadProducts();
      fetch('/api/sozlamalar')
        .then((r) => r.json())
        .then((d) => {
          if (d?.shopName !== undefined) {
            setShopInfo({ shopName: d.shopName || "Noutbuk Do'kon", address: d.address || '', phone: d.phone || '', checkText: d.checkText || "Xaridingiz uchun rahmat!" });
          }
        })
        .catch(() => {});
    }
  }, [status, loadProducts]);

  // ── Barcode detected ───────────────────────────────────
  const handleBarcodeDetected = useCallback((barcode: string) => {
    const code = barcode.trim();
    const found = productsRef.current.find(
      (p) => p.barcode && p.barcode.trim() === code
    );
    if (!found) {
      setScannerMsg(`❌ Barkod topilmadi: ${code}`);
      setShowScanner(false);
      setTimeout(() => setScannerMsg(''), 2500);
      return;
    }
    if (found.quantity === 0) {
      setScannerMsg(`⚠️ ${found.name} — omborda yo'q`);
      setShowScanner(false);
      setTimeout(() => setScannerMsg(''), 2500);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === found._id);
      if (existing) {
        if (existing.quantity >= found.quantity) {
          setScannerMsg(`⚠️ ${found.name} — maksimal miqdor`);
          setTimeout(() => setScannerMsg(''), 2000);
          return prev;
        }
        setScannerMsg(`✅ ${found.name} +1`);
        setTimeout(() => setScannerMsg(''), 1500);
        return prev.map((i) =>
          i.productId === found._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      setScannerMsg(`✅ ${found.name} savatga qo'shildi`);
      setTimeout(() => setScannerMsg(''), 1500);
      return [...prev, {
        productId: found._id, productName: found.name,
        sellPrice: found.sellPrice, quantity: 1, stock: found.quantity,
      }];
    });
    setShowScanner(false);
    setError('');
  }, []);

  // ── USB / Bluetooth barcode scanner (klaviatura input) ──
  useEffect(() => {
    let buf = '';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Enter') {
        const code = buf.trim();
        buf = '';
        if (timer) { clearTimeout(timer); timer = null; }
        if (code.length >= 3) handleBarcodeDetected(code);
        return;
      }
      if (e.key.length === 1) {
        buf += e.key;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { buf = ''; }, 300);
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (timer) clearTimeout(timer);
    };
  }, [handleBarcodeDetected]);

  // ── Ochrat helpers ─────────────────────────────────────
  const holdOrder = () => {
    if (cart.length === 0) return;
    const num = heldOrders.length + 1;
    const order: HeldOrder = {
      id: Date.now().toString(),
      note: `Ochrat #${num}`,
      heldAt: new Date().toISOString(),
      items: cart, paymentType, selectedCustomer, naqtAmount, kartaAmount,
    };
    saveHeldOrders([...heldOrders, order]);
    clearCart();
  };

  const restoreOrder = (id: string) => {
    const order = heldOrders.find((o) => o.id === id);
    if (!order) return;
    setCart(order.items);
    setPaymentType(order.paymentType);
    setSelectedCustomer(order.selectedCustomer);
    setNaqtAmount(order.naqtAmount);
    setKartaAmount(order.kartaAmount);
    saveHeldOrders(heldOrders.filter((o) => o.id !== id));
    setShowHeldOrders(false);
    setError('');
  };

  const deleteHeldOrder = (id: string) => {
    saveHeldOrders(heldOrders.filter((o) => o.id !== id));
  };

  // ── Cart helpers ───────────────────────────────────────
  const addToCart = (product: Product) => {
    if (product.quantity === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        productId: product._id, productName: product.name,
        sellPrice: product.sellPrice, quantity: 1, stock: product.quantity,
      }];
    });
    setError('');
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const newQty = i.quantity + delta;
        if (newQty < 1) return null as unknown as CartItem;
        if (newQty > i.stock) return i;
        return { ...i, quantity: newQty };
      }).filter(Boolean)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]); setPaymentType('naqt'); setSelectedCustomer(null);
    setNaqtAmount(''); setKartaAmount(''); setError('');
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.sellPrice * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Payment type change ────────────────────────────────
  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    if (type !== 'nasiya') setSelectedCustomer(null);
    if (type === 'aralash') {
      // Auto-fill: default naqt = cartTotal
      setNaqtAmount(cartTotal.toString());
      setKartaAmount('0');
    } else {
      setNaqtAmount(''); setKartaAmount('');
    }
    setError('');
  };

  // Auto-fill the other field for aralash
  const handleNaqtChange = (val: string) => {
    setNaqtAmount(val);
    const naqt = parseFloat(val) || 0;
    const remaining = Math.max(0, cartTotal - naqt);
    setKartaAmount(remaining.toFixed(0));
  };
  const handleKartaChange = (val: string) => {
    setKartaAmount(val);
    const karta = parseFloat(val) || 0;
    const remaining = Math.max(0, cartTotal - karta);
    setNaqtAmount(remaining.toFixed(0));
  };

  // ── Checkout ───────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { setError("Savat bo'sh"); return; }
    if (paymentType === 'nasiya' && !selectedCustomer) { setShowCustomerModal(true); return; }
    if (paymentType === 'aralash') {
      const n = parseFloat(naqtAmount) || 0;
      const k = parseFloat(kartaAmount) || 0;
      if (Math.abs(n + k - cartTotal) > 1) {
        setError(`Naqt + Karta = ${fmt(n + k)}, lekin jami ${fmt(cartTotal)}`);
        return;
      }
    }

    setSubmitting(true); setError('');
    // cart ni oldin saqlab qo'yamiz — clearCart() dan oldin
    const savedCart = [...cart];
    const savedCustomer = selectedCustomer;
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity })),
          paymentType,
          customerId: selectedCustomer?._id,
          naqtAmount: paymentType === 'aralash' ? parseFloat(naqtAmount) : undefined,
          kartaAmount: paymentType === 'aralash' ? parseFloat(kartaAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Xatolik yuz berdi'); setSubmitting(false); return; }
      setSuccessData({
        total: cartTotal, paymentType,
        naqtAmount: paymentType === 'aralash' ? parseFloat(naqtAmount) : undefined,
        kartaAmount: paymentType === 'aralash' ? parseFloat(kartaAmount) : undefined,
        items: savedCart,
        customer: savedCustomer,
      });
      clearCart(); loadProducts(true);
    } catch { setError("Server bilan bog'lanishda xatolik"); }
    setSubmitting(false);
  };

  // Filter
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q));
  });

  const aralashNaqt = parseFloat(naqtAmount) || 0;
  const aralashKarta = parseFloat(kartaAmount) || 0;
  const aralashRemainder = cartTotal - aralashNaqt - aralashKarta;


  return (
    <>
      <Header title="Sotuv" />

      {showScanner && (
        <ScannerModal onDetected={handleBarcodeDetected}
          onClose={() => { setShowScanner(false); setScannerMsg(''); }} />
      )}
      {showCustomerModal && (
        <CustomerModal
          onSelect={(c) => { setSelectedCustomer(c); setShowCustomerModal(false); }}
          onClose={() => setShowCustomerModal(false)} />
      )}
      {showHeldOrders && (
        <HeldOrdersPanel
          orders={heldOrders}
          onRestore={restoreOrder}
          onDelete={deleteHeldOrder}
          onClose={() => setShowHeldOrders(false)} />
      )}
      {showReturnPanel && (
        <QaytarishPanel shopInfo={shopInfo} onClose={() => setShowReturnPanel(false)} />
      )}
      {successData && (
        <SuccessModal
          total={successData.total}
          paymentType={successData.paymentType}
          naqtAmount={successData.naqtAmount}
          kartaAmount={successData.kartaAmount}
          items={successData.items}
          customer={successData.customer}
          shopInfo={shopInfo}
          onClose={() => setSuccessData(null)} />
      )}

      {/* Mobile tab bar */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex h-10">
        <button onClick={() => setMobileTab('products')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors border-b-2 ${mobileTab === 'products' ? 'text-blue-600 border-blue-500' : 'text-gray-500 border-transparent'}`}>
          <ShoppingCart size={15} /> Mahsulotlar
        </button>
        <button onClick={() => setMobileTab('cart')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors border-b-2 relative ${mobileTab === 'cart' ? 'text-blue-600 border-blue-500' : 'text-gray-500 border-transparent'}`}>
          <ShoppingCart size={15} /> Savat
          {cartCount > 0 && (
            <span className="absolute top-1 right-1/4 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="pt-14 lg:pt-14 h-screen flex overflow-hidden" style={{ paddingTop: undefined }}>
        <div className="pt-10 lg:pt-0 flex flex-1 overflow-hidden w-full">

        {/* ── LEFT: Products ── */}
        <div className={`${mobileTab === 'cart' ? 'hidden' : 'flex'} lg:flex flex-1 flex-col overflow-hidden`}>
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Mahsulot nomi yoki barkod... (Enter — savatga)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    handleBarcodeDetected(search.trim());
                    setSearch('');
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <button onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">
              <ScanLine size={16} /> Kamera
            </button>
            {/* Ochratlar icon button */}
            <button
              onClick={() => setShowHeldOrders(true)}
              title="Ochratlar"
              className="relative p-2.5 border border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors flex-shrink-0">
              <Clock size={18} />
              {heldOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {heldOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Scanner notification */}
          {scannerMsg && (
            <div className="mx-4 mt-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm text-blue-700 dark:text-blue-400 font-medium">
              {scannerMsg}
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ShoppingCart size={48} className="mb-3 opacity-30" />
                <p className="text-sm">{search ? 'Mahsulot topilmadi' : "Mahsulotlar yo'q"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map((p) => {
                  const inCart = cart.find((i) => i.productId === p._id);
                  const outOfStock = p.quantity === 0;
                  return (
                    <button key={p._id} onClick={() => addToCart(p)} disabled={outOfStock}
                      className={[
                        'relative flex flex-col rounded-xl border text-left transition-all overflow-hidden',
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          : inCart
                          ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500 shadow-sm hover:shadow'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm',
                      ].join(' ')}>

                      {/* Cart badge */}
                      {inCart && (
                        <span className="absolute top-2 right-2 z-10 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow">
                          {inCart.quantity}
                        </span>
                      )}

                      {/* Icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg flex items-center justify-center mt-3 mx-3 flex-shrink-0">
                        <ShoppingCart size={18} className="text-blue-500" />
                      </div>

                      {/* Info */}
                      <div className="p-2.5 pt-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight mb-0.5 line-clamp-2">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{p.category}</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {p.sellPrice.toLocaleString('uz-UZ')}
                        </p>
                        <p className={`text-xs mt-0.5 ${outOfStock ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          {outOfStock ? 'Tugagan' : `Qoldiq: ${p.quantity}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className={`${mobileTab === 'products' ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-80 xl:w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}>
          {/* Cart header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Savat</span>
              {cartCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowReturnPanel(true)}
                title="Bugungi sotuvlar / Qaytarish"
                className="p-2 text-orange-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                <RotateCcw size={16} />
              </button>
              {cart.length > 0 && (
                <>
                  <button onClick={holdOrder}
                    title="Ochratga qo'yish"
                    className="p-2 text-amber-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <PauseCircle size={16} />
                  </button>
                  <button onClick={clearCart}
                    title="Savatni tozalash"
                    className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600">
                <ShoppingCart size={40} className="mb-3" />
                <p className="text-sm">Savat bo'sh</p>
                <p className="text-xs mt-1">Mahsulotga bosing yoki skanerlang</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {cart.map((item) => (
                  <div key={item.productId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight flex-1">
                        {item.productName}
                      </p>
                      <button onClick={() => removeFromCart(item.productId)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button onClick={() => changeQty(item.productId, -1)}
                          className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button onClick={() => changeQty(item.productId, 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {(item.sellPrice * item.quantity).toLocaleString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Jami summa:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {cartTotal.toLocaleString('uz-UZ')} so'm
              </span>
            </div>

            {/* Payment type */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">To'lov turi:</p>
              <div className="grid grid-cols-4 gap-1">
                {([
                  { type: 'naqt',    label: 'Naqt',    icon: faMoneyBillWave    },
                  { type: 'karta',   label: 'Karta',   icon: faCreditCard       },
                  { type: 'nasiya',  label: 'Nasiya',  icon: faHandHoldingDollar},
                  { type: 'aralash', label: 'Aralash', icon: faShuffle          },
                ] as { type: PaymentType; label: string; icon: any }[]).map(({ type, label, icon }) => (
                    <button key={type} onClick={() => handlePaymentTypeChange(type)}
                      className={[
                        'py-1.5 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1',
                        paymentType === type
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300',
                      ].join(' ')}>
                      <FontAwesomeIcon icon={icon} className="text-sm" />
                      {label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Aralash fields */}
            {paymentType === 'aralash' && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0 flex items-center gap-1"><FontAwesomeIcon icon={faMoneyBillWave} /> Naqt:</span>
                  <input
                    type="number"
                    value={naqtAmount}
                    onChange={(e) => handleNaqtChange(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 text-right"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0 flex items-center gap-1"><FontAwesomeIcon icon={faCreditCard} /> Karta:</span>
                  <input
                    type="number"
                    value={kartaAmount}
                    onChange={(e) => handleKartaChange(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 text-right"
                    placeholder="0"
                    min="0"
                  />
                </div>
                {/* Remainder indicator */}
                <div className={[
                  'flex items-center justify-between text-xs font-medium pt-1 border-t border-gray-200 dark:border-gray-600',
                  Math.abs(aralashRemainder) < 1 ? 'text-green-600 dark:text-green-400' : 'text-red-500',
                ].join(' ')}>
                  <span>Qoldiq:</span>
                  <span>{Math.abs(aralashRemainder) < 1 ? '✓ Mos' : fmt(Math.abs(aralashRemainder)) + ' yetishmaydi'}</span>
                </div>
              </div>
            )}

            {/* Nasiya customer */}
            {paymentType === 'nasiya' && (
              <div>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
                    <div>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{selectedCustomer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.phone}</p>
                    </div>
                    <button onClick={() => setShowCustomerModal(true)} className="text-xs text-blue-500 hover:underline">
                      O'zgartirish
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowCustomerModal(true)}
                    className="w-full py-2 border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-500 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2">
                    <Users size={14} /> Mijoz tanlash (majburiy)
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Checkout */}
            <button onClick={handleCheckout} disabled={cart.length === 0 || submitting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-gray-500 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saqlanmoqda...</>
              ) : (
                <><CheckCircle size={17} /> Sotuvni yakunlash</>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
