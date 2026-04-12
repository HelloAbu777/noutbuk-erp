'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Warehouse,
  Users,
  CreditCard,
  Truck,
  ShoppingBag,
  Receipt,
  UserCheck,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    title: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Sotuv',
    href: '/sotuv',
    icon: ShoppingCart,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Buyurtmalar',
    href: '/buyurtmalar',
    icon: ClipboardList,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Tovarlar',
    href: '/tovarlar',
    icon: Package,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Ombor',
    href: '/ombor',
    icon: Warehouse,
    roles: ['admin'],
  },
  {
    title: 'Mijozlar',
    href: '/mijozlar',
    icon: Users,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Nasiya',
    href: '/nasiya',
    icon: CreditCard,
    roles: ['admin', 'kassir'],
  },
  {
    title: "Ta'minotchilar",
    href: '/tamirotchilar',
    icon: Truck,
    roles: ['admin'],
  },
  {
    title: 'Xaridlar',
    href: '/xaridlar',
    icon: ShoppingBag,
    roles: ['admin'],
  },
  {
    title: 'Xarajatlar',
    href: '/xarajatlar',
    icon: Receipt,
    roles: ['admin'],
  },
  {
    title: 'Ishchilar',
    href: '/ishchilar',
    icon: UserCheck,
    roles: ['admin'],
  },
  {
    title: 'Hisobotlar',
    href: '/hisobotlar',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    title: 'Xabar',
    href: '/xabar',
    icon: MessageSquare,
    roles: ['admin', 'kassir'],
  },
  {
    title: 'Sozlamalar',
    href: '/sozlamalar',
    icon: Settings,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role as string) || 'kassir';

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-sm">
          Noutbuk ERP
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2">
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
