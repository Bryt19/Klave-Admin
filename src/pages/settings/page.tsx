import { useState } from 'react';

const plans = [
  { name: 'Starter', price: 350, features: ['Up to 150 drugs', '3 staff members', 'Basic reports', 'Email support'] },
  { name: 'Growth', price: 850, features: ['Up to 400 drugs', '8 staff members', 'Advanced reports', 'Priority support', 'Batch analytics'] },
  { name: 'Scale', price: 1500, features: ['Unlimited drugs', 'Unlimited staff', 'Full analytics suite', 'Dedicated support', 'API access', 'Custom exports'] },
];

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({ newSignups: true, overdueSubscriptions: true, criticalTickets: true, weeklyReport: false });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTier, setBroadcastTier] = useState('all');
  const [editPlan, setEditPlan] = useState<string | null>(null);
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({ Starter: 350, Growth: 850, Scale: 1500 });
  const [toast, setToast] = useState('');
  const [adminName, setAdminName] = useState('Kwame Admin');
  const [adminEmail, setAdminEmail] = useState('admin@klavora.io');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success">{toast}</div>}

      <div>
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Manage your Super Admin account, notifications, plans, and broadcasts</p>
      </div>

      {/* Account */}
      <div className="rounded-xl p-4 sm:p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Super Admin Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: adminName, set: setAdminName },
            { label: 'Email Address', value: adminEmail, set: setAdminEmail },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] uppercase tracking-wider font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              <input value={f.value} onChange={e => f.set(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
          <input type="password" placeholder="Leave blank to keep current"
            className="w-full h-9 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex justify-end">
          <button onClick={() => showToast('Account details saved.')}
            className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap bg-primary text-white hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl p-4 sm:p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h2>
        {[
          { key: 'newSignups', label: 'New pharmacy signups', desc: 'Get notified when a new pharmacy registers' },
          { key: 'overdueSubscriptions', label: 'Overdue subscriptions', desc: 'Alert when a subscription becomes overdue' },
          { key: 'criticalTickets', label: 'Critical support tickets', desc: 'Notify on new bug reports and urgent requests' },
          { key: 'weeklyReport', label: 'Weekly platform report', desc: 'Summary of signups, MRR, and activity every Monday' },
        ].map(n => (
          <div key={n.key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-[13px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
              <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>{n.desc}</p>
            </div>
            <button onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${notifs[n.key as keyof typeof notifs] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifs[n.key as keyof typeof notifs] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Plan Management */}
      <div className="rounded-xl p-4 sm:p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Plan Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map(p => (
            <div key={p.name} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="font-heading font-700 text-[14px]" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                <button onClick={() => setEditPlan(editPlan === p.name ? null : p.name)}
                  className="text-[11px] text-primary font-body font-semibold cursor-pointer hover:underline whitespace-nowrap">
                  {editPlan === p.name ? 'Done' : 'Edit'}
                </button>
              </div>
              {editPlan === p.name ? (
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-body font-600" style={{ color: 'var(--text-secondary)' }}>Price (GH₵/mo)</label>
                  <input type="number" value={planPrices[p.name]} onChange={e => setPlanPrices(prev => ({ ...prev, [p.name]: Number(e.target.value) }))}
                    className="w-full h-8 px-2 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary mt-1"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              ) : (
                <p className="text-[20px] font-mono font-700 text-emerald-600 dark:text-emerald-400">GH₵{planPrices[p.name]}<span className="text-[12px] font-body text-slate-500">/mo</span></p>
              )}
              <ul className="space-y-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>
                    <i className="ri-check-line text-emerald-600 text-[12px]" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => showToast('Plan changes saved.')}
            className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap bg-primary text-white hover:bg-primary/90">
            Save Plan Changes
          </button>
        </div>
      </div>

      {/* Broadcast */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Broadcast Message</h2>
          <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>Send a banner notification to pharmacies on their next login</p>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Audience</label>
          <select value={broadcastTier} onChange={e => setBroadcastTier(e.target.value)}
            className="h-9 px-3 rounded-lg text-[13px] font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="all">All Pharmacies</option>
            <option value="Starter">Starter Plan Only</option>
            <option value="Growth">Growth Plan Only</option>
            <option value="Scale">Scale Plan Only</option>
            <option value="Trial">Trial Pharmacies Only</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
          <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={4}
            placeholder="e.g. We're rolling out PDF export on April 25th. No action needed on your end."
            className="w-full rounded-lg px-3 py-2 text-[13px] font-body resize-none outline-none focus:ring-1 focus:ring-primary"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex justify-end">
          <button onClick={() => { if (broadcastMsg.trim()) { showToast(`Broadcast sent to ${broadcastTier === 'all' ? 'all pharmacies' : broadcastTier + ' plan'}.`); setBroadcastMsg(''); } }}
            disabled={!broadcastMsg.trim()}
            className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            Send Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}
