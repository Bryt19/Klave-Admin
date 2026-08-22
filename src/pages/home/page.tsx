import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/base/Badge';
import { pharmacies } from '@/mocks/pharmacies';
import { mrrData } from '@/mocks/subscriptions';
import { supportTickets } from '@/mocks/support';
import { signupChartData } from '@/mocks/activity';

const recentSignups = pharmacies
  .slice()
  .sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime())
  .slice(0, 6);

const recentTickets = supportTickets.slice(0, 5);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      text: 'Good morning, Admin',
      icon: 'ri-sun-line',
      color: 'text-amber-500',
      tag: 'Morning brief',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      text: 'Good afternoon, Admin',
      icon: 'ri-sun-cloudy-line',
      color: 'text-amber-500',
      tag: 'Midday overview',
    };
  }
  return {
    text: 'Good evening, Admin',
    icon: 'ri-moon-clear-line',
    color: 'text-indigo-400',
    tag: 'Daily summary',
  };
}

const totalPharmacies = pharmacies.length;
const activeSubscriptions = pharmacies.filter(p => p.status === 'Active').length;
const trialPharmacies = pharmacies.filter(p => p.status === 'Trial').length;
const openTickets = supportTickets.filter(t => t.status === 'Open').length;
const churned = pharmacies.filter(p => p.status === 'Churned').length;

const maxSignups = Math.max(...signupChartData.map(d => d.signups));

export default function OverviewPage() {
  const navigate = useNavigate();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const greeting = getTimeBasedGreeting();

  const kpiCards = [
    { label: 'Total Pharmacies', value: totalPharmacies, icon: 'ri-store-2-line', color: 'text-sky-600 dark:text-primary', bg: 'bg-sky-500/10', mono: false },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600 dark:text-success', bg: 'bg-emerald-500/10', mono: false },
    { label: 'Trial Pharmacies', value: trialPharmacies, icon: 'ri-time-line', color: 'text-purple-600 dark:text-purple', bg: 'bg-purple-500/10', mono: false },
    { label: 'MRR', value: `GH₵${mrrData.total.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600 dark:text-success', bg: 'bg-emerald-500/10', mono: true },
    { label: 'Open Support Tickets', value: openTickets, icon: 'ri-customer-service-2-line', color: 'text-amber-600 dark:text-warning', bg: 'bg-amber-500/10', mono: false },
    { label: 'Churned This Month', value: churned, icon: 'ri-user-unfollow-line', color: 'text-rose-600 dark:text-danger', bg: 'bg-rose-500/10', mono: false },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header with time-based greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <i className={`${greeting.icon} ${greeting.color} text-[18px]`} />
            </div>
            <h1 className="font-heading font-700 text-[23px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {greeting.text} 👋
            </h1>
          </div>
          <p className="text-[13px] mt-1 font-body" style={{ color: 'var(--text-secondary)' }}>
            Platform health at a glance — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-500" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 transition-all hover:shadow-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-wider font-body font-600" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg}`}>
                <i className={`${card.icon} text-[14px] ${card.color}`} />
              </div>
            </div>
            <p className={`font-700 text-[22px] tracking-tight ${card.mono ? 'font-mono' : 'font-heading'}`} style={{ color: 'var(--text-primary)' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Signups */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Recent Signups</h2>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Latest pharmacies added to the network</p>
            </div>
            <button onClick={() => navigate('/pharmacies')} className="text-[12px] text-sky-600 dark:text-sky-400 font-body font-600 cursor-pointer hover:underline whitespace-nowrap">View all</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentSignups.map((p) => (
              <div
                key={p.id}
                className="p-3.5 sm:px-5 sm:py-3.5 table-row-hover cursor-pointer space-y-2 sm:space-y-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                onClick={() => navigate(`/pharmacies/${p.id}`)}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <span className="text-sky-600 dark:text-sky-400 text-[12px] font-mono font-700">{p.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold font-body truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-[11px] font-body truncate" style={{ color: 'var(--text-secondary)' }}>{p.region}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Badge label={p.plan} />
                    <Badge label={p.status} />
                  </div>
                  <span className="text-[11px] font-mono font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(p.joined)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Support Tickets */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>Recent Support Tickets</h2>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>Pending questions and bug reports</p>
            </div>
            <button onClick={() => navigate('/support')} className="text-[12px] text-sky-600 dark:text-sky-400 font-body font-600 cursor-pointer hover:underline whitespace-nowrap">View all</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentTickets.map((t) => (
              <div
                key={t.id}
                className="p-3.5 sm:px-5 sm:py-3.5 table-row-hover cursor-pointer flex items-start justify-between gap-3"
                style={{ borderBottom: '1px solid var(--border)' }}
                onClick={() => navigate('/support')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap sm:flex-nowrap">
                    <Badge label={t.type} />
                    <p className="text-[12px] font-semibold font-body truncate" style={{ color: 'var(--text-primary)' }}>{t.subject}</p>
                  </div>
                  <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>{t.pharmacyName}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge label={t.status} />
                  <p className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{timeAgo(t.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signups Chart */}
      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>New Signups per Week</h2>
            <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>Last 12 weeks registration trend</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-[12px] font-body font-medium" style={{ color: 'var(--text-secondary)' }}>Signups</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[400px]">
            <div className="flex items-end gap-2 h-36 sm:h-40">
              {signupChartData.map((d, i) => (
                <div
                  key={d.week}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div
                      className="text-[11px] font-mono px-1.5 py-0.5 rounded font-600 shadow-sm"
                      style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
                    >
                      {d.signups}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-md transition-all duration-150"
                    style={{
                      height: `${(d.signups / maxSignups) * 120}px`,
                      background: hoveredBar === i ? '#0EA5E9' : 'rgba(14,165,233,0.4)',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[10px] font-mono font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {d.week.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {signupChartData.map((d) => (
                <span key={d.week} className="flex-1 text-center text-[10px] font-body font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {d.week.includes('W1') ? d.week.split(' ')[1] : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
