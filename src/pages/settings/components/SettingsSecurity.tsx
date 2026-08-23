import { useState } from 'react';

export default function SettingsSecurity() {
  const [requireSuperAdminConfirm, setRequireSuperAdminConfirm] = useState(true);
  const [ipToBlock, setIpToBlock] = useState('');
  
  const blockedIPs = [
    { ip: '192.168.1.104', attempts: 12, lastAttempt: '2 hours ago' },
    { ip: '45.33.22.11', attempts: 5, lastAttempt: 'Yesterday' }
  ];

  return (
    <div className="space-y-6">
      
      {/* System Audits & Scripts */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>System Audits & Scripts</h3>
        <p className="text-[12px] font-body mb-5" style={{ color: 'var(--text-secondary)' }}>Run automated security checks and database scripts.</p>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-[13px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Audit User Roles</p>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Scan the database for role/relationship inconsistencies or orphaned accounts.</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Run Audit
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>Fix Staff Passwords</p>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Assigns a temporary password to any staff member in the DB who is missing one.</p>
            </div>
            <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Fix Passwords
            </button>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Access Control</h3>
        <p className="text-[12px] font-body mb-5" style={{ color: 'var(--text-secondary)' }}>Failed admin login attempts and IP blocking</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Block IP Address</label>
            <div className="flex gap-3">
              <input value={ipToBlock} onChange={e => setIpToBlock(e.target.value)} placeholder="e.g. 192.168.1.1"
                className="w-full md:w-64 h-9 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              <button disabled={!ipToBlock.trim()}
                className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                <i className="ri-forbid-line"></i> Block
              </button>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <h4 className="text-[13px] font-heading font-600 mb-3" style={{ color: 'var(--text-primary)' }}>Suspicious Login Attempts (Last 30 Days)</h4>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-600" style={{ color: 'var(--text-secondary)' }}>IP Address</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-600" style={{ color: 'var(--text-secondary)' }}>Failed Attempts</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider font-heading font-600" style={{ color: 'var(--text-secondary)' }}>Last Attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIPs.map((b, i) => (
                    <tr key={i} style={{ borderBottom: i === blockedIPs.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <td className="px-3 py-2.5 text-[12px] font-mono" style={{ color: 'var(--text-primary)' }}>{b.ip}</td>
                      <td className="px-3 py-2.5 text-[12px] font-body" style={{ color: 'var(--danger)' }}>{b.attempts}</td>
                      <td className="px-3 py-2.5 text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>{b.lastAttempt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Access */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Audit Log Access</h3>
            <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Require Super Admin confirmation before any Admin can export audit logs.</p>
          </div>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in mt-1 shrink-0">
            <input type="checkbox" checked={requireSuperAdminConfirm} onChange={(e) => setRequireSuperAdminConfirm(e.target.checked)}
              className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
              style={{ right: requireSuperAdminConfirm ? '0' : '1.25rem', borderColor: requireSuperAdminConfirm ? 'var(--primary)' : 'var(--border)' }} />
            <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
              style={{ background: requireSuperAdminConfirm ? 'var(--primary)' : 'var(--bg)' }}></label>
          </div>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</h3>
        <p className="text-[12px] font-body mb-5" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security to your account.</p>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-32 h-32 rounded-xl flex items-center justify-center shrink-0 border-2 border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
            <i className="ri-qr-code-line text-4xl" style={{ color: 'var(--text-muted)' }}></i>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-[13px] font-body" style={{ color: 'var(--text-primary)' }}>
              Scan this QR code with an authenticator app (like Google Authenticator or Authy) to enable 2FA for your Super Admin account.
            </p>
            <div className="flex gap-3">
              <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap text-white"
                style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
                Enable 2FA
              </button>
              <button className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <i className="ri-download-line"></i> Backup Codes
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
