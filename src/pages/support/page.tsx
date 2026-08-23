import { useState } from 'react';
import Badge from '@/components/base/Badge';
import { supportTickets as allTickets, type SupportTicket, type TicketStatus } from '@/mocks/support';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState(allTickets);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = tickets.filter(t =>
    (!filterType || t.type === filterType) &&
    (!filterStatus || t.status === filterStatus) &&
    (!search || t.pharmacyName.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusChange = (status: TicketStatus) => {
    if (!selected) return;
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status } : t));
    setSelected(prev => prev ? { ...prev, status } : null);
    showToast(`Ticket status updated to ${status}`);
  };

  const handleReply = () => {
    if (!reply.trim() || !selected) return;
    const newReply = { id: `R${Date.now()}`, author: 'Super Admin', isFounder: true, message: reply, timestamp: new Date().toISOString() };
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, replies: [...t.replies, newReply] } : t));
    setSelected(prev => prev ? { ...prev, replies: [...prev.replies, newReply] } : null);
    setReply('');
    showToast('Reply sent.');
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success">{toast}</div>}
      
      <div className="mb-4 sm:mb-5">
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Support</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>{tickets.filter(t => t.status === 'Open').length} open tickets</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left: ticket list (hidden on mobile if a ticket is selected) */}
        <div
          className={`lg:w-[380px] shrink-0 flex flex-col rounded-xl overflow-hidden ${
            selected ? 'hidden lg:flex' : 'flex'
          }`}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="p-3 space-y-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: 'var(--text-secondary)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full h-8 pl-8 pr-3 rounded-lg text-[12px] font-body outline-none focus:ring-1 focus:ring-primary"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="flex-1 h-8 px-2 rounded-lg text-[12px] font-body font-medium outline-none cursor-pointer"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Types</option>
                <option>Bug Report</option><option>Support Request</option><option>Feature Request</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 h-8 px-2 rounded-lg text-[12px] font-body font-medium outline-none cursor-pointer"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Status</option>
                <option>Open</option><option>In Progress</option><option>Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-none">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>No tickets match your filters.</div>
            ) : filtered.map(t => (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className={`px-4 py-3 cursor-pointer transition-colors ${selected?.id === t.id ? 'bg-primary/10' : 'table-row-hover'}`}
                style={{ borderBottom: '1px solid var(--border)', borderLeft: selected?.id === t.id ? '3px solid #0EA5E9' : '3px solid transparent' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge label={t.type} />
                  <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{timeAgo(t.date)}</span>
                </div>
                <p className="text-[13px] font-body font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.subject}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>{t.pharmacyName}</p>
                  <Badge label={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: ticket detail (hidden on mobile if no ticket is selected) */}
        {selected ? (
          <div className="flex-1 flex flex-col xl:flex-row gap-4 min-w-0">
            {/* Main detail */}
            <div className="flex-1 flex flex-col rounded-xl overflow-hidden min-w-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {/* Mobile Back Button & Header */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-start justify-between gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => setSelected(null)}
                    className="lg:hidden mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    style={{ color: 'var(--text-primary)' }}
                    title="Back to tickets list"
                  >
                    <i className="ri-arrow-left-line text-[16px]" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={selected.type} size="sm" />
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{selected.id}</span>
                    </div>
                    <h2 className="font-heading font-600 text-[15px]" style={{ color: 'var(--text-primary)' }}>{selected.subject}</h2>
                  </div>
                </div>

                <select
                  value={selected.status}
                  onChange={e => handleStatusChange(e.target.value as TicketStatus)}
                  className="h-8 px-2.5 sm:px-3 rounded-lg text-[12px] font-body font-medium outline-none cursor-pointer shrink-0"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <option>Open</option><option>In Progress</option><option>Resolved</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[calc(100vh-340px)] lg:max-h-none">
                {/* Original message */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
                      <span className="text-[10px] font-mono font-700">{selected.pharmacyOwner.slice(0,2).toUpperCase()}</span>
                    </div>
                    <span className="text-[12px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.pharmacyOwner}</span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{timeAgo(selected.date)}</span>
                  </div>
                  <p className="text-[13px] font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>
                  {selected.screenshotUrl && (
                    <img src={selected.screenshotUrl} alt="Screenshot" className="mt-3 rounded-lg w-full max-h-48 object-cover object-top" />
                  )}
                </div>

                {/* Replies */}
                {selected.replies.map(r => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl ${r.isFounder ? 'sm:ml-8' : 'sm:mr-8'}`}
                    style={{
                      background: r.isFounder ? 'rgba(14,165,233,0.06)' : 'var(--bg)',
                      border: `1px solid ${r.isFounder ? 'rgba(14,165,233,0.25)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.isFounder ? 'bg-sky-500/20 text-sky-700' : 'bg-amber-500/20 text-amber-700'}`}>
                        <span className="text-[10px] font-mono font-700">{r.author.slice(0,2).toUpperCase()}</span>
                      </div>
                      <span className="text-[12px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{r.author}</span>
                      {r.isFounder && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold">Super Admin</span>}
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{timeAgo(r.timestamp)}</span>
                    </div>
                    <p className="text-[13px] font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.message}</p>
                  </div>
                ))}

                {/* Internal notes */}
                {selected.internalNotes && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-lock-line text-[13px] text-purple-700 dark:text-purple-300" />
                      <span className="text-[11px] uppercase tracking-wider font-body font-700 text-purple-700 dark:text-purple-300">Internal Note (Super Admin Only)</span>
                    </div>
                    <p className="text-[13px] font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.internalNotes}</p>
                  </div>
                )}
              </div>

              {/* Reply box */}
              <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={3}
                  placeholder="Write a reply to the pharmacy..."
                  className="w-full rounded-lg px-3 py-2 text-[13px] font-body resize-none outline-none focus:ring-1 focus:ring-primary mb-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={!reply.trim()}
                    className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors whitespace-nowrap bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Pharmacy info panel */}
            <div
              className="w-full xl:w-[220px] shrink-0 rounded-xl p-4 space-y-3 h-fit"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h3 className="font-heading font-600 text-[12px]" style={{ color: 'var(--text-primary)' }}>Pharmacy</h3>
              <div className="flex xl:flex-col items-center xl:items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[13px] font-mono font-700">{selected.pharmacyName.slice(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-[13px] font-body font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.pharmacyName}</p>
                  <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>{selected.pharmacyOwner}</p>
                </div>
              </div>

              <Badge label={selected.pharmacyPlan} />

              <div className="pt-2 grid grid-cols-2 xl:grid-cols-1 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-body font-600 mb-1" style={{ color: 'var(--text-secondary)' }}>Ticket ID</p>
                  <p className="text-[12px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{selected.id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-body font-600 mb-1" style={{ color: 'var(--text-secondary)' }}>Opened</p>
                  <p className="text-[12px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{timeAgo(selected.date)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-body font-600 mb-1" style={{ color: 'var(--text-secondary)' }}>Internal Note</p>
                <textarea
                  value={note || selected.internalNotes}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-2.5 py-1.5 text-[11px] font-body resize-none outline-none focus:ring-1 focus:ring-purple"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="hidden lg:flex flex-1 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-center">
              <i className="ri-customer-service-2-line text-4xl mb-3 block text-sky-600" />
              <p className="text-[14px] font-body font-medium" style={{ color: 'var(--text-secondary)' }}>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
