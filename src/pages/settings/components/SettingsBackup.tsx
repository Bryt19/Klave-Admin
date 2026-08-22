import { useState } from 'react';

export default function SettingsBackup() {
  const [pharmacyUuid, setPharmacyUuid] = useState('');
  const [backupFilename, setBackupFilename] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');

  return (
    <div className="space-y-6">
      
      {/* Data Recovery */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Restore Server Backup</h3>
        <p className="text-[12px] font-body mb-5" style={{ color: 'var(--text-secondary)' }}>Decrypt and restore a pharmacy's data from a server backup snapshot file.</p>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pharmacy UUID</label>
            <input type="text" value={pharmacyUuid} onChange={e => setPharmacyUuid(e.target.value)} placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Backup Filename</label>
            <input type="text" value={backupFilename} onChange={e => setBackupFilename(e.target.value)} placeholder="e.g. backup-20231015-123456.enc"
              className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          
          <div className="pt-3">
            {!showRestoreConfirm ? (
              <button onClick={() => setShowRestoreConfirm(true)} disabled={!pharmacyUuid.trim() || !backupFilename.trim()}
                className="h-10 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 text-white cursor-pointer"
                style={{ background: 'var(--primary)', border: '1px solid var(--primary)' }}>
                Initiate Restore
              </button>
            ) : (
              <div className="p-4 rounded-lg space-y-3" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger)' }}>
                <p className="text-[12px] font-heading font-600" style={{ color: 'var(--danger)' }}>
                  Warning: This will overwrite current production data for this pharmacy.
                </p>
                <div className="flex gap-2">
                  <input type="text" value={restoreConfirmText} onChange={e => setRestoreConfirmText(e.target.value)} placeholder="Type RESTORE"
                    className="w-32 h-9 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-danger transition-shadow"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button disabled={restoreConfirmText !== 'RESTORE'}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors disabled:opacity-50 text-white cursor-pointer"
                    style={{ background: 'var(--danger)', border: '1px solid var(--danger)' }}>
                    Execute Restore
                  </button>
                  <button onClick={() => { setShowRestoreConfirm(false); setRestoreConfirmText(''); }}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
