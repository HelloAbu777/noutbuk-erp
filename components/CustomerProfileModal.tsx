'use client';
import { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, CreditCard, ShoppingBag, Calendar, TrendingUp } from 'lucide-react';
import { getDynamicFontSize, formatNumber } from '@/lib/format';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  debt: number;
  createdAt: string;
}

interface Sale {
  _id: string;
  total: number;
  date: string;
  items: Array<{ productName: string; quantity: number; sellPrice: number }>;
}

interface Nasiya {
  _id: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  date: string;
}

export default function CustomerProfileModal({ customer, onClose }: {
  customer: Customer;
  onClose: () => void;
}) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [nasiyas, setNasiyas] = useState<Nasiya[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer sales and nasiya history
    Promise.all([
      fetch(`/api/customers/${customer._id}/sales`).then(r => r.ok ? r.json() : []),
      fetch(`/api/customers/${customer._id}/nasiya`).then(r => r.ok ? r.json() : []),
    ]).then(([salesData, nasiyaData]) => {
      setSales(Array.isArray(salesData) ? salesData : []);
      setNasiyas(Array.isArray(nasiyaData) ? nasiyaData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [customer._id]);

  const totalPurchased = sales.reduce((sum, s) => sum + s.total, 0);
  const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((s2, i) => s2 + i.quantity, 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
              <p className="text-xs text-gray-500">{customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={14} className="text-blue-500" />
                <p className="text-xs text-gray-500">Jami xarid</p>
              </div>
              <p className={`font-bold text-gray-900 dark:text-white ${getDynamicFontSize(totalPurchased)}`}>
                {formatNumber(totalPurchased)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-500" />
                <p className="text-xs text-gray-500">Mahsulotlar</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{totalItems} ta</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={14} className="text-red-500" />
                <p className="text-xs text-gray-500">Qarz</p>
              </div>
              <p className={`font-bold text-red-500 ${getDynamicFontSize(customer.debt)}`}>
                {formatNumber(customer.debt)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-gray-500" />
                <p className="text-xs text-gray-500">Ro'yxatdan</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">
                {new Date(customer.createdAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-500">Ism:</span>
              <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span className="text-gray-500">Telefon:</span>
              <span className="font-medium text-gray-900 dark:text-white">{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-500">Manzil:</span>
                <span className="font-medium text-gray-900 dark:text-white">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Nasiya History */}
          {nasiyas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Nasiya tarixi</h4>
              <div className="space-y-2">
                {nasiyas.map(n => (
                  <div key={n._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{new Date(n.date).toLocaleDateString('uz-UZ')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(n.totalAmount)} so'm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Qoldiq</p>
                      <p className={`text-sm font-bold ${n.remainingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatNumber(n.remainingAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales History */}
          {sales.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Xarid tarixi</h4>
              <div className="space-y-2">
                {sales.slice(0, 10).map(s => (
                  <div key={s._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString('uz-UZ')}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(s.total)} so'm
                      </p>
                    </div>
                    <div className="space-y-1">
                      {s.items.map((item, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
                          {item.productName} × {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Yuklanmoqda...</p>
            </div>
          )}

          {!loading && sales.length === 0 && nasiyas.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Hali xarid yoki nasiya yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
