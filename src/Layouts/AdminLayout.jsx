import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/Components/common/Sidebar';
import Topbar from '@/Components/common/Topbar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
