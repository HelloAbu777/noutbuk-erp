'use client';
import { useEffect, useState } from 'react';
import { X, Building2, User, Phone, MapPin, TrendingUp, Package, Calendar } from 'lucide-react';
import { getDynamicFontSize, formatNumber } from '@/lib/format';

interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
  createdAt: string;
}

interface Purchase {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  totalAmount: number;
  paidAmount: number;
  date: string;
  note?: string;
}

export default function SupplierProfileModal({ supplier, onClose }: {
  supplier: Supplier;
  onClose: () => void;
}) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tamirotchilar/${supplier._id}/purchases`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setPurchases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [supplier._id]);

  const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const remainingDebt = supplier.totalPurchased - supplier.totalPaid;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {supplier.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.companyName}</h3>
              <p className="text-xs text-gray-500">{supplier.phone}</p>
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
                <TrendingUp size={14} className="text-blue-500" />
                <p className="text-xs text-gray-500">Jami xarid</p>
              </div>
              <p className={`font-bold text-gray-900 dark:text-white ${getDynamicFontSize(supplier.totalPurchased)}`}>
                {formatNumber(supplier.totalPurchased)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-500" />
                <p className="text-xs text-gray-500">To'langan</p>
              </div>
              <p className={`font-bold text-green-600 ${getDynamicFontSize(supplier.totalPaid)}`}>
                {formatNumber(supplier.totalPaid)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-red-500" />
                <p className="text-xs text-gray-500">Qarz</p>
              </div>
              <p className={`font-bold text-red-500 ${getDynamicFontSize(remainingDebt)}`}>
                {formatNumber(remainingDebt)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-gray-500" />
                <p className="text-xs text-gray-500">Mahsulotlar</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{totalItems} ta</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-gray-500">Kompaniya:</span>
              <span className="font-medium text-gray-900 dark:text-white">{supplier.companyName}</span>
            </div>
            {supplier.contactPerson && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400" />
                <span className="text-gray-500">Mas'ul shaxs:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.contactPerson}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span className="text-gray-500">Telefon:</span>
              <span className="font-medium text-gray-900 dark:text-white">{supplier.phone}</span>
            </div>
            {supplier.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-500">Manzil:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-500">Ro'yxatdan:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(supplier.createdAt).toLocaleDateString('uz-UZ')}
              </span>
            </div>
          </div>

          {/* Purchase History */}
          {purchases.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Xarid tarixi</h4>
              <div className="space-y-2">
                {purchases.slice(0, 15).map(p => (
                  <div key={p._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{p.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(p.date).toLocaleDateString('uz-UZ')} • {p.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatNumber(p.totalAmount)} so'm
                        </p>
                        <p className="text-xs text-gray-500">{p.quantity} ta</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Sotib olish: {formatNumber(p.buyPrice)} • Sotuv: {formatNumber(p.sellPrice)}
                      </span>
                      <span className={`font-medium ${p.paidAmount >= p.totalAmount ? 'text-green-600' : 'text-amber-600'}`}>
                        To'langan: {formatNumber(p.paidAmount)}
                      </span>
                    </div>
                    {p.note && (
                      <p className="text-xs text-gray-400 mt-1 italic">Izoh: {p.note}</p>
                    )}
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

          {!loading && purchases.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Hali xarid yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
