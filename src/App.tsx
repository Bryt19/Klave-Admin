import { useState } from 'react';
import { BrowserRouter, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AppRoutes } from './router';
import Sidebar from '@/components/feature/Sidebar';
import Logo from '@/components/base/Logo';
import { useTheme } from '@/hooks/useTheme';

function AppShell({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = localStorage.getItem('klavora_auth') === 'true';
  const isLoginPage = location.pathname === '/login';

  if (!isAuth && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile Top Navigation Bar */}
      <header
        className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b backdrop-blur-md transition-colors"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Open Navigation Menu"
          >
            <i className="ri-menu-2-line text-[20px]" />
          </button>
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <Logo size="sm" showWordmark={true} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle Theme"
          >
            <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-[18px]`} />
          </button>
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-[11px] font-mono font-700">KF</span>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer / Fixed sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        isDark={isDark}
        onToggleTheme={toggle}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-h-[calc(100vh-3.5rem)] md:min-h-screen overflow-y-auto transition-all duration-200 ${
          collapsed ? 'md:ml-[60px]' : 'md:ml-[240px]'
        }`}
      >
        <AppRoutes />
      </main>
    </div>
  );
}

export default function App() {
  const { isDark, toggle } = useTheme();

  return (
    <BrowserRouter>
      <AppShell isDark={isDark} toggle={toggle} />
    </BrowserRouter>
  );
}