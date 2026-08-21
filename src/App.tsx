import { useState } from 'react';
import { BrowserRouter, useLocation, Navigate } from 'react-router-dom';
import { AppRoutes } from './router';
import Sidebar from '@/components/feature/Sidebar';
import { useTheme } from '@/hooks/useTheme';

function AppShell({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAuth = localStorage.getItem('klavora_auth') === 'true';
  const isLoginPage = location.pathname === '/login';

  if (!isAuth && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        isDark={isDark}
        onToggleTheme={toggle}
      />
      <main
        className="flex-1 min-h-screen overflow-y-auto transition-all duration-200"
        style={{ marginLeft: collapsed ? '60px' : '240px' }}
      >
        <AppRoutes />
      </main>
    </div>
  );
}

export default function App() {
  const { isDark, toggle } = useTheme();

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppShell isDark={isDark} toggle={toggle} />
    </BrowserRouter>
  );
}