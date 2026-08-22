import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import HelpSupportModal from '@/components/feature/HelpSupportModal';
import UpgradeModal from '@/components/feature/UpgradeModal';
import { syncManager } from '@/utils/syncManager';
import { getPendingSyncItems } from '@/utils/offlineDB';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  ownerOnly?: boolean;
  premiumOnly?: boolean;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/kpi', label: 'KPIs', icon: 'ri-bar-chart-box-line', roles: ['OWNER', 'MANAGER'] },
  { path: '/inventory', label: 'Inventory', icon: 'ri-medicine-bottle-line' },
  { path: '/sell', label: 'Sell', icon: 'ri-shopping-bag-line' },
  { path: '/restock', label: 'Restock', icon: 'ri-add-box-line' },
  { path: '/add-inventory', label: 'Add Inventory', icon: 'ri-inbox-archive-line', roles: ['OWNER', 'MANAGER', 'PHARMACIST'] },
  { path: '/audit-log', label: 'Audit Log', icon: 'ri-file-list-3-line', roles: ['OWNER', 'MANAGER'] },
  { path: '/sales-metrics', label: 'Sales Metrics', icon: 'ri-line-chart-line', roles: ['OWNER', 'MANAGER'] },
  { path: '/staff', label: 'Staff', icon: 'ri-team-line', roles: ['OWNER', 'MANAGER'] },
  { path: '/settings', label: 'Settings', icon: 'ri-settings-3-line', roles: ['OWNER', 'MANAGER'] },
];

