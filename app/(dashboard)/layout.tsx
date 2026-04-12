import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { SidebarProvider } from '@/lib/sidebar-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="lg:pl-60 pb-16 lg:pb-0">{children}</main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
