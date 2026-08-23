import { useState } from 'react';

export default function SettingsNotifications() {
  const [notifs, setNotifs] = useState({
    newSignup: true,
    trialExpiring: true,
    trialExpired: true,
    paymentReceived: false,
    paymentFailed: true,
    ticketSubmitted: true,
    ticketUnresolved: true,
    pharmacySuspended: true
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationOptions = [
    { key: 'newSignup', label: 'New pharmacy signup', desc: 'When a new pharmacy registers for a trial.' },
    { key: 'trialExpiring', label: 'Trial expiring in 3 days', desc: 'When a pharmacy is nearing the end of their free trial.' },
    { key: 'trialExpired', label: 'Trial expired', desc: 'When a pharmacy trial period has completely ended.' },
    { key: 'paymentReceived', label: 'Payment received', desc: 'When a subscription payment succeeds.' },
    { key: 'paymentFailed', label: 'Payment failed', desc: 'When an auto-renewal or manual payment fails.' },
    { key: 'ticketSubmitted', label: 'Support ticket submitted', desc: 'When a pharmacy submits a new support or bug ticket.' },
    { key: 'ticketUnresolved', label: 'Support ticket unresolved for 48 hours', desc: 'Alerts when a ticket sits open for more than 48 hours.' },
    { key: 'pharmacySuspended', label: 'Pharmacy suspended automatically', desc: 'When the system auto-suspends a pharmacy due to payment failure or trial expiry.' }
  ];

  return (
    <div className="space-y-6">
      
      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-heading font-700 mb-2" style={{ color: 'var(--text-primary)' }}>Super Admin Notifications</h3>
        <p className="text-[13px] font-body mb-6" style={{ color: 'var(--text-secondary)' }}>
          Select which platform events you want to be notified about. Notifications are sent via email and in-app.
        </p>
        
        <div className="space-y-1">
          {notificationOptions.map(n => (
            <div key={n.key} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-[14px] font-heading font-600 mb-1" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
                <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>{n.desc}</p>
              </div>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in ml-4 shrink-0">
                <input type="checkbox" checked={notifs[n.key as keyof typeof notifs]} onChange={() => toggleNotif(n.key as keyof typeof notifs)}
                  className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ right: notifs[n.key as keyof typeof notifs] ? '0' : '1.25rem', borderColor: notifs[n.key as keyof typeof notifs] ? 'var(--primary)' : 'var(--border)' }} />
                <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                  style={{ background: notifs[n.key as keyof typeof notifs] ? 'var(--primary)' : 'var(--bg)' }}></label>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