export default function Sidebar() {
  const { 
    user, logout, theme, toggleTheme, 
    sidebarCollapsed, setSidebarCollapsed, 
    mobileSidebarOpen, setMobileSidebarOpen
  } = useApp();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  const userRole = user?.role?.toUpperCase() || 'STAFF';
  const navItems = allNavItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    return true;
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [syncItems, setSyncItems] = useState<any[]>([]);

  // Subscribe to syncManager for pendingCount updates
  useEffect(() => {
    const unsubscribe = syncManager.subscribe(async (_status, count) => {
      setPendingCount(count);
      if (showSyncPanel && count > 0) {
        const items = await getPendingSyncItems();
        setSyncItems(items);
      } else if (count === 0) {
        setShowSyncPanel(false);
      }
    });
    return unsubscribe;
  }, [showSyncPanel]);

  const toggleSyncPanel = async () => {
    if (!showSyncPanel) {
      const items = await getPendingSyncItems();
      setSyncItems(items);
    }
    setShowSyncPanel(!showSyncPanel);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    setMobileSidebarOpen(false);
    
    // Navigate first so AppShell unmounts before user is cleared (prevents dashboard flash)
    navigate('/', { state: { justLoggedOut: true } });

    // Small delay to let the route change render, then clear the session
    await new Promise(resolve => setTimeout(resolve, 100));
    logout();
  };

  const closeMobile = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-[310] bg-black/40 backdrop-blur-[2px] md:hidden transition-all duration-300"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-[320] flex flex-col bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-sidebar'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className={`flex items-center h-16 border-b border-border-light dark:border-border-dark flex-shrink-0 ${sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-2'}`}>
          <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="2" width="6" height="20" rx="1.5" fill="#10B981" />
            <rect x="2" y="9" width="20" height="6" rx="1.5" fill="#0EA5E9" />
            <rect x="9" y="9" width="6" height="6" fill="#0284C7" />
          </svg>
          {!sidebarCollapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0 gap-1">
              <div className="flex flex-col min-w-0">
                <span className="hidden md:block font-heading font-700 text-base text-gray-900 dark:text-white tracking-tight leading-tight truncate">Klavora</span>
                {user?.pharmacyName && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-body truncate leading-tight mt-0.5">{user.pharmacyName}</span>
                )}
              </div>
              
              {/* Mobile Close / Desktop Collapse */}
              <button 
                onClick={closeMobile}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                title="Collapse sidebar"
              >
                <i className="ri-arrow-left-s-line text-base"></i>
              </button>
            </div>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Expand sidebar"
            >
              <i className="ri-arrow-right-s-line text-base"></i>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className={`flex-1 py-3 ${sidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto scrollbar-hide'}`}>
          {navItems.map(item => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `relative flex items-center h-10 mx-2 rounded-lg transition-all duration-150 cursor-pointer group
                  ${sidebarCollapsed ? 'justify-center px-0' : 'px-3 gap-3'}
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full -ml-2"></span>
                    )}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-base`}></i>
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium font-body whitespace-nowrap">{item.label}</span>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-border-light dark:border-border-dark py-3 flex-shrink-0 bg-surface-light dark:bg-surface-dark z-10">
          {/* Help & Support */}
          <button
            onClick={() => { setShowHelp(true); closeMobile(); }}
            className={`flex items-center h-10 mx-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer group
              ${sidebarCollapsed ? 'justify-center px-0 w-12' : 'px-3 gap-3 w-[calc(100%-16px)]'}`}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-customer-service-2-line text-base"></i>
            </div>
            {!sidebarCollapsed && <span className="text-sm font-body whitespace-nowrap">Help &amp; Support</span>}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center h-10 mx-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer group
              ${sidebarCollapsed ? 'justify-center px-0 w-12' : 'px-3 gap-3 w-[calc(100%-16px)]'}`}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className={`${theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'} text-base`}></i>
            </div>
            {!sidebarCollapsed && <span className="text-sm font-body">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          {/* Sync Queue Counter */}
          {pendingCount > 0 && (
            <div className="relative">
              <button
                onClick={toggleSyncPanel}
                className={`flex items-center h-10 mx-2 rounded-lg text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer group
                  ${sidebarCollapsed ? 'justify-center px-0 w-12' : 'px-3 gap-3 w-[calc(100%-16px)]'}`}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative">
                  <i className="ri-refresh-line text-base animate-pulse"></i>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                </div>
                {!sidebarCollapsed && (
                  <span className="text-sm font-heading font-600 whitespace-nowrap">
                    {pendingCount} Pending Sync{pendingCount !== 1 && 's'}
                  </span>
                )}
              </button>

              {/* Sync Panel Popup */}
              {showSyncPanel && (
                <div className={`absolute bottom-0 mb-12 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-xl rounded-xl p-3 z-50 flex flex-col gap-2 max-h-64 overflow-y-auto ${sidebarCollapsed ? 'left-14 w-64' : 'left-4 w-[calc(100%-16px)]'}`}>
                  <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-2 mb-1">
                    <span className="text-xs font-heading font-700 text-gray-900 dark:text-white uppercase tracking-wider">Offline Queue</span>
                    <button onClick={() => syncManager.syncNow()} className="text-xs text-primary-500 hover:text-primary-600 font-heading font-600 cursor-pointer bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded">Sync Now</button>
                  </div>
                  {syncItems.length === 0 ? (
                    <div className="text-xs text-gray-500 py-4 text-center">No pending items</div>
                  ) : (
                    syncItems.map(item => (
                      <div key={item.id} className="flex flex-col text-xs p-2 bg-gray-50 dark:bg-white/5 rounded border border-gray-100 dark:border-gray-800">
                        <span className="font-600 text-gray-900 dark:text-white mb-0.5">{item.operation_type.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                        {item.status === 'failed' && <span className="text-danger-500 mt-1">Failed ({item.retry_count} retries)</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => { setShowLogoutModal(true); closeMobile(); }}
            className={`flex items-center h-10 mx-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 hover:text-danger-500 transition-all cursor-pointer group
              ${sidebarCollapsed ? 'justify-center px-0 w-12' : 'px-3 gap-3 w-[calc(100%-16px)]'}`}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-logout-box-line text-base"></i>
            </div>
            {!sidebarCollapsed && <span className="text-sm font-body whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {showHelp && <HelpSupportModal onClose={() => setShowHelp(false)} />}
      {upgradeFeature && <UpgradeModal featureName={upgradeFeature} onClose={() => setUpgradeFeature(null)} />}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-sm rounded-card border border-border-light dark:border-border-dark shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-logout-box-line text-2xl text-danger-500"></i>
              </div>
              <h3 className="text-xl font-heading font-700 text-gray-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-8">
                Are you sure you want to sign out of Klavora? You will need your credentials to log back in.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-btn bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-btn text-sm font-medium font-body transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-btn bg-danger-500 hover:bg-danger-600 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Logging Out Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-6">
            <i className="ri-logout-box-line text-3xl text-primary-500 animate-pulse"></i>
          </div>
          <h2 className="text-xl font-heading font-700 text-gray-900 dark:text-white mb-2">Signing you out</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Safely closing your workspace...</p>
          <div className="mt-8 flex gap-1">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </>
  );
}
