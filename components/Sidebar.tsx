'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { useSidebar } from '@/lib/sidebar-context';
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Package, Warehouse,
  Users, CreditCard, Truck, ShoppingBag, Receipt, UserCheck,
  BarChart3, MessageSquare, Settings, X,
} from 'lucide-react';

const navItems = [
  { title: 'Bosh sahifa', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'yordamchi'] },
  { title: 'Sotuv', href: '/sotuv', icon: ShoppingCart, roles: ['admin', 'kassir', 'yordamchi'] },
  { title: 'Buyurtmalar', href: '/buyurtmalar', icon: ClipboardList, roles: ['admin', 'kassir', 'yordamchi'] },
  { title: 'Tovarlar', href: '/tovarlar', icon: Package, roles: ['admin', 'yordamchi'] },
  { title: 'Ombor', href: '/ombor', icon: Warehouse, roles: ['admin'] },
  { title: 'Mijozlar', href: '/mijozlar', icon: Users, roles: ['admin', 'kassir', 'yordamchi'] },
  { title: 'Nasiya', href: '/nasiya', icon: CreditCard, roles: ['admin', 'kassir'] },
  { title: "Ta'minotchilar", href: '/tamirotchilar', icon: Truck, roles: ['admin'] },
  { title: 'Xaridlar', href: '/xaridlar', icon: ShoppingBag, roles: ['admin'] },
  { title: 'Xarajatlar', href: '/xarajatlar', icon: Receipt, roles: ['admin'] },
  { title: 'Ishchilar', href: '/ishchilar', icon: UserCheck, roles: ['admin'] },
  { title: 'Hisobotlar', href: '/hisobotlar', icon: BarChart3, roles: ['admin'] },
  { title: 'Xabar', href: '/xabar', icon: MessageSquare, roles: ['admin', 'kassir'] },
  { title: 'Sozlamalar', href: '/sozlamalar', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, close } = useSidebar();
  const role = (session?.user?.role as string) || 'kassir';
  const filtered = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside className={clsx(
        'fixed left-0 top-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Noutbuk ERP</span>
          </div>
          <button onClick={close} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2">
          {filtered.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={close}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
