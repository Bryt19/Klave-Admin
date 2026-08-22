import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/base/Badge';
import ConfirmModal from '@/components/base/ConfirmModal';
import { subscriptions as allSubs, mrrData, type Subscription } from '@/mocks/subscriptions';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState(allSubs);
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [overrideTarget, setOverrideTarget] = useState<{ sub: Subscription; action: 'extend' | 'cancel' } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = subs.filter(s =>
    (!filterPlan || s.plan === filterPlan) &&
    (!filterStatus || s.status === filterStatus)
  );

  const handleOverride = (_reason?: string) => {
    if (!overrideTarget) return;
    const { sub, action } = overrideTarget;
    setSubs(prev => prev.map(s => s.id === sub.id ? {
      ...s,
      status: action === 'cancel' ? 'Cancelled' : 'Active',
      daysUntilRenewal: action === 'extend' ? s.daysUntilRenewal + 30 : s.daysUntilRenewal,
    } : s));
    showToast(`Subscription ${action === 'extend' ? 'extended' : 'cancelled'} for ${sub.pharmacyName}.`);
    setOverrideTarget(null);
  };

  const summaryStats = [
    { label: 'MRR', value: `GH₵${mrrData.total.toLocaleString()}`, color: 'text-success', mono: true },
    { label: 'Active', value: subs.filter(s => s.status === 'Active').length, color: 'text-success', mono: false },
    { label: 'Expiring Soon', value: subs.filter(s => s.status === 'Expiring').length, color: 'text-warning', mono: false },
    { label: 'Overdue', value: subs.filter(s => s.status === 'Overdue').length, color: 'text-danger', mono: false },
    { label: 'Cancelled', value: subs.filter(s => s.status === 'Cancelled').length, color: 'text-neutral-400', mono: false },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success">{toast}</div>}

      <div>
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Subscriptions</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Manage billing and subscription status across all pharmacies</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {summaryStats.map(s => (
          <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-body font-600 truncate" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className={`font-700 text-[18px] sm:text-[20px] mt-1 ${s.color} ${s.mono ? 'font-mono' : 'font-heading'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {[
          { label: 'Plan', value: filterPlan, set: setFilterPlan, options: ['Starter', 'Growth', 'Scale'] },
          { label: 'Status', value: filterStatus, set: setFilterStatus, options: ['Active', 'Expiring', 'Overdue', 'Cancelled'] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
            className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="">All {f.label}s</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <div className="flex items-center px-3 rounded-lg text-[12px] font-mono font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {filtered.length} records
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
                {['Pharmacy Name', 'Plan', 'Amount (GH₵)', 'Billing Date', 'Status', 'Days Until Renewal', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-body font-600 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/pharmacies/${s.pharmacyId}`)}
                      className="text-[13px] font-body font-medium whitespace-nowrap cursor-pointer hover:text-primary transition-colors text-left"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {s.pharmacyName}
                    </button>
                  </td>
                  <td className="px-4 py-3"><Badge label={s.plan} /></td>
                  <td className="px-4 py-3 text-[13px] font-mono font-700 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">GH₵{s.amount}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{s.billingDate}</td>
                  <td className="px-4 py-3"><Badge label={s.status} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] font-mono font-600 ${s.daysUntilRenewal < 0 ? 'text-danger' : s.daysUntilRenewal <= 7 ? 'text-warning' : 'text-success'}`}>
                      {s.daysUntilRenewal < 0 ? `${Math.abs(s.daysUntilRenewal)}d overdue` : `${s.daysUntilRenewal}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.status !== 'Cancelled' && (
                        <>
                          <button onClick={() => setOverrideTarget({ sub: s, action: 'extend' })}
                            className="h-7 px-2.5 rounded-md text-[11px] font-body font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-success/10 text-success">
                            Extend
                          </button>
                          <button onClick={() => setOverrideTarget({ sub: s, action: 'cancel' })}
                            className="h-7 px-2.5 rounded-md text-[11px] font-body font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-danger/10 text-danger">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!overrideTarget}
        title={overrideTarget?.action === 'extend' ? `Extend subscription for ${overrideTarget?.sub.pharmacyName}?` : `Cancel subscription for ${overrideTarget?.sub.pharmacyName}?`}
        description={overrideTarget?.action === 'extend' ? 'This will add 30 days to the current billing cycle.' : 'This will immediately cancel the subscription and restrict access.'}
        confirmLabel={overrideTarget?.action === 'extend' ? 'Extend 30 Days' : 'Cancel Subscription'}
        confirmVariant={overrideTarget?.action === 'extend' ? 'primary' : 'danger'}
        requireReason
        reasonLabel="Reason for manual override"
        onConfirm={handleOverride}
        onCancel={() => setOverrideTarget(null)}
      />
    </div>
  );
}
