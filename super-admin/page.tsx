import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const SuperAdminPage = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('subscriptions');
  const [commandOutput, setCommandOutput] = useState('System Initialized.\nWaiting for command execution...');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandOutput]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/superadmin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (command: string, args: string[] = [], confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    
    setCommandOutput((prev) => `${prev}\n\n$ ${command} ${args.join(' ')}\n...`);
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/superadmin/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, command, args })
      });
      
      const data = await res.json();
      if (data.success) {
        setCommandOutput((prev) => `${prev}\n[SUCCESS]\n${data.output}`);
        toast.success(`Command execution successful`);
      } else {
        setCommandOutput((prev) => `${prev}\n[ERROR]\n${data.output || data.message || 'Failed'}`);
        toast.error(data.message || 'Command execution failed');
      }
    } catch (err: any) {
      setCommandOutput((prev) => `${prev}\n[FATAL ERROR]\n${err.message}`);
      toast.error(err.message || 'Network or execution error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-body relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleAuth} className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 border border-red-500/30">
              <i className="ri-shield-keyhole-fill text-3xl text-red-500"></i>
            </div>
            <h1 className="text-2xl font-bold font-heading text-white tracking-wide">RESTRICTED ACCESS</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Klavora Master Command Center</p>
          </div>
          
          {error && (
            <div className="mb-6 text-sm text-red-200 text-center bg-red-500/20 border border-red-500/30 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <i className="ri-error-warning-fill"></i> {error}
            </div>
          )}
          
          <div className="mb-8">
            <div className="relative group">
              <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-slate-600"
                placeholder="Enter master rotation key"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-login-box-line text-xl"></i>}
            INITIALIZE UPLINK
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body p-4 md:p-6 flex flex-col h-screen overflow-hidden">
      {/* Header (Like Dashboard) */}
      <header className="flex items-center justify-between mb-6 shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <i className="ri-terminal-box-fill text-xl text-red-500"></i>
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-white tracking-tight">Klavora Super Admin</h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              SYSTEM ONLINE
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setIsAuthenticated(false); setPassword(''); }}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-red-500/20"
        >
          <i className="ri-logout-box-r-line"></i> Terminate Session
        </button>
      </header>

      {/* 3-Column Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Column 1: Navigation Sidebar (Left) */}
        <aside className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {[
            { id: 'subscriptions', icon: 'ri-vip-crown-fill', label: 'Subscriptions', desc: 'Billing & Plans' },
            { id: 'pharmacy', icon: 'ri-hospital-fill', label: 'Pharmacy Admin', desc: 'Manage instances' },
            { id: 'system', icon: 'ri-megaphone-fill', label: 'System & Alerts', desc: 'Global settings' },
            { id: 'backups', icon: 'ri-database-2-fill', label: 'Data Recovery', desc: 'Restore backups' },
            { id: 'danger', icon: 'ri-skull-2-fill', label: 'Danger Zone', desc: 'Destructive actions', textClass: 'text-red-400', activeClass: 'bg-red-500/10 border-red-500/50 text-red-400' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left border ${
                activeTab === t.id 
                  ? t.activeClass || 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : `bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:border-white/10 ${t.textClass || 'hover:text-slate-200'}`
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${activeTab === t.id ? (t.id === 'danger' ? 'bg-red-500/20' : 'bg-blue-500/20') : 'bg-white/5'}`}>
                <i className={`${t.icon} text-xl`}></i>
              </div>
              <div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className={`text-[10px] ${activeTab === t.id ? 'opacity-70' : 'opacity-50'}`}>{t.desc}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* Column 2: Main Workspace (Middle) */}
        <main className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 overflow-y-auto custom-scrollbar relative min-w-0">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-3xl"></div>
          
          {activeTab === 'subscriptions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <i className="ri-vip-crown-fill text-xl text-blue-400"></i>
                <h2 className="text-xl font-heading text-white">Subscription Operations</h2>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <CommandCard 
                  title="Extend Account Access" 
                  desc="Extend pharmacy active status by months or days without charging them."
                  icon="ri-time-line"
                  inputs={[{ name: 'email', placeholder: 'Owner Email' }, { name: 'duration', placeholder: 'Duration (e.g. 3m, 90d)' }]}
                  buttonText="Execute Extension"
                  onExecute={(vals: Record<string, string>) => executeCommand('account:extend', [vals.email, vals.duration])}
                />

                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><i className="ri-toggle-fill"></i></div>
                    <h3 className="font-medium text-white">Force Toggle Status</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Bypass billing cycles and manually activate or suspend an account instantly.</p>
                  <div className="flex flex-col gap-3 mt-auto">
                    <input id="act_email" type="email" placeholder="Owner Email" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600" />
                    <div className="flex gap-2">
                      <button onClick={() => executeCommand('account:activate', [(document.getElementById('act_email') as HTMLInputElement).value])} className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 py-2 rounded-xl text-sm font-medium transition-all">Activate</button>
                      <button onClick={() => executeCommand('account:deactivate', [(document.getElementById('act_email') as HTMLInputElement).value])} className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-2 rounded-xl text-sm font-medium transition-all">Suspend</button>
                    </div>
                  </div>
                </div>

                <CommandCard 
                  title="Grant Lifetime Free Tier" 
                  desc="Permanently mark this account as free tier, bypassing all future paywalls."
                  icon="ri-gift-fill"
                  iconClass="text-amber-400 bg-amber-400/10"
                  inputs={[{ name: 'email', placeholder: 'Owner Email' }]}
                  buttonText="Grant Lifetime Access"
                  buttonClass="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20"
                  onExecute={(vals: Record<string, string>) => executeCommand('grant_free_tier', [vals.email], 'Are you sure you want to grant a lifetime free tier?')}
                />
                
                <CommandCard 
                  title="Restore Paid Registration" 
                  desc="Manually trigger the fulfillment webhook for a broken Paystack transaction."
                  icon="ri-refresh-line"
                  inputs={[{ name: 'ref', placeholder: 'Paystack TX Reference' }]}
                  buttonText="Force Restore"
                  onExecute={(vals: Record<string, string>) => executeCommand('restore_paid', [vals.ref])}
                />
              </div>
            </div>
          )}

          {activeTab === 'pharmacy' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <i className="ri-hospital-fill text-xl text-blue-400"></i>
                <h2 className="text-xl font-heading text-white">Pharmacy Administration</h2>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <CommandCard 
                  title="Inspect Instance Details" 
                  desc="Pull comprehensive statistics, user info, and configuration for an instance."
                  icon="ri-search-eye-line"
                  inputs={[{ name: 'id', placeholder: 'Owner Email or Pharmacy ID' }]}
                  buttonText="Inspect Instance"
                  onExecute={(vals: Record<string, string>) => executeCommand('pharmacy:check', [vals.id])}
                />

                <CommandCard 
                  title="Toggle Setting Locks" 
                  desc="Lock or unlock core pharmacy settings (name, address, etc) from being edited."
                  icon="ri-lock-unlock-line"
                  inputs={[{ name: 'id', placeholder: 'Owner Email or Pharmacy ID' }]}
                  buttonText="Toggle Lock State"
                  onExecute={(vals: Record<string, string>) => executeCommand('toggle-edit', [vals.id])}
                />
                
                <CommandCard 
                  title="Manually Create Pharmacy" 
                  desc="Bypass registration and create a pharmacy with a 30-day trial."
                  icon="ri-add-box-fill"
                  iconClass="text-emerald-400 bg-emerald-500/10"
                  inputs={[
                    { name: 'email', placeholder: 'Owner Email' },
                    { name: 'ownerName', placeholder: 'Owner Name (e.g. John Doe)' },
                    { name: 'pharmacyName', placeholder: 'Pharmacy Name (e.g. Johns Pharma)' },
                    { name: 'password', placeholder: 'Password (Optional)' }
                  ]}
                  buttonText="Create Pharmacy"
                  buttonClass="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                  onExecute={(vals: Record<string, string>) => executeCommand('pharmacy:create', [vals.email, `"${vals.ownerName}"`, `"${vals.pharmacyName}"`, vals.password || 'KlavoraAdmin123!'])}
                />
                
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0"><i className="ri-list-unordered"></i></div>
                    <h3 className="font-medium text-white">List All Instances</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Retrieve a lightweight directory of every registered pharmacy.</p>
                  <button onClick={() => executeCommand('cli:list', [])} className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Fetch Directory</button>
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0"><i className="ri-user-search-line"></i></div>
                    <h3 className="font-medium text-white">Audit User Roles</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Scan the database for role/relationship inconsistencies or orphaned accounts.</p>
                  <button onClick={() => executeCommand('verify:roles', [])} className="w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Run Security Audit</button>
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0"><i className="ri-key-2-fill"></i></div>
                    <h3 className="font-medium text-white">Fix Staff Passwords</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Assigns a temporary password to any staff member missing one.</p>
                  <button onClick={() => executeCommand('fix_staff_passwords', [])} className="w-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Execute Fix</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <i className="ri-megaphone-fill text-xl text-blue-400"></i>
                <h2 className="text-xl font-heading text-white">System Alerts & Overrides</h2>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0"><i className="ri-tools-fill"></i></div>
                    <h3 className="font-medium text-white">Global Maintenance Mode</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Force all user sessions to close and display the maintenance splash screen.</p>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => executeCommand('maintenance:on', [], 'Are you sure you want to lock out all active users?')} className="flex-1 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Enable Maintenance</button>
                    <button onClick={() => executeCommand('maintenance:off', [])} className="flex-1 bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-sm font-medium transition-all">Disable</button>
                  </div>
                </div>

                <CommandCard 
                  title="Broadcast Push Notice" 
                  desc="Display a persistent banner on all user dashboards. Available templates: 'upgrade', 'maintenance', 'outage'."
                  icon="ri-broadcast-line"
                  inputs={[{ name: 'template', placeholder: 'Template name (e.g. maintenance)' }]}
                  buttonText="Broadcast Message"
                  onExecute={(vals: Record<string, string>) => executeCommand('notify:system', ['--template', vals.template])}
                />

                <CommandCard 
                  title="Clear Active Notices" 
                  desc="Remove a specific broadcast banner from dashboards."
                  icon="ri-eraser-line"
                  inputs={[{ name: 'template', placeholder: 'Template name to clear' }]}
                  buttonText="Clear Broadcast"
                  onExecute={(vals: Record<string, string>) => executeCommand('notify:clear', ['--template', vals.template])}
                />

                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0"><i className="ri-database-2-fill"></i></div>
                    <h3 className="font-medium text-white">Apply Shift Migration</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 flex-1">Safely applies the Shift Management database migration (adds columns, creates ShiftRecord table).</p>
                  <button onClick={() => executeCommand('shift_migration', [])} className="w-full bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Run Migration</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <i className="ri-database-2-fill text-xl text-blue-400"></i>
                <h2 className="text-xl font-heading text-white">Data Recovery & Backups</h2>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <CommandCard 
                  title="Restore Server Backup" 
                  desc="Decrypt and restore a pharmacy's data from a server backup snapshot file."
                  icon="ri-history-fill"
                  iconClass="text-rose-400 bg-rose-500/10"
                  inputs={[
                    { name: 'pharmacyId', placeholder: 'Target Pharmacy UUID' },
                    { name: 'fileName', placeholder: 'Backup file name (e.g. klavora_backup_...)' }
                  ]}
                  buttonText="Restore Snapshot"
                  buttonClass="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
                  onExecute={(vals: Record<string, string>) => executeCommand('admin_restore', [vals.pharmacyId, vals.fileName], 'WARNING: This will replace the current pharmacy data with the snapshot. Continue?')}
                />
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <i className="ri-skull-2-fill text-xl text-red-500"></i>
                <h2 className="text-xl font-heading text-red-400">Danger Zone</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-5 hover:border-red-500/30 transition-colors flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <i className="ri-delete-bin-7-fill text-red-500"></i>
                      <h3 className="font-medium text-red-400">Total Annihilation (Hard Reset)</h3>
                    </div>
                    <p className="text-xs text-red-300/60 max-w-sm">ERASES ENTIRE DATABASE and seeds a default Klavora test user. Unrecoverable.</p>
                  </div>
                  <button onClick={() => executeCommand('seed', [], 'WARNING: THIS WILL ERASE ALL DATA IN THE DATABASE FOREVER. Are you absolutely sure?')} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest shrink-0">Hard Reset</button>
                </div>
                
                <div className="bg-orange-500/5 rounded-2xl border border-orange-500/20 p-5 hover:border-orange-500/30 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <i className="ri-filter-off-fill text-orange-500"></i>
                      <h3 className="font-medium text-orange-400">Clean DB (Preserve Whitelist)</h3>
                    </div>
                    <p className="text-xs text-orange-300/60 max-w-sm">Deletes ALL data EXCEPT for specific whitelisted development emails.</p>
                  </div>
                  <button onClick={() => executeCommand('clean_db', [], 'WARNING: This deletes all non-whitelisted data. Are you sure?')} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest shrink-0">Selective Clean</button>
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <i className="ri-seedling-fill text-emerald-400"></i>
                      <h3 className="font-medium text-white">Seed Test Inventory</h3>
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm">Injects 20 mock drugs with randomized batches into the test accounts for UI debugging.</p>
                  </div>
                  <button onClick={() => executeCommand('seed_test', [])} className="bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0">Seed Data</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Column 3: Terminal Console (Right Sidebar) */}
        <aside className="w-[400px] shrink-0 bg-[#0d1117] rounded-3xl border border-white/10 p-5 font-mono text-[13px] flex flex-col shadow-2xl relative overflow-hidden group">
          {/* Terminal Header */}
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 opacity-80">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
              </div>
              <span className="text-slate-500 text-xs tracking-wider uppercase font-semibold">Live Console</span>
            </div>
            <button 
              onClick={() => setCommandOutput('Terminal cleared.\nWaiting for command execution...')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear Output"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
          
          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar text-[#4af626] whitespace-pre-wrap break-all leading-relaxed relative z-10 text-xs">
            {commandOutput}
            <div ref={consoleEndRef} />
          </div>
        </aside>
        
      </div>
    </div>
  );
};

// Reusable Form Component for Commands
const CommandCard = ({ title, desc, icon, iconClass = "text-blue-400 bg-blue-500/10", inputs, buttonText, buttonClass = "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20", onExecute }: any) => {
  const [vals, setVals] = useState<Record<string, string>>({});

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <i className={icon || "ri-command-fill"}></i>
        </div>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <p className="text-xs text-slate-400 mb-5 flex-1">{desc}</p>
      
      <div className="flex flex-col gap-3 mt-auto">
        {inputs.map((inp: any) => (
          <input 
            key={inp.name}
            type="text" 
            placeholder={inp.placeholder}
            value={vals[inp.name] || ''}
            onChange={(e) => setVals({ ...vals, [inp.name]: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all" 
          />
        ))}
        <button 
          onClick={() => onExecute(vals)} 
          className={`w-full py-2 rounded-xl text-sm font-medium transition-all border shadow-sm ${buttonClass}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminPage;
