import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '@/components/base/Logo';
import ConfirmModal from '@/components/base/ConfirmModal';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { path: '/', label: 'Overview', icon: 'ri-dashboard-line', exact: true },
  { path: '/pharmacies', label: 'Pharmacies', icon: 'ri-store-2-line' },
  { path: '/subscriptions', label: 'Subscriptions', icon: 'ri-bank-card-line' },
  { path: '/support', label: 'Support', icon: 'ri-customer-service-2-line' },
  { path: '/activity', label: 'Activity', icon: 'ri-pulse-line' },
  { path: '/staff', label: 'Staff', icon: 'ri-team-line' },
  { path: '/settings', label: 'Settings', icon: 'ri-settings-3-line' },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  isDark,
  onToggleTheme,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('klavora_auth');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-200 ${
          // On mobile: drawer translation
          mobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full md:translate-x-0'
        } ${
          // On desktop (md:): collapsible width
          collapsed ? 'md:w-[60px]' : 'md:w-[240px]'
        }`}
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Header / Logo */}
        <div
          className={`flex items-center h-14 px-4 shrink-0 justify-between ${
            collapsed ? 'md:justify-center' : ''
          }`}
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="cursor-pointer flex items-center"
            onClick={() => {
              navigate('/');
              handleNavClick();
            }}
          >
            <Logo size="sm" showWordmark={!collapsed || mobileOpen} />
          </div>

          {/* Collapse toggle on desktop */}
          {!mobileOpen && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <i className={`${collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-[18px]`} />
            </button>
          )}

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <i className="ri-close-line text-[18px]" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={handleNavClick}
              onMouseEnter={(e: React.MouseEvent) => { if (collapsed && !mobileOpen) setTooltip({ text: item.label, x: e.clientX, y: e.clientY }); }}
              onMouseMove={(e: React.MouseEvent) => { if (collapsed && !mobileOpen) setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null); }}
              onMouseLeave={() => setTooltip(null)}
              className={({ isActive }) =>
                `relative flex items-center h-10 px-4 gap-3 cursor-pointer transition-colors duration-100 group ${
                  collapsed && !mobileOpen ? 'md:justify-center' : ''
                } ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'hover:bg-primary/5'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#0EA5E9' : 'var(--text-secondary)',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className={`${item.icon} text-[16px]`} />
                  </div>
                  {(!collapsed || mobileOpen) && (
                    <span className="text-[13px] font-medium whitespace-nowrap font-body">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="shrink-0 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center h-10 px-4 gap-3 w-full cursor-pointer transition-colors hover:bg-primary/5 ${
              collapsed && !mobileOpen ? 'md:justify-center' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-[16px]`} />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="text-[13px] font-medium font-body whitespace-nowrap">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center h-10 px-4 gap-3 w-full cursor-pointer transition-colors hover:bg-rose-500/10 text-rose-500 ${
              collapsed && !mobileOpen ? 'md:justify-center' : ''
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <i className="ri-logout-box-r-line text-[16px]" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="text-[13px] font-medium font-body whitespace-nowrap">Sign out</span>
            )}
          </button>

          {/* Founder avatar */}
          <div
            className={`flex items-center h-12 px-4 gap-3 mt-1 ${
              collapsed && !mobileOpen ? 'md:justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary text-[11px] font-mono font-700">KF</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold font-body truncate" style={{ color: 'var(--text-primary)' }}>
                  Founder
                </p>
                <p className="text-[11px] font-body truncate" style={{ color: 'var(--text-secondary)' }}>
                  admin@klavora.io
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Cursor-following tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-body shadow-lg transition-opacity"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            background: 'var(--text-primary)',
            color: 'var(--bg)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Sign Out of Klavora"
        description="Are you sure you want to end your current founder session? You will need to sign in again to access the dashboard."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
