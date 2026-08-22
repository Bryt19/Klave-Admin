import { useParams, useNavigate } from 'react-router-dom';
import Badge from '@/components/base/Badge';
import { pharmacies } from '@/mocks/pharmacies';
import { subscriptions } from '@/mocks/subscriptions';
import { supportTickets } from '@/mocks/support';

export default function PharmacyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pharmacy = pharmacies.find(p => p.id === id);

  if (!pharmacy) return (
    <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>
      <i className="ri-store-2-line text-4xl mb-3 block text-sky-600" />
      <p className="font-body text-[14px] font-medium">Pharmacy not found.</p>
      <button onClick={() => navigate('/pharmacies')} className="mt-3 text-primary text-[13px] font-medium cursor-pointer hover:underline">Back to Pharmacies</button>
    </div>
  );

  const pharmSubs = subscriptions.filter(s => s.pharmacyId === id);
  const pharmTickets = supportTickets.filter(t => t.pharmacyId === id);

  const stats = [
    { label: 'Drugs', value: pharmacy.drugCount, icon: 'ri-capsule-line', color: 'text-sky-600 dark:text-primary', bg: 'bg-sky-500/10' },
    { label: 'Batches', value: pharmacy.batchCount, icon: 'ri-stack-line', color: 'text-purple-600 dark:text-purple', bg: 'bg-purple-500/10' },
    { label: 'Staff', value: pharmacy.staffCount, icon: 'ri-team-line', color: 'text-emerald-600 dark:text-success', bg: 'bg-emerald-500/10' },
    { label: 'Transactions', value: pharmacy.totalTransactions.toLocaleString(), icon: 'ri-exchange-line', color: 'text-amber-600 dark:text-warning', bg: 'bg-amber-500/10' },
  ];

  const infoRows = [
    { label: 'Owner', value: pharmacy.owner, icon: 'ri-user-line', mono: false },
    { label: 'Phone', value: pharmacy.phone, icon: 'ri-phone-line', mono: true },
    { label: 'Email', value: pharmacy.email, icon: 'ri-mail-line', mono: false },
    { label: 'Region', value: pharmacy.region, icon: 'ri-map-pin-line', mono: false },
    { label: 'Address', value: pharmacy.address, icon: 'ri-building-line', mono: false },
    { label: 'Joined', value: pharmacy.joined, icon: 'ri-calendar-line', mono: true },
    { label: 'Last Active', value: pharmacy.lastActive, icon: 'ri-time-line', mono: true },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/pharmacies')} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-primary/10" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <i className="ri-arrow-left-line text-[14px]" />
        </button>
        <div>
          <h1 className="font-heading font-700 text-[20px]" style={{ color: 'var(--text-primary)' }}>{pharmacy.name}</h1>
          <p className="text-[12px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{pharmacy.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge label={pharmacy.plan} size="sm" />
          <Badge label={pharmacy.status} size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Pharmacy Info</h2>
          <div className="space-y-3 pt-1">
            {infoRows.map(item => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className={`${item.icon} text-[13px]`} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-body font-600" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                  <p className={`text-[13px] font-medium ${item.mono ? 'font-mono' : 'font-body'}`} style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-wider font-body font-600" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <i className={`${s.icon} text-[13px] ${s.color}`} />
                  </div>
                </div>
                <p className="font-heading font-700 text-[24px]" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-heading font-600 text-[13px]" style={{ color: 'var(--text-primary)' }}>Subscription History</h2>
            </div>
            {pharmSubs.length === 0 ? (
              <p className="px-4 py-6 text-[13px] font-body text-center" style={{ color: 'var(--text-secondary)' }}>No subscription records found.</p>
            ) : pharmSubs.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <p className="text-[13px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{s.plan} Plan</p>
                  <p className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>Billing: {s.billingDate}</p>
                </div>
                <p className="text-[14px] font-mono font-700 text-emerald-600 dark:text-emerald-400">GH₵{s.amount}</p>
                <Badge label={s.status} variant={s.status === 'Active' ? 'success' : s.status === 'Overdue' ? 'danger' : s.status === 'Expiring' ? 'warning' : 'neutral'} />
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-heading font-600 text-[13px]" style={{ color: 'var(--text-primary)' }}>Support Tickets</h2>
            </div>
            {pharmTickets.length === 0 ? (
              <p className="px-4 py-6 text-[13px] font-body text-center" style={{ color: 'var(--text-secondary)' }}>No support tickets from this pharmacy.</p>
            ) : pharmTickets.map(t => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-3 table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <p className="text-[13px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{t.subject}</p>
                  <p className="text-[11px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t.description.slice(0, 80)}...</p>
                </div>
                <Badge label={t.status} variant={t.status === 'Open' ? 'warning' : t.status === 'In Progress' ? 'primary' : 'success'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
