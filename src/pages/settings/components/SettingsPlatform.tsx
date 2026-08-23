import { useState } from 'react';

export default function SettingsPlatform() {
  const [trialDays, setTrialDays] = useState(14);
  const [trialEndAction, setTrialEndAction] = useState('auto-suspend');
  const [klaveOnePrice, setKlaveOnePrice] = useState(250);
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('We are currently undergoing scheduled maintenance. Please check back in a few hours.');
  const [maintenanceDate, setMaintenanceDate] = useState('');

  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementType, setAnnouncementType] = useState('Info');

  return (
    <div className="space-y-6">
      
      {/* Trial Settings */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-5" style={{ color: 'var(--text-primary)' }}>Trial Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Trial Duration (Days)</label>
            <input type="number" value={trialDays} onChange={e => setTrialDays(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Action at Trial End</label>
            <select value={trialEndAction} onChange={e => setTrialEndAction(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow cursor-pointer"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="auto-suspend">Auto-suspend until payment</option>
              <option value="auto-convert">Auto-convert to paid plan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-5" style={{ color: 'var(--text-primary)' }}>Subscription Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Klave One Monthly Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-mono" style={{ color: 'var(--text-secondary)' }}>GH₵</span>
              <input type="number" value={klaveOnePrice} onChange={e => setKlaveOnePrice(Number(e.target.value))}
                className="w-full h-10 pl-10 pr-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary transition-shadow"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Platform Currency</label>
            <select disabled
              className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow cursor-not-allowed opacity-70"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option>GH₵ - Ghana Cedi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Maintenance Mode</h3>
            <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Lock the platform for all pharmacies</p>
          </div>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in mt-1">
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
              style={{ right: maintenanceMode ? '0' : '1.25rem', borderColor: maintenanceMode ? 'var(--danger)' : 'var(--border)' }} />
            <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
              style={{ background: maintenanceMode ? 'var(--danger)' : 'var(--bg)' }}></label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Maintenance Message</label>
            <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows={3}
              className="w-full p-3 rounded-lg text-[13px] font-body resize-none outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Scheduled Window (Optional)</label>
            <input type="datetime-local" value={maintenanceDate} onChange={e => setMaintenanceDate(e.target.value)}
              className="w-full md:w-1/2 h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      </div>

      {/* Platform Announcement */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-heading font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Platform Announcement</h3>
            <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Broadcast a banner message to all pharmacies</p>
          </div>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in mt-1">
            <input type="checkbox" checked={announcementActive} onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
              style={{ right: announcementActive ? '0' : '1.25rem', borderColor: announcementActive ? 'var(--primary)' : 'var(--border)' }} />
            <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
              style={{ background: announcementActive ? 'var(--primary)' : 'var(--bg)' }}></label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Banner Message</label>
            <textarea value={announcementMsg} onChange={e => setAnnouncementMsg(e.target.value)} rows={3} placeholder="Type your announcement here..."
              className="w-full p-3 rounded-lg text-[13px] font-body resize-none outline-none focus:ring-1 focus:ring-primary transition-shadow"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-heading font-700 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Announcement Type</label>
            <select value={announcementType} onChange={e => setAnnouncementType(e.target.value)}
              className="w-full md:w-1/2 h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary transition-shadow cursor-pointer"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="Info">Info (Blue)</option>
              <option value="Warning">Warning (Yellow)</option>
              <option value="Critical">Critical (Red)</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
}
