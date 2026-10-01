import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/Components/Common/Sidebar';
import Topbar from '@/Components/Common/Topbar';
import AdminAssistant from '@/Components/AI/AdminAssistant';
import BackToTop from '@/Components/Common/BackToTop';
import './AdminLayout.css';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="admin-shell min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />

      <div className={collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 xl:p-7">
          <div key={pathname} className="page-transition mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
      <AdminAssistant />
      <BackToTop />
    </div>
  );
}
