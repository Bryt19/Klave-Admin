import { useState } from 'react';

export default function SettingsDangerZone() {
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Utilities */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>System Utilities & Overrides</h3>
        <p className="text-[12px] font-body mb-6" style={{ color: 'var(--text-secondary)' }}>Scripts for development, testing, and migration.</p>
        
        <div className="space-y-5">
          {/* Apply Shift Migration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Apply Shift Migration</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Safely applies the Shift Management database migration (adds columns and creates the ShiftRecord table).</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Run Migration
            </button>
          </div>

          {/* Seed Test Inventory */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Seed Test Inventory</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Injects 20 mock drugs with randomized batches into the test accounts for UI debugging and testing.</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Inject Mock Data
            </button>
          </div>
        </div>
      </div>

      {/* Extreme Danger Zone */}
      <div className="rounded-xl p-6 border-2" style={{ background: 'rgba(239, 68, 68, 0.02)', borderColor: 'var(--danger)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1 flex items-center gap-2" style={{ color: 'var(--danger)' }}>
          <i className="ri-error-warning-fill text-lg"></i> Extreme Danger Zone
        </h3>
        <p className="text-[12px] font-body mb-6" style={{ color: 'var(--text-secondary)' }}>
          Highly destructive actions that affect the entire Klavora platform database. Proceed with extreme caution.
        </p>
        
        <div className="space-y-5">
          {/* Export All Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Export All Platform Data</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Downloads everything across all pharmacies in a structured format. Requires password confirmation.</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 shrink-0 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}>
              Export Data
            </button>
          </div>

          {/* Purge Inactive Trials */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex-1">
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Purge Inactive Trial Accounts</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Permanently deletes pharmacy accounts that signed up for trial but never completed setup and have been inactive for more than 90 days.</p>
              
              {showPurgeConfirm && (
                <div className="mt-3 flex gap-2">
                  <input type="text" value={purgeConfirmText} onChange={e => setPurgeConfirmText(e.target.value)} placeholder="Type CONFIRM"
                    className="w-32 h-9 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-danger transition-shadow"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button disabled={purgeConfirmText !== 'CONFIRM'}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 text-white cursor-pointer"
                    style={{ background: 'var(--danger)', border: '1px solid var(--danger)' }}>
                    Purge Now
                  </button>
                  <button onClick={() => { setShowPurgeConfirm(false); setPurgeConfirmText(''); }}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {!showPurgeConfirm && (
              <button onClick={() => setShowPurgeConfirm(true)}
                className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors shrink-0 cursor-pointer"
                style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                Purge Accounts
              </button>
            )}
          </div>

          {/* Reset Platform Announcement */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Clear Active Notices</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Clears any active broadcast banner immediately across all user dashboards.</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 shrink-0 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface)' }}>
              Clear Notices
            </button>
          </div>

          {/* Selective Clean DB */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex-1">
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Selective Clean DB</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Deletes all data in the database except for specific whitelisted development emails.</p>
              
              {showCleanConfirm && (
                <div className="mt-3 flex gap-2">
                  <input type="text" value={cleanConfirmText} onChange={e => setCleanConfirmText(e.target.value)} placeholder="Type CLEAN"
                    className="w-32 h-9 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-danger transition-shadow"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button disabled={cleanConfirmText !== 'CLEAN'}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 text-white cursor-pointer"
                    style={{ background: 'var(--danger)', border: '1px solid var(--danger)' }}>
                    Execute Clean
                  </button>
                  <button onClick={() => { setShowCleanConfirm(false); setCleanConfirmText(''); }}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {!showCleanConfirm && (
              <button onClick={() => setShowCleanConfirm(true)}
                className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors shrink-0 cursor-pointer"
                style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                Clean DB
              </button>
            )}
          </div>

          {/* Hard Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--danger)' }}>Total Annihilation / Hard Reset</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Erases the entire database forever and seeds a default Klavora test user. Highly destructive.</p>
              
              {showResetConfirm && (
                <div className="mt-3 flex gap-2">
                  <input type="text" value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value)} placeholder="Type DESTROY"
                    className="w-32 h-9 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-danger transition-shadow"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button disabled={resetConfirmText !== 'DESTROY'}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 text-white cursor-pointer"
                    style={{ background: 'var(--danger)', border: '1px solid var(--danger)' }}>
                    Execute Reset
                  </button>
                  <button onClick={() => { setShowResetConfirm(false); setResetConfirmText(''); }}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {!showResetConfirm && (
              <button onClick={() => setShowResetConfirm(true)}
                className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors shrink-0 cursor-pointer text-white"
                style={{ background: 'var(--danger)', border: '1px solid var(--danger)' }}>
                Hard Reset
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
