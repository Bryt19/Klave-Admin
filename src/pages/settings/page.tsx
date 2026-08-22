import { useState } from 'react';
import SettingsAccount from './components/SettingsAccount';
import SettingsPlatform from './components/SettingsPlatform';
import SettingsNotifications from './components/SettingsNotifications';
import SettingsBilling from './components/SettingsBilling';
import SettingsSecurity from './components/SettingsSecurity';
import SettingsBackup from './components/SettingsBackup';
import SettingsDangerZone from './components/SettingsDangerZone';

const operations = [
  { id: 'account', title: 'Account', desc: 'Manage your profile and sessions', icon: 'ri-shield-user-line' },
  { id: 'platform', title: 'Platform Configuration', desc: 'Trials, plans, and maintenance', icon: 'ri-settings-4-line' },
  { id: 'notifications', title: 'Notifications', desc: 'Configure platform alerts', icon: 'ri-notification-3-line' },
  { id: 'billing', title: 'Billing and Revenue', desc: 'MRR and Paystack setup', icon: 'ri-bank-card-line' },
  { id: 'security', title: 'Security', desc: 'Access control and 2FA', icon: 'ri-lock-2-line' },
  { id: 'backup', title: 'Backup & Restore', desc: 'Server data recovery', icon: 'ri-database-2-line' },
  { id: 'danger', title: 'Danger Zone', desc: 'Destructive platform actions', icon: 'ri-error-warning-line', color: 'var(--danger)' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  const activeOp = operations.find(o => o.id === activeTab);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="font-heading font-700 text-[24px]" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Owner-only operations and platform configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        {/* Operations Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <p className="text-[10px] uppercase tracking-wider font-heading font-700 mb-3 ml-2" style={{ color: 'var(--text-muted)' }}>
            Operations
          </p>
          <div className="rounded-xl overflow-hidden p-2 space-y-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {operations.map(op => {
              const isActive = activeTab === op.id;
              const isDanger = op.id === 'danger';
              return (
                <button
                  key={op.id}
                  onClick={() => setActiveTab(op.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${isActive ? (isDanger ? 'bg-red-500/10' : 'bg-black/5 dark:bg-white/5') : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? (isDanger ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary') : 'bg-[var(--bg)] text-[var(--text-secondary)]'}`}>
                    <i className={`${op.icon} text-[16px]`} style={{ color: !isActive && op.color ? op.color : undefined }}></i>
                  </div>
                  <div>
                    <p className={`text-[13px] font-heading font-600 ${isActive ? (isDanger ? 'text-red-500' : 'text-[var(--text-primary)]') : (op.color ? 'text-red-500' : 'text-[var(--text-secondary)]')}`}>
                      {op.title}
                    </p>
                    <p className="text-[11px] font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {op.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 max-w-4xl overflow-y-auto pr-2 pb-10 space-y-4">
          
          <div className="p-5 rounded-xl mb-4" style={{ background: 'var(--surface)', border: activeTab === 'danger' ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
             <h2 className="text-[16px] font-heading font-700 flex items-center gap-2" style={{ color: activeTab === 'danger' ? 'var(--danger)' : 'var(--text-primary)' }}>
               <i className={`${activeOp?.icon}`}></i>
               {activeOp?.title}
             </h2>
             <p className="text-[13px] mt-1 font-body" style={{ color: 'var(--text-secondary)' }}>{activeOp?.desc}</p>
          </div>

          {activeTab === 'account' && <SettingsAccount />}
          {activeTab === 'platform' && <SettingsPlatform />}
          {activeTab === 'notifications' && <SettingsNotifications />}
          {activeTab === 'billing' && <SettingsBilling />}
          {activeTab === 'security' && <SettingsSecurity />}
          {activeTab === 'backup' && <SettingsBackup />}
          {activeTab === 'danger' && <SettingsDangerZone />}

        </div>
      </div>
    </div>
  );
}
