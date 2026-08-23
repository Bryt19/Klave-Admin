import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/base/Badge';
import { pharmacies, type Pharmacy } from '@/mocks/pharmacies';
import PharmacyDrawer from '@/pages/pharmacies/components/PharmacyDrawer';
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

function formatTicketTime(d: string) {
  const dateObj = new Date(d);
  const diffMs = Date.now() - dateObj.getTime();
  const hours = diffMs / 3600000;

  if (hours < 24) {
    const h = Math.floor(hours);
    return h < 1 ? 'Just now' : `${h}h ago`;
  }

  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

const activeSubscriptions = pharmacies.filter((p) => p.status === 'Active').length;
const trialPharmacies = pharmacies.filter((p) => p.status === 'Trial').length;
const openTickets = supportTickets.filter((t) => t.status === 'Open').length;

const maxSignups = Math.max(...signupChartData.map((d) => d.signups));

export default function OverviewPage() {
  const navigate = useNavigate();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [timeRange, setTimeRange] = useState('7 Days');
  const greeting = getTimeBasedGreeting();

  const kpiCards = [
    {
      label: 'MRR',
      value: `GH₵${mrrData.total.toLocaleString()}`,
      icon: 'ri-money-dollar-circle-line',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      mono: true,
      description: 'Total Monthly Recurring Revenue generated from active paying pharmacy subscriptions.',
    },
    {
      label: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: 'ri-checkbox-circle-line',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      mono: false,
      description: 'Total number of pharmacies currently operating with an active, paid recurring plan.',
    },
    {
      label: 'Trial Pharmacies',
      value: trialPharmacies,
      icon: 'ri-time-line',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      mono: false,
      description: 'Pharmacies currently evaluating Klavora on a free trial period before subscription.',
    },
    {
      label: 'Open Support Tickets',
      value: openTickets,
      icon: 'ri-customer-service-2-line',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      mono: false,
      description: 'Pending customer inquiries, help desk tickets, and bug reports awaiting staff response.',
    },
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
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-500"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* KPI Cards — EXACT 4 CARDS with hover info tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="relative rounded-xl p-4 sm:p-5 transition-all hover:shadow-sm flex flex-col justify-between"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-body font-700 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {card.label}
                </p>

                {/* Interactive Info Icon with Tooltip */}
                <div className="relative group/info flex items-center">
                  <i className="ri-information-line text-[14px] cursor-help transition-colors text-slate-400 hover:text-sky-500 shrink-0" />

                  {/* Floating tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/info:block w-52 p-2.5 rounded-lg text-[11px] leading-snug font-body shadow-xl z-50 pointer-events-none transition-all border border-slate-700/50 bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100">
                    {card.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                  </div>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.bg}`}>
                <i className={`${card.icon} text-[16px] ${card.color}`} />
              </div>
            </div>

            <p className={`font-700 text-[26px] tracking-tight ${card.mono ? 'font-mono' : 'font-heading'}`} style={{ color: 'var(--text-primary)' }}>
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
              <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>
                Recent Signups
              </h2>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>
                Latest pharmacies added to the network
              </p>
            </div>
            <button
              onClick={() => navigate('/pharmacies')}
              className="text-[12px] text-sky-600 dark:text-sky-400 font-body font-600 cursor-pointer hover:underline whitespace-nowrap"
            >
              View all
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentSignups.map((p) => (
              <div
                key={p.id}
                className="p-3.5 sm:px-5 sm:py-3.5 table-row-hover cursor-pointer space-y-2 sm:space-y-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                onClick={() => setSelectedPharmacy(p)}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <span className="text-sky-600 dark:text-sky-400 text-[12px] font-mono font-700">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold font-body truncate" style={{ color: 'var(--text-primary)' }}>
                      {p.name}
                    </p>
                    <p className="text-[11px] font-body truncate" style={{ color: 'var(--text-secondary)' }}>
                      {p.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Badge label={p.plan} />
                    {/* Render status badge only if different from plan to prevent duplicate 'Trial' badges */}
                    {p.status !== p.plan && <Badge label={p.status} />}
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
              <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>
                Recent Support Tickets
              </h2>
              <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>
                Pending questions and bug reports
              </p>
            </div>
            <button
              onClick={() => navigate('/support')}
              className="text-[12px] text-sky-600 dark:text-sky-400 font-body font-600 cursor-pointer hover:underline whitespace-nowrap"
            >
              View all
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentTickets.map((t) => (
              <div
                key={t.id}
                className="p-3.5 sm:px-5 sm:py-3.5 table-row-hover cursor-pointer flex items-center justify-between gap-3"
                style={{ borderBottom: '1px solid var(--border)' }}
                onClick={() => navigate('/support')}
              >
                <div className="flex-1 min-w-0">
                  {/* Pharmacy Name (Most Visible) + Ticket Type Badge */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap sm:flex-nowrap">
                    <h3 className="text-[14px] font-700 font-heading truncate" style={{ color: 'var(--text-primary)' }}>
                      {t.pharmacyName}
                    </h3>
                    <Badge label={t.type} />
                  </div>
                  {/* Ticket Subject */}
                  <p className="text-[12px] font-medium font-body truncate" style={{ color: 'var(--text-secondary)' }}>
                    {t.subject}
                  </p>
                </div>

                {/* Date Display: Formatted Date if > 24 hours, relative time if <= 24 hours */}
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-mono font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {formatTicketTime(t.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics & Quick Links (70/30 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Signups Chart (70%) */}
        <div className="lg:col-span-8 rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
            <div>
              <h2 className="font-heading font-600 text-[14px]" style={{ color: 'var(--text-primary)' }}>
                New Signups
              </h2>
              <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Registration trend analysis
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Toggles */}
              <div className="flex items-center p-0.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                {['Today', '7 Days', '30 Days'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-[11px] font-medium font-body rounded-md transition-all ${
                      timeRange === range
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-[12px] font-body font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Signups
                </span>
              </div>
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

        {/* Quick Links (30%) */}
        <div className="lg:col-span-4 rounded-xl p-4 sm:p-5 flex flex-col" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-heading font-600 text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Links
          </h2>
          <div className="flex-1 flex flex-col gap-3">
            {[
              { label: 'View All Pharmacies', icon: 'ri-store-2-line', path: '/pharmacies', color: 'text-sky-500' },
              { label: 'Manage Subscriptions', icon: 'ri-bank-card-line', path: '/subscriptions', color: 'text-emerald-500' },
              { label: 'Support Tickets', icon: 'ri-customer-service-2-line', path: '/support', color: 'text-purple-500' },
              { label: 'Platform Settings', icon: 'ri-settings-4-line', path: '/settings', color: 'text-slate-500' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm ${link.color}`}>
                  <i className={`${link.icon} text-[16px]`} />
                </div>
                <span className="text-[13px] font-body font-500 flex-1" style={{ color: 'var(--text-primary)' }}>
                  {link.label}
                </span>
                <i className="ri-arrow-right-s-line text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedPharmacy && (
        <PharmacyDrawer
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </div>
  );
}
