import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/Components/Common/Sidebar';
import Topbar from '@/Components/Common/Topbar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />

      <div className={collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <div key={pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
