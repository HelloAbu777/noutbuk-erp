'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Warehouse, Package, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { title: 'Bosh', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Sotuv', href: '/sotuv', icon: ShoppingCart },
  { title: 'Ombor', href: '/ombor', icon: Warehouse },
  { title: 'Tovarlar', href: '/tovarlar', icon: Package },
  { title: 'Nasiya', href: '/nasiya', icon: CreditCard },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30 flex lg:hidden">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href}
            className={clsx(
              'relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
            )}
            <Icon size={21} />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
